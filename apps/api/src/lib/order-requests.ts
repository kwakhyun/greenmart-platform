import { createHash, randomUUID } from "crypto";
import { z } from "zod";
import {
  DB_COLLECTIONS,
  getRecord,
  getServiceCatalog,
  listRecords,
  putRecord,
  replaceCollection,
  withDatabaseTransaction,
} from "./greenmart-db";
import {
  createOrderRequestWebhookOutboxEvent,
  getOutboxDeliveryState,
  toOutboxDeliveryState,
  runWebhookOutboxWorker,
} from "./order-outbox";

const orderRequestCustomerSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(8),
  address: z.string().trim().min(5),
  note: z.string().trim().optional(),
});

const deliverySlotSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  time: z.string().min(1),
  capacity: z.string().min(1),
});

const subscriptionPlanSchema = z.object({
  id: z.enum(["once", "weekly", "biweekly"]),
  title: z.string().min(1),
  summary: z.string().min(1),
  discount: z.string().min(1),
});

const orderItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  unit: z.string().min(1),
  price: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
});

const pricingSchema = z.object({
  subtotal: z.number().int().nonnegative(),
  deliveryFee: z.number().int().nonnegative(),
  planDiscount: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export const orderRequestPayloadSchema = z.object({
  customer: orderRequestCustomerSchema,
  deliverySlot: deliverySlotSchema,
  subscriptionPlan: subscriptionPlanSchema,
  items: z.array(orderItemSchema).min(1),
  pricing: pricingSchema,
});

export const orderRequestStatusSchema = z.enum([
  "RECEIVED",
  "CONTACTED",
  "CONFIRMED",
  "CANCELLED",
]);

export type OrderRequestPayload = z.infer<typeof orderRequestPayloadSchema>;
export type OrderRequestStatus = z.infer<typeof orderRequestStatusSchema>;
export type FulfillmentRisk = "LOW" | "MEDIUM" | "HIGH";
export type WebhookSyncStatus =
  | "NOT_CONFIGURED"
  | "PENDING"
  | "DELIVERED"
  | "FAILED";

export interface OrderRequestAuditEvent {
  id: string;
  type:
    | "RECEIVED"
    | "DUPLICATE_REPLAYED"
    | "PRICING_VERIFIED"
    | "STATUS_CHANGED"
    | "WEBHOOK_DELIVERED"
    | "WEBHOOK_FAILED"
    | "WEBHOOK_SKIPPED";
  message: string;
  createdAt: string;
}

export interface OrderRequest {
  id: string;
  orderNumber: string;
  customer: OrderRequestPayload["customer"];
  deliverySlot: OrderRequestPayload["deliverySlot"];
  subscriptionPlan: OrderRequestPayload["subscriptionPlan"];
  items: OrderRequestPayload["items"];
  pricing: OrderRequestPayload["pricing"];
  status: OrderRequestStatus;
  fulfillmentRisk: FulfillmentRisk;
  riskReasons: string[];
  slaDueAt: string;
  webhookSyncStatus: WebhookSyncStatus;
  webhookAttempts: number;
  nextWebhookAttemptAt?: string;
  idempotencyKey: string;
  payloadHash: string;
  acceptedAt: string;
  updatedAt: string;
  auditTrail: OrderRequestAuditEvent[];
}

export interface OrderRequestListParams {
  page?: number;
  size?: number;
  status?: OrderRequestStatus;
  risk?: FulfillmentRisk;
  search?: string;
}

export interface OrderRequestListResponse {
  items: OrderRequest[];
  pagination: {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    total: number;
    received: number;
    contacted: number;
    confirmed: number;
    cancelled: number;
    highRisk: number;
    webhookFailed: number;
    slaBreached: number;
  };
}

type SubmitOrderRequestOptions = {
  idempotencyKey?: string | null;
  webhookUrl?: string;
  dispatchWebhook?: typeof fetch;
};

type OrderRequestRuntimeOptions = {
  webhookUrl?: string;
  dispatchWebhook?: typeof fetch;
};

const STATUS_TRANSITIONS: Record<OrderRequestStatus, OrderRequestStatus[]> = {
  RECEIVED: ["CONTACTED", "CONFIRMED", "CANCELLED"],
  CONTACTED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED"],
  CANCELLED: [],
};

const globalOrderRequests = globalThis as typeof globalThis & {
  __greenmartDisableOrderRequestSeeds?: boolean;
};

async function getOrderRequestRecords() {
  const requests = await listRecords<OrderRequest>(DB_COLLECTIONS.orderRequests);
  if (requests.length > 0) return requests;
  if (globalOrderRequests.__greenmartDisableOrderRequestSeeds) return [];

  const seeds = await createSeedOrderRequests();
  for (const seed of seeds) {
    await putRecord(DB_COLLECTIONS.orderRequests, seed);
  }
  return seeds;
}

async function createSeedOrderRequests(): Promise<OrderRequest[]> {
  const first = await createOrderRequestRecord(
    {
      customer: {
        name: "오세진",
        phone: "010-4123-8821",
        address: "서울특별시 성동구 서울숲길 15",
        note: "공동현관 1204#",
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
          id: "fruit-morning",
          name: "아침 과일 세트",
          unit: "6입",
          price: 24600,
          quantity: 1,
        },
      ],
      pricing: {
        subtotal: 53500,
        deliveryFee: 0,
        planDiscount: 3745,
        total: 49755,
      },
    },
    "seed-order-request-1",
    "2026-06-24T01:40:00.000Z",
  );

  const second = await createOrderRequestRecord(
    {
      customer: {
        name: "문하연",
        phone: "010-9981-5512",
        address: "서울특별시 마포구 월드컵북로 88",
        note: "요거트는 보냉백에 넣어주세요.",
      },
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
    "seed-order-request-2",
    "2026-06-24T02:15:00.000Z",
  );

  second.webhookSyncStatus = "FAILED";
  second.webhookAttempts = 1;
  second.auditTrail.push(
    audit("WEBHOOK_FAILED", "외부 운영 도구 전달 실패 후 재시도 대기 중입니다."),
  );

  return [first, second];
}

function audit(
  type: OrderRequestAuditEvent["type"],
  message: string,
): OrderRequestAuditEvent {
  return {
    id: `evt-${randomUUID()}`,
    type,
    message,
    createdAt: new Date().toISOString(),
  };
}

function stableHash(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex")
    .slice(0, 24);
}

function normalizeIdempotencyKey(payload: OrderRequestPayload, key?: string | null) {
  if (key?.trim()) return key.trim();

  return stableHash({
    customerPhone: payload.customer.phone.replace(/\D/g, ""),
    address: payload.customer.address.trim(),
    deliverySlotId: payload.deliverySlot.id,
    subscriptionPlanId: payload.subscriptionPlan.id,
    items: payload.items
      .map((item) => [item.id, item.quantity, item.price])
      .sort(([left], [right]) => String(left).localeCompare(String(right))),
  });
}

function calculatePricing(payload: OrderRequestPayload) {
  const subtotal = payload.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = subtotal >= 40000 || subtotal === 0 ? 0 : 3000;
  const planDiscount =
    payload.subscriptionPlan.id === "weekly"
      ? Math.floor(subtotal * 0.07)
      : payload.subscriptionPlan.id === "biweekly"
        ? Math.floor(subtotal * 0.04)
        : 0;

  return {
    subtotal,
    deliveryFee,
    planDiscount,
    total: subtotal + deliveryFee - planDiscount,
  };
}

async function getServerProduct(item: OrderRequestPayload["items"][number]) {
  const serviceProduct = (await getServiceCatalog()).products.find(
    (product) => product.id === item.id,
  );
  if (!serviceProduct) {
    throw new Error(`${item.name} 상품은 주문 요청 대상이 아닙니다.`);
  }

  const catalogProduct = await getRecord<{
    id: string;
    name: string;
    salePrice: number;
    status: string;
    volume?: string;
  }>(
    DB_COLLECTIONS.catalogProducts,
    serviceProduct.catalogProductId,
  );

  if (!catalogProduct || catalogProduct.status !== "ACTIVE") {
    throw new Error(`${item.name} 상품은 현재 주문할 수 없습니다.`);
  }

  return { catalogProduct, availableQuantity: serviceProduct.stock };
}

async function verifyAndCanonicalizePayload(
  payload: OrderRequestPayload,
): Promise<OrderRequestPayload> {
  const items = await Promise.all(
    payload.items.map(async (item) => {
      const { catalogProduct } = await getServerProduct(item);

      if (item.price !== catalogProduct.salePrice) {
        throw new Error(`${catalogProduct.name} 상품 가격이 서버 기준과 다릅니다.`);
      }

      return {
        ...item,
        name: catalogProduct.name,
        unit: catalogProduct.volume ?? item.unit,
        price: catalogProduct.salePrice,
      };
    }),
  );
  const canonicalPayload = { ...payload, items };
  const calculated = calculatePricing(canonicalPayload);
  const mismatches = Object.entries(calculated).filter(
    ([key, value]) => payload.pricing[key as keyof typeof calculated] !== value,
  );

  if (mismatches.length > 0) {
    throw new Error("서버 가격 검산 결과와 요청 금액이 일치하지 않습니다.");
  }

  return { ...canonicalPayload, pricing: calculated };
}

async function assessFulfillmentRisk(payload: OrderRequestPayload) {
  const riskReasons: string[] = [];

  for (const item of payload.items) {
    const { availableQuantity: available } = await getServerProduct(item);
    if (item.quantity > available) {
      riskReasons.push(
        `${item.name}: 가용 ${available}개보다 ${item.quantity - available}개 초과`,
      );
    } else if (item.quantity / available >= 0.6) {
      riskReasons.push(`${item.name}: 가용 재고의 60% 이상 요청`);
    }
  }

  if (payload.pricing.total >= 120000) {
    riskReasons.push("고액 주문 요청");
  }
  if (payload.deliverySlot.capacity.startsWith("4")) {
    riskReasons.push("잔여 배송 슬롯 부족");
  }

  const fulfillmentRisk: FulfillmentRisk =
    riskReasons.length >= 2
      ? "HIGH"
      : riskReasons.length === 1
        ? "MEDIUM"
        : "LOW";

  return { fulfillmentRisk, riskReasons };
}

async function createOrderRequestRecord(
  payload: OrderRequestPayload,
  idempotencyKey: string,
  acceptedAt = new Date().toISOString(),
): Promise<OrderRequest> {
  const verifiedPayload = await verifyAndCanonicalizePayload(payload);

  const payloadHash = stableHash(verifiedPayload);
  const datePart = acceptedAt.slice(0, 10).replaceAll("-", "");
  const orderNumber = `GMF-${datePart}-${payloadHash.slice(0, 6).toUpperCase()}`;
  const { fulfillmentRisk, riskReasons } = await assessFulfillmentRisk(verifiedPayload);
  const slaMinutes = fulfillmentRisk === "HIGH" ? 15 : 30;
  const slaDueAt = new Date(
    new Date(acceptedAt).getTime() + slaMinutes * 60_000,
  ).toISOString();

  return {
    id: `orq-${randomUUID()}`,
    orderNumber,
    customer: verifiedPayload.customer,
    deliverySlot: verifiedPayload.deliverySlot,
    subscriptionPlan: verifiedPayload.subscriptionPlan,
    items: verifiedPayload.items,
    pricing: verifiedPayload.pricing,
    status: "RECEIVED",
    fulfillmentRisk,
    riskReasons,
    slaDueAt,
    webhookSyncStatus: "PENDING",
    webhookAttempts: 0,
    idempotencyKey,
    payloadHash,
    acceptedAt,
    updatedAt: acceptedAt,
    auditTrail: [
      audit("RECEIVED", "고객 주문 요청이 접수되었습니다."),
      audit("PRICING_VERIFIED", "서버 가격 검산을 통과했습니다."),
    ],
  };
}

function applyWebhookState(orderRequest: OrderRequest, state: Awaited<ReturnType<typeof getOutboxDeliveryState>>) {
  orderRequest.webhookSyncStatus = state.status;
  orderRequest.webhookAttempts = state.attempts;
  orderRequest.nextWebhookAttemptAt = state.nextAttemptAt;
  orderRequest.updatedAt = new Date().toISOString();
}

async function syncWebhookState(orderRequest: OrderRequest) {
  const state = await getOutboxDeliveryState(orderRequest.id);
  if (!state.event) return;
  applyWebhookState(orderRequest, state);
  await putRecord(DB_COLLECTIONS.orderRequests, orderRequest);
}

async function enqueueAndProcessWebhook(
  orderRequest: OrderRequest,
  options: OrderRequestRuntimeOptions,
) {
  const outboxEvent = createOrderRequestWebhookOutboxEvent({
    aggregateId: orderRequest.id,
    payload: {
      orderNumber: orderRequest.orderNumber,
      customer: orderRequest.customer,
      deliverySlot: orderRequest.deliverySlot,
      subscriptionPlan: orderRequest.subscriptionPlan,
      items: orderRequest.items,
      pricing: orderRequest.pricing,
      acceptedAt: orderRequest.acceptedAt,
    },
    webhookUrl: options.webhookUrl,
  });

  applyWebhookState(orderRequest, toOutboxDeliveryState(outboxEvent));
  await withDatabaseTransaction(async () => {
    await putRecord(DB_COLLECTIONS.orderRequests, orderRequest);
    await putRecord(DB_COLLECTIONS.outboxEvents, outboxEvent);
  });

  if (!options.webhookUrl) {
    orderRequest.auditTrail.push(
      audit("WEBHOOK_SKIPPED", "외부 운영 도구 웹훅이 설정되지 않았습니다."),
    );
    return;
  }

  const result = await runWebhookOutboxWorker({
    aggregateId: orderRequest.id,
    webhookUrl: options.webhookUrl,
    dispatchWebhook: options.dispatchWebhook,
    limit: 1,
  });

  await syncWebhookState(orderRequest);

  if (result.delivered > 0) {
    orderRequest.auditTrail.push(
      audit("WEBHOOK_DELIVERED", "outbox worker가 외부 운영 도구 전달을 완료했습니다."),
    );
  }
  if (result.failed > 0) {
    orderRequest.auditTrail.push(
      audit("WEBHOOK_FAILED", "outbox worker가 전달 실패 후 재시도를 예약했습니다."),
    );
  }
}

export async function submitOrderRequest(
  rawPayload: unknown,
  options: SubmitOrderRequestOptions = {},
) {
  const payload = await verifyAndCanonicalizePayload(
    orderRequestPayloadSchema.parse(rawPayload),
  );
  const requests = await getOrderRequestRecords();
  const idempotencyKey = normalizeIdempotencyKey(payload, options.idempotencyKey);
  const payloadHash = stableHash(payload);
  const duplicate = requests.find(
    (request) => request.idempotencyKey === idempotencyKey,
  );

  if (duplicate) {
    if (duplicate.payloadHash !== payloadHash) {
      throw new Error("같은 중복 방지 키로 다른 주문 요청을 보낼 수 없습니다.");
    }

    duplicate.auditTrail.push(
      audit("DUPLICATE_REPLAYED", "중복 제출이 기존 접수건으로 반환되었습니다."),
    );
    duplicate.updatedAt = new Date().toISOString();
    await putRecord(DB_COLLECTIONS.orderRequests, duplicate);

    return { orderRequest: duplicate, duplicate: true };
  }

  const orderRequest = await createOrderRequestRecord(payload, idempotencyKey);

  await enqueueAndProcessWebhook(orderRequest, options);

  orderRequest.updatedAt = new Date().toISOString();
  await putRecord(DB_COLLECTIONS.orderRequests, orderRequest);

  return { orderRequest, duplicate: false };
}

export async function listOrderRequests(
  params: OrderRequestListParams = {},
  options: OrderRequestRuntimeOptions = {},
): Promise<OrderRequestListResponse> {
  const requests = await getOrderRequestRecords();
  await runWebhookOutboxWorker({
    webhookUrl: options.webhookUrl,
    dispatchWebhook: options.dispatchWebhook,
  });
  await Promise.all(requests.map((request) => syncWebhookState(request)));
  const syncedRequests = await getOrderRequestRecords();

  const page = Math.max(1, params.page ?? 1);
  const size = Math.min(Math.max(1, params.size ?? 20), 100);
  const loweredSearch = params.search?.trim().toLowerCase();
  const now = Date.now();

  let filtered = [...syncedRequests];

  if (params.status) {
    filtered = filtered.filter((request) => request.status === params.status);
  }
  if (params.risk) {
    filtered = filtered.filter(
      (request) => request.fulfillmentRisk === params.risk,
    );
  }
  if (loweredSearch) {
    filtered = filtered.filter((request) =>
      [
        request.orderNumber,
        request.customer.name,
        request.customer.phone,
        request.customer.address,
        request.items.map((item) => item.name).join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(loweredSearch),
    );
  }

  filtered.sort(
    (a, b) => new Date(b.acceptedAt).getTime() - new Date(a.acceptedAt).getTime(),
  );

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / size);
  const start = (page - 1) * size;
  const items = filtered.slice(start, start + size);

  return {
    items,
    pagination: { page, size, totalItems, totalPages },
    summary: {
      total: syncedRequests.length,
      received: syncedRequests.filter((request) => request.status === "RECEIVED")
        .length,
      contacted: syncedRequests.filter((request) => request.status === "CONTACTED")
        .length,
      confirmed: syncedRequests.filter((request) => request.status === "CONFIRMED")
        .length,
      cancelled: syncedRequests.filter((request) => request.status === "CANCELLED")
        .length,
      highRisk: syncedRequests.filter(
        (request) => request.fulfillmentRisk === "HIGH",
      ).length,
      webhookFailed: syncedRequests.filter(
        (request) => request.webhookSyncStatus === "FAILED",
      ).length,
      slaBreached: syncedRequests.filter(
        (request) =>
          request.status === "RECEIVED" &&
          new Date(request.slaDueAt).getTime() < now,
      ).length,
    },
  };
}

export async function updateOrderRequestStatus(
  id: string,
  nextStatus: OrderRequestStatus,
) {
  const orderRequest = await getRecord<OrderRequest>(DB_COLLECTIONS.orderRequests, id);

  if (!orderRequest) {
    throw new Error("주문 요청을 찾을 수 없습니다.");
  }

  if (!STATUS_TRANSITIONS[orderRequest.status].includes(nextStatus)) {
    throw new Error(
      `${orderRequest.status} 상태에서 ${nextStatus} 상태로 변경할 수 없습니다.`,
    );
  }

  const previousStatus = orderRequest.status;
  orderRequest.status = nextStatus;
  orderRequest.updatedAt = new Date().toISOString();
  orderRequest.auditTrail.push(
    audit(
      "STATUS_CHANGED",
      `운영자가 상태를 ${previousStatus}에서 ${nextStatus}로 변경했습니다.`,
    ),
  );
  await putRecord(DB_COLLECTIONS.orderRequests, orderRequest);

  return orderRequest;
}

export async function retryOrderRequestWebhooks(
  options: OrderRequestRuntimeOptions = {},
) {
  const requests = await getOrderRequestRecords();
  const result = await runWebhookOutboxWorker({
    webhookUrl: options.webhookUrl,
    dispatchWebhook: options.dispatchWebhook,
    limit: 50,
    retryBaseDelayMs: 0,
    ignoreSchedule: true,
  });

  await Promise.all(requests.map((request) => syncWebhookState(request)));
  const syncedRequests = await getOrderRequestRecords();

  return {
    ...result,
    webhookFailed: syncedRequests.filter(
      (request) => request.webhookSyncStatus === "FAILED",
    ).length,
  };
}

export async function resetOrderRequestStoreForTests(requests: OrderRequest[] = []) {
  globalOrderRequests.__greenmartDisableOrderRequestSeeds = true;
  await replaceCollection(DB_COLLECTIONS.orderRequests, requests);
}
