import { Injectable } from "@nestjs/common";
import { z } from "zod";
import type {
  Brand,
  Category,
  Customer,
  CustomerVoice,
  Delivery,
  InventoryItem,
  Order,
  Product,
  Settlement,
} from "@greenmart/shared";
import { CustomerFormSchema, ProductFormSchema } from "../../lib/admin-schemas";
import {
  DB_COLLECTIONS,
  deleteRecord,
  getRecord,
  listRecords,
  putRecord,
} from "../../lib/greenmart-db";
import {
  listOrderRequests,
  orderRequestStatusSchema,
  retryOrderRequestWebhooks,
  updateOrderRequestStatus,
} from "../../lib/order-requests";

type ApiResult = {
  status: number;
  body: unknown;
};

type QueryValue = string | string[] | undefined;
type Query = Record<string, QueryValue>;

const OrderStatusUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
  ]),
});

const OrderRequestStatusUpdateSchema = z.object({
  status: orderRequestStatusSchema,
});

function ok(body: unknown, status = 200): ApiResult {
  return { status, body };
}

function notFound(message: string, code: string): ApiResult {
  return ok({ status: 404, message, code }, 404);
}

function badRequest(message: string, details?: unknown): ApiResult {
  return ok({ status: 400, message, code: "BAD_REQUEST", details }, 400);
}

function first(value: QueryValue) {
  return Array.isArray(value) ? value[0] : value;
}

function intParam(query: Query, key: string, defaultValue: number, maxValue = 100) {
  const value = Number(first(query[key]) ?? defaultValue);
  if (!Number.isInteger(value) || value < 1) return defaultValue;
  return Math.min(value, maxValue);
}

function splitParam(query: Query, key: string) {
  return first(query[key])?.split(",").filter(Boolean) ?? [];
}

function paginate<T>(items: T[], page: number, size: number) {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / size);
  const start = (page - 1) * size;

  return {
    items: items.slice(start, start + size),
    pagination: { page, size, totalItems, totalPages },
  };
}

function findCategoryById(items: Category[], id: string) {
  for (const category of items) {
    if (category.id === id) return category;
    const child = category.children?.find((item) => item.id === id);
    if (child) return child;
  }
  return null;
}

function sortProducts(items: Product[], sortBy: string) {
  switch (sortBy) {
    case "price_asc":
      items.sort((a, b) => a.salePrice - b.salePrice);
      break;
    case "price_desc":
      items.sort((a, b) => b.salePrice - a.salePrice);
      break;
    case "rating":
      items.sort(
        (a, b) => b.reviewSummary.averageRating - a.reviewSummary.averageRating,
      );
      break;
    case "reviews":
      items.sort((a, b) => b.reviewSummary.totalCount - a.reviewSummary.totalCount);
      break;
    default:
      items.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }
}

