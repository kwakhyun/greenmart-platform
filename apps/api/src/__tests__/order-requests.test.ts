import {
  listOrderRequests,
  resetOrderRequestStoreForTests,
  retryOrderRequestWebhooks,
  submitOrderRequest,
  updateOrderRequestStatus,
  type OrderRequestPayload,
} from "../lib/order-requests";
import { resetOutboxDatabaseForTests } from "../lib/order-outbox";
import {
  resetDatabaseConnectionForTests,
  setDatabaseUrlForTests,
} from "../lib/greenmart-db";

const payload: OrderRequestPayload = {
  customer: {
    name: "김테스트",
    phone: "010-1111-2222",
    address: "서울특별시 성동구 테스트로 12",
    note: "문 앞에 놓아주세요.",
  },
  deliverySlot: {
    id: "fri-pm",
    label: "금요일",
    time: "18:00 - 21:00",
    capacity: "9자리",
  },
  subscriptionPlan: {
    id: "weekly",
    title: "매주 받기",
    summary: "식단 루틴에 맞춘 자동 구성",
    discount: "7% 절약",
  },
  items: [
    {
      id: "box-seasonal",
      name: "이번 주 제철 채소 박스",
      unit: "1박스",
      price: 28900,
      quantity: 1,
    },
    {
      id: "salad-kit",
      name: "5분 샐러드 키트",
      unit: "2인분",
      price: 11900,
      quantity: 1,
    },
  ],
  pricing: {
    subtotal: 40800,
    deliveryFee: 0,
    planDiscount: 2856,
    total: 37944,
  },
};

const testDatabaseUrl = process.env.GREENMART_TEST_DATABASE_URL;
const describeWithPostgres = testDatabaseUrl ? describe : describe.skip;

describeWithPostgres("order request pipeline", () => {
  beforeAll(async () => {
    await setDatabaseUrlForTests(testDatabaseUrl!);
  });

  beforeEach(async () => {
    await resetOrderRequestStoreForTests();
    await resetOutboxDatabaseForTests();
  });

  afterAll(async () => {
    await resetDatabaseConnectionForTests();
  });

  it("stores a verified order request without requiring webhook success", async () => {
    const { orderRequest, duplicate } = await submitOrderRequest(payload, {
      idempotencyKey: "order-request-1",
    });

    expect(duplicate).toBe(false);
    expect(orderRequest.orderNumber).toMatch(/^GMF-\d{8}-[A-F0-9]{6}$/);
    expect(orderRequest.webhookSyncStatus).toBe("NOT_CONFIGURED");
    expect(orderRequest.auditTrail.map((event) => event.type)).toEqual(
      expect.arrayContaining([
        "RECEIVED",
        "PRICING_VERIFIED",
        "WEBHOOK_SKIPPED",
      ]),
    );
  });

  it("returns the original request for an idempotent duplicate", async () => {
    const first = await submitOrderRequest(payload, {
      idempotencyKey: "same-request",
    });
    const second = await submitOrderRequest(payload, {
      idempotencyKey: "same-request",
    });

    expect(second.duplicate).toBe(true);
    expect(second.orderRequest.id).toBe(first.orderRequest.id);
    expect(second.orderRequest.auditTrail.at(-1)?.type).toBe(
      "DUPLICATE_REPLAYED",
    );
  });

  it("rejects payloads when client pricing does not match server calculation", async () => {
    await expect(
      submitOrderRequest(
        {
          ...payload,
          pricing: { ...payload.pricing, total: payload.pricing.total + 1 },
        },
        { idempotencyKey: "bad-pricing" },
      ),
    ).rejects.toThrow("서버 가격 검산 결과");
  });

  it("rejects client-side product price tampering even when payload totals match", async () => {
    await expect(
      submitOrderRequest(
        {
          ...payload,
          items: payload.items.map((item) =>
            item.id === "box-seasonal" ? { ...item, price: 1 } : item,
          ),
          pricing: {
            subtotal: 11901,
            deliveryFee: 3000,
            planDiscount: 833,
            total: 14068,
          },
        },
        { idempotencyKey: "tampered-price" },
      ),
    ).rejects.toThrow("상품 가격이 서버 기준과 다릅니다");
  });

  it("enforces allowed operational status transitions", async () => {
    const { orderRequest } = await submitOrderRequest(payload, {
      idempotencyKey: "status-transition",
    });

    await updateOrderRequestStatus(orderRequest.id, "CONFIRMED");

    await expect(
      updateOrderRequestStatus(orderRequest.id, "CONTACTED"),
    ).rejects.toThrow("상태로 변경할 수 없습니다");
  });

  it("summarizes high-risk requests from server-side stock and delivery rules", async () => {
    await submitOrderRequest(
      {
        ...payload,
        deliverySlot: {
          id: "sat-am",
          label: "토요일",
          time: "08:00 - 11:00",
          capacity: "4자리",
        },
        subscriptionPlan: {
          id: "once",
          title: "한 번만 받기",
          summary: "필요할 때 주문",
          discount: "기본가",
        },
        items: [
          {
            id: "milk-yogurt",
            name: "목장 요거트 번들",
            unit: "4개",
            price: 16800,
            quantity: 9,
          },
        ],
        pricing: {
          subtotal: 151200,
          deliveryFee: 0,
          planDiscount: 0,
          total: 151200,
        },
      },
      { idempotencyKey: "high-risk" },
    );

    const result = await listOrderRequests();

    expect(result.summary.highRisk).toBe(1);
    expect(result.items[0].riskReasons).toEqual(
      expect.arrayContaining(["고액 주문 요청", "잔여 배송 슬롯 부족"]),
    );
  });

  it("persists webhook failures in outbox and retries them through the worker", async () => {
    const failedDispatch = jest.fn().mockResolvedValue({ ok: false, status: 503 });
    const { orderRequest } = await submitOrderRequest(payload, {
      idempotencyKey: "webhook-failure",
      webhookUrl: "https://ops.example.test/orders",
      dispatchWebhook: failedDispatch,
    });

    expect(orderRequest.webhookSyncStatus).toBe("FAILED");
    expect(orderRequest.webhookAttempts).toBe(1);
    expect(orderRequest.nextWebhookAttemptAt).toBeDefined();

    const successDispatch = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    const retryResult = await retryOrderRequestWebhooks({
      webhookUrl: "https://ops.example.test/orders",
      dispatchWebhook: successDispatch,
    });
    const listResult = await listOrderRequests();

    expect(retryResult.delivered).toBe(1);
    expect(successDispatch).toHaveBeenCalledTimes(1);
    expect(listResult.items[0].webhookSyncStatus).toBe("DELIVERED");
    expect(listResult.items[0].webhookAttempts).toBe(2);
  });
});