@Injectable()
export class AdminService {
  async get(path: string, query: Query): Promise<ApiResult> {
    const segments = path.split("/").filter(Boolean);

    if (path === "catalog/products") return this.getProducts(query);
    if (path === "catalog/categories") {
      return ok(await listRecords<Category>(DB_COLLECTIONS.catalogCategories));
    }
    if (path === "catalog/brands") {
      return ok(await listRecords<Brand>(DB_COLLECTIONS.catalogBrands));
    }
    if (segments[0] === "catalog" && segments[1] === "products" && segments[2]) {
      const product = await getRecord<Product>(
        DB_COLLECTIONS.catalogProducts,
        segments[2],
      );
      return product
        ? ok(product)
        : notFound("상품을 찾을 수 없습니다.", "PRODUCT_NOT_FOUND");
    }

    if (path === "customer/members") return this.getMembers(query);
    if (segments[0] === "customer" && segments[1] === "members" && segments[2]) {
      const customer = await getRecord<Customer>(
        DB_COLLECTIONS.customerMembers,
        segments[2],
      );
      return customer
        ? ok(customer)
        : notFound("회원을 찾을 수 없습니다.", "CUSTOMER_NOT_FOUND");
    }
    if (path === "customer/promotions") {
      const activeOnly = first(query.active) === "true";
      const promotions = await listRecords<{ isActive: boolean }>(
        DB_COLLECTIONS.customerPromotions,
      );
      return ok(
        activeOnly
          ? promotions.filter((promotion) => promotion.isActive)
          : promotions,
      );
    }
    if (
      segments[0] === "customer" &&
      segments[1] === "promotions" &&
      segments[2]
    ) {
      const promotion = await getRecord(
        DB_COLLECTIONS.customerPromotions,
        segments[2],
      );
      return promotion
        ? ok(promotion)
        : notFound("프로모션을 찾을 수 없습니다.", "PROMOTION_NOT_FOUND");
    }
    if (path === "customer/coupons") {
      return ok(await listRecords(DB_COLLECTIONS.customerCoupons));
    }
    if (path === "customer/voc") return this.getVoc(query);
    if (segments[0] === "customer" && segments[1] === "voc" && segments[2]) {
      const voc = await getRecord(DB_COLLECTIONS.customerVoc, segments[2]);
      return voc ? ok(voc) : notFound("VOC를 찾을 수 없습니다.", "VOC_NOT_FOUND");
    }

    if (path === "inventory/warehouses") {
      return ok(await listRecords(DB_COLLECTIONS.inventoryWarehouses));
    }
    if (path === "inventory/stock") return this.getStock(query);
    if (path === "inventory/deliveries") return this.getDeliveries(query);
    if (
      segments[0] === "inventory" &&
      segments[1] === "deliveries" &&
      segments[2]
    ) {
      const delivery = await getRecord(DB_COLLECTIONS.inventoryDeliveries, segments[2]);
      return delivery
        ? ok(delivery)
        : notFound("배송 정보를 찾을 수 없습니다.", "DELIVERY_NOT_FOUND");
    }

    if (path === "settlement/order-requests") return this.getOrderRequests(query);
    if (path === "settlement/orders") return this.getOrders(query);
    if (
      segments[0] === "settlement" &&
      segments[1] === "orders" &&
      segments[2]
    ) {
      const order = await getRecord(DB_COLLECTIONS.settlementOrders, segments[2]);
      return order
        ? ok(order)
        : notFound("주문을 찾을 수 없습니다.", "ORDER_NOT_FOUND");
    }
    if (path === "settlement/settlements") return this.getSettlements(query);
    if (
      segments[0] === "settlement" &&
      segments[1] === "settlements" &&
      segments[2]
    ) {
      const settlement = await getRecord(
        DB_COLLECTIONS.settlementSettlements,
        segments[2],
      );
      return settlement
        ? ok(settlement)
        : notFound("정산 내역을 찾을 수 없습니다.", "SETTLEMENT_NOT_FOUND");
    }
    if (path === "settlement/dashboard") {
      return ok(await getRecord(DB_COLLECTIONS.settlementDashboard, "summary"));
    }

    return notFound("관리자 API 경로를 찾을 수 없습니다.", "ADMIN_API_NOT_FOUND");
  }

  async post(path: string, body: unknown): Promise<ApiResult> {
    if (path === "catalog/products") return this.createProduct(body);
    if (path === "customer/members") return this.createMember(body);
    if (path === "settlement/order-requests/outbox/retry") {
      return ok(
        await retryOrderRequestWebhooks({
          webhookUrl: process.env.GREENMART_ORDER_WEBHOOK_URL,
        }),
      );
    }
    return notFound("관리자 API 경로를 찾을 수 없습니다.", "ADMIN_API_NOT_FOUND");
  }

  async put(path: string, body: unknown): Promise<ApiResult> {
    const segments = path.split("/").filter(Boolean);
    if (segments[0] === "catalog" && segments[1] === "products" && segments[2]) {
      return this.updateProduct(segments[2], body);
    }
    return notFound("관리자 API 경로를 찾을 수 없습니다.", "ADMIN_API_NOT_FOUND");
  }

  async patch(path: string, body: unknown): Promise<ApiResult> {
    const segments = path.split("/").filter(Boolean);
    if (
      segments[0] === "settlement" &&
      segments[1] === "order-requests" &&
      segments[2] &&
      segments[3] === "status"
    ) {
      const parsed = OrderRequestStatusUpdateSchema.safeParse(body);
      if (!parsed.success) return badRequest("주문 요청 상태가 올바르지 않습니다.");

      try {
        return ok(await updateOrderRequestStatus(segments[2], parsed.data.status));
      } catch (error) {
        return badRequest(
          error instanceof Error
            ? error.message
            : "주문 요청 상태를 변경하지 못했습니다.",
        );
      }
    }

    if (
      segments[0] === "settlement" &&
      segments[1] === "orders" &&
      segments[2] &&
      segments[3] === "status"
    ) {
      const order = await getRecord<Order>(DB_COLLECTIONS.settlementOrders, segments[2]);
      if (!order) return notFound("주문을 찾을 수 없습니다.", "ORDER_NOT_FOUND");

      const parsed = OrderStatusUpdateSchema.safeParse(body);
      if (!parsed.success) return badRequest("주문 상태가 올바르지 않습니다.");

      order.status = parsed.data.status;
      await putRecord(DB_COLLECTIONS.settlementOrders, order);
      return ok(order);
    }

    return notFound("관리자 API 경로를 찾을 수 없습니다.", "ADMIN_API_NOT_FOUND");
  }

  async delete(path: string): Promise<ApiResult> {
    const segments = path.split("/").filter(Boolean);

    if (segments[0] === "catalog" && segments[1] === "products" && segments[2]) {
      const deleted = await getRecord<Product>(
        DB_COLLECTIONS.catalogProducts,
        segments[2],
      );
      if (!deleted) return notFound("상품을 찾을 수 없습니다.", "PRODUCT_NOT_FOUND");
      await deleteRecord(DB_COLLECTIONS.catalogProducts, segments[2]);
      return ok({ message: "상품이 삭제되었습니다.", id: deleted.id });
    }

    if (segments[0] === "customer" && segments[1] === "members" && segments[2]) {
      const deleted = await getRecord<Customer>(
        DB_COLLECTIONS.customerMembers,
        segments[2],
      );
      if (!deleted) return notFound("회원을 찾을 수 없습니다.", "CUSTOMER_NOT_FOUND");
      await deleteRecord(DB_COLLECTIONS.customerMembers, segments[2]);
      return ok({ message: "회원이 삭제되었습니다.", id: deleted.id });
    }

    return notFound("관리자 API 경로를 찾을 수 없습니다.", "ADMIN_API_NOT_FOUND");
  }

  private async getProducts(query: Query) {
    const page = intParam(query, "page", 1);
    const size = intParam(query, "size", 12);
    const search = first(query.search)?.toLowerCase();
    const categoryId = first(query.categoryId);
    const brandId = first(query.brandId);
    const tags = splitParam(query, "tags");
    const channels = splitParam(query, "channels");
    const status = first(query.status);
    const sortBy = first(query.sortBy) ?? "latest";

    let filtered = await listRecords<Product>(DB_COLLECTIONS.catalogProducts);

    if (search) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(search) ||
          product.brand.name.toLowerCase().includes(search) ||
          product.category.name.toLowerCase().includes(search),
      );
    }
    if (categoryId) {
      filtered = filtered.filter((product) => product.category.id === categoryId);
    }
    if (brandId) filtered = filtered.filter((product) => product.brand.id === brandId);
    if (tags.length > 0) {
      filtered = filtered.filter((product) =>
        tags.some((tag) => product.tags.includes(tag as Product["tags"][number])),
      );
    }
    if (channels.length > 0) {
      filtered = filtered.filter((product) =>
        channels.some((channel) =>
          product.salesChannels.includes(
            channel as Product["salesChannels"][number],
          ),
        ),
      );
    }
    if (status) filtered = filtered.filter((product) => product.status === status);

    sortProducts(filtered, sortBy);
    return ok(paginate(filtered, page, size));
  }

  private async createProduct(body: unknown) {
    const parsed = ProductFormSchema.safeParse(body);
    if (!parsed.success) return badRequest("상품 입력값이 올바르지 않습니다.");

    const brand = await getRecord<Brand>(DB_COLLECTIONS.catalogBrands, parsed.data.brandId);
    const category = findCategoryById(
      await listRecords<Category>(DB_COLLECTIONS.catalogCategories),
      parsed.data.categoryId,
    );
    if (!brand || !category) {
      return badRequest("유효하지 않은 브랜드 또는 카테고리입니다.");
    }

    const discountRate =
      parsed.data.originalPrice > parsed.data.salePrice
        ? Math.round((1 - parsed.data.salePrice / parsed.data.originalPrice) * 100)
        : 0;

    const product: Product = {
      id: `prod-${Date.now()}`,
      name: parsed.data.name,
      slug: parsed.data.name.replace(/\s+/g, "-").toLowerCase(),
      brand,
      category,
      description: parsed.data.description,
      shortDescription: parsed.data.shortDescription,
      originalPrice: parsed.data.originalPrice,
      salePrice: parsed.data.salePrice,
      discountRate,
      images: [],
      options: [],
      tags: parsed.data.tags,
      salesChannels: parsed.data.salesChannels,
      status: parsed.data.status,
      reviewSummary: {
        averageRating: 0,
        totalCount: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      volume: parsed.data.volume,
      skinType: parsed.data.skinType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await putRecord(DB_COLLECTIONS.catalogProducts, product);
    return ok(product, 201);
  }

  private async updateProduct(id: string, body: unknown) {
    const existing = await getRecord<Product>(DB_COLLECTIONS.catalogProducts, id);
    if (!existing) return notFound("상품을 찾을 수 없습니다.", "PRODUCT_NOT_FOUND");

    const parsed = ProductFormSchema.safeParse(body);
    if (!parsed.success) return badRequest("상품 입력값이 올바르지 않습니다.");

    const discountRate =
      parsed.data.originalPrice > parsed.data.salePrice
        ? Math.round((1 - parsed.data.salePrice / parsed.data.originalPrice) * 100)
        : 0;

    const updatedProduct: Product = {
      ...existing,
      name: parsed.data.name,
      description: parsed.data.description,
      shortDescription: parsed.data.shortDescription,
      originalPrice: parsed.data.originalPrice,
      salePrice: parsed.data.salePrice,
      discountRate,
      tags: parsed.data.tags,
      salesChannels: parsed.data.salesChannels,
      status: parsed.data.status,
      volume: parsed.data.volume,
      skinType: parsed.data.skinType,
      updatedAt: new Date().toISOString(),
    };

    await putRecord(DB_COLLECTIONS.catalogProducts, updatedProduct);
    return ok(updatedProduct);
  }

  private async getMembers(query: Query) {
    const page = intParam(query, "page", 1);
    const size = intParam(query, "size", 20);
    const search = first(query.search)?.toLowerCase();
    const grade = first(query.grade);
    const status = first(query.status);
    const joinChannel = first(query.joinChannel);

    const customers = await listRecords<Customer>(DB_COLLECTIONS.customerMembers);
    let filtered = [...customers];

    if (search) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(search) ||
          customer.email.toLowerCase().includes(search),
      );
    }
    if (grade) filtered = filtered.filter((customer) => customer.grade === grade);
    if (status) filtered = filtered.filter((customer) => customer.status === status);
    if (joinChannel) {
      filtered = filtered.filter((customer) => customer.joinChannel === joinChannel);
    }

    return ok({
      ...paginate(filtered, page, size),
      summary: {
        total: customers.length,
        PLATINUM: customers.filter((customer) => customer.grade === "PLATINUM")
          .length,
        GOLD: customers.filter((customer) => customer.grade === "GOLD").length,
        SILVER: customers.filter((customer) => customer.grade === "SILVER").length,
        BRONZE: customers.filter((customer) => customer.grade === "BRONZE").length,
      },
    });
  }

  private async createMember(body: unknown) {
    const parsed = CustomerFormSchema.safeParse(body);
    if (!parsed.success) return badRequest("회원 입력값이 올바르지 않습니다.");

    const customer = {
      id: `cust-${Date.now()}`,
      email: parsed.data.email,
      name: parsed.data.name,
      phone: parsed.data.phone,
      grade: parsed.data.grade,
      status: parsed.data.status,
      joinChannel: parsed.data.joinChannel,
      points: 0,
      coupons: 0,
      totalPurchaseAmount: 0,
      totalOrders: 0,
      lastLoginAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
    };

    await putRecord(DB_COLLECTIONS.customerMembers, customer);
    return ok(customer, 201);
  }

  private async getOrders(query: Query) {
    const page = intParam(query, "page", 1);
    const size = intParam(query, "size", 20);
    const search = first(query.search)?.toLowerCase();
    const status = first(query.status);
    const paymentMethod = first(query.paymentMethod);

    const orders = await listRecords<Order>(DB_COLLECTIONS.settlementOrders);
    let filtered = [...orders];

    if (status) filtered = filtered.filter((order) => order.status === status);
    if (paymentMethod) {
      filtered = filtered.filter((order) => order.paymentMethod === paymentMethod);
    }
    if (search) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(search) ||
          order.customerName.toLowerCase().includes(search),
      );
    }

    return ok({
      ...paginate(filtered, page, size),
      statusCounts: {
        total: orders.length,
        PENDING: orders.filter((order) => order.status === "PENDING").length,
        CONFIRMED: orders.filter((order) => order.status === "CONFIRMED").length,
        PROCESSING: orders.filter((order) => order.status === "PROCESSING").length,
        DELIVERED: orders.filter((order) => order.status === "DELIVERED").length,
        CANCELLED: orders.filter((order) => order.status === "CANCELLED").length,
      },
    });
  }

  private async getOrderRequests(query: Query) {
    const status = orderRequestStatusSchema
      .optional()
      .safeParse(first(query.status) || undefined);
    const risk = z
      .enum(["LOW", "MEDIUM", "HIGH"])
      .optional()
      .safeParse(first(query.risk) || undefined);

    if (!status.success || !risk.success) {
      return badRequest("주문 요청 필터가 올바르지 않습니다.");
    }

    return ok(
      await listOrderRequests(
        {
          page: intParam(query, "page", 1),
          size: intParam(query, "size", 10),
          status: status.data,
          risk: risk.data,
          search: first(query.search),
        },
        { webhookUrl: process.env.GREENMART_ORDER_WEBHOOK_URL },
      ),
    );
  }

  private async getSettlements(query: Query) {
    const period = first(query.period);
    const partnerId = first(query.partnerId);
    const status = first(query.status);

    let filtered = await listRecords<Settlement>(DB_COLLECTIONS.settlementSettlements);
    if (period) filtered = filtered.filter((settlement) => settlement.period === period);
    if (partnerId) {
      filtered = filtered.filter((settlement) => settlement.partnerId === partnerId);
    }
    if (status) filtered = filtered.filter((settlement) => settlement.status === status);

    return ok({
      items: filtered,
      summary: {
        totalSales: filtered.reduce(
          (sum, settlement) => sum + settlement.totalSales,
          0,
        ),
        totalRefunds: filtered.reduce(
          (sum, settlement) => sum + settlement.totalRefunds,
          0,
        ),
        totalCommission: filtered.reduce(
          (sum, settlement) => sum + settlement.commissionAmount,
          0,
        ),
        totalNet: filtered.reduce((sum, settlement) => sum + settlement.netAmount, 0),
      },
    });
  }

  private async getStock(query: Query) {
    const warehouseId = first(query.warehouseId);
    const status = first(query.status);
    const search = first(query.search)?.toLowerCase();

    const inventoryItems = await listRecords<InventoryItem>(
      DB_COLLECTIONS.inventoryStock,
    );
    let filtered = [...inventoryItems];

    if (warehouseId) filtered = filtered.filter((item) => item.warehouseId === warehouseId);
    if (status) filtered = filtered.filter((item) => item.status === status);
    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.productName.toLowerCase().includes(search) ||
          item.sku.toLowerCase().includes(search),
      );
    }

    return ok({
      items: filtered,
      summary: {
        total: inventoryItems.length,
        lowStock: inventoryItems.filter((item) => item.status === "LOW_STOCK")
          .length,
        outOfStock: inventoryItems.filter((item) => item.status === "OUT_OF_STOCK")
          .length,
      },
    });
  }

  private async getDeliveries(query: Query) {
    const status = first(query.status);
    const type = first(query.type);

    let filtered = await listRecords<Delivery>(DB_COLLECTIONS.inventoryDeliveries);
    if (status) filtered = filtered.filter((delivery) => delivery.status === status);
    if (type) filtered = filtered.filter((delivery) => delivery.type === type);

    return ok(filtered);
  }

  private async getVoc(query: Query) {
    const type = first(query.type);
    const status = first(query.status);
    const priority = first(query.priority);

    const customerVoices = await listRecords<CustomerVoice>(DB_COLLECTIONS.customerVoc);
    let filtered = [...customerVoices];
    if (type) filtered = filtered.filter((item) => item.type === type);
    if (status) filtered = filtered.filter((item) => item.status === status);
    if (priority) filtered = filtered.filter((item) => item.priority === priority);

    return ok({
      items: filtered,
      summary: {
        total: customerVoices.length,
        pending: customerVoices.filter((item) => item.status === "PENDING").length,
        inProgress: customerVoices.filter((item) => item.status === "IN_PROGRESS")
          .length,
        resolved: customerVoices.filter(
          (item) => item.status === "RESOLVED" || item.status === "CLOSED",
        ).length,
      },
    });
  }
}
