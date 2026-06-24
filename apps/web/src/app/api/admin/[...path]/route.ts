import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ProductFormSchema, CustomerFormSchema } from "@greenmart/shared";
import type { Product } from "@greenmart/shared";
import { categories, brands, products } from "@/data/catalog";
import {
  customers,
  coupons,
  promotions,
  customerVoices,
} from "@/data/customer";
import { warehouses, inventoryItems, deliveries } from "@/data/inventory";
import { orders, settlements, dashboardSummary } from "@/data/settlement";

type RouteContext = {
  params: {
    path?: string[];
  };
};

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

function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

function notFound(message: string, code: string) {
  return json({ status: 404, message, code }, { status: 404 });
}

function badRequest(message: string, details?: unknown) {
  return json(
    { status: 400, message, code: "BAD_REQUEST", details },
    { status: 400 },
  );
}

function getPath(context: RouteContext) {
  return context.params.path?.join("/") ?? "";
}

function intParam(
  searchParams: URLSearchParams,
  key: string,
  defaultValue: number,
  maxValue = 100,
) {
  const value = Number(searchParams.get(key) ?? defaultValue);
  if (!Number.isInteger(value) || value < 1) return defaultValue;
  return Math.min(value, maxValue);
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

function findCategoryById(id: string) {
  for (const category of categories) {
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
      items.sort(
        (a, b) => b.reviewSummary.totalCount - a.reviewSummary.totalCount,
      );
      break;
    default:
      items.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }
}

function getProducts(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = intParam(searchParams, "page", 1);
  const size = intParam(searchParams, "size", 12);
  const search = searchParams.get("search")?.toLowerCase();
  const categoryId = searchParams.get("categoryId");
  const brandId = searchParams.get("brandId");
  const tags = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];
  const channels = searchParams.get("channels")?.split(",").filter(Boolean) ?? [];
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sortBy") ?? "latest";

  let filtered = [...products];

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

  if (brandId) {
    filtered = filtered.filter((product) => product.brand.id === brandId);
  }

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

  if (status) {
    filtered = filtered.filter((product) => product.status === status);
  }

  sortProducts(filtered, sortBy);

  return json(paginate(filtered, page, size));
}

async function createProduct(request: NextRequest) {
  const parsed = ProductFormSchema.safeParse(await request.json());
  if (!parsed.success) return badRequest("상품 입력값이 올바르지 않습니다.");

  const brand = brands.find((item) => item.id === parsed.data.brandId);
  const category = findCategoryById(parsed.data.categoryId);

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

  products.push(product);
  return json(product, { status: 201 });
}

async function updateProduct(request: NextRequest, id: string) {
  const productIndex = products.findIndex((product) => product.id === id);
  if (productIndex === -1) {
    return notFound("상품을 찾을 수 없습니다.", "PRODUCT_NOT_FOUND");
  }

  const parsed = ProductFormSchema.safeParse(await request.json());
  if (!parsed.success) return badRequest("상품 입력값이 올바르지 않습니다.");

  const existing = products[productIndex];
  const discountRate =
    parsed.data.originalPrice > parsed.data.salePrice
      ? Math.round((1 - parsed.data.salePrice / parsed.data.originalPrice) * 100)
      : 0;

  products[productIndex] = {
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

  return json(products[productIndex]);
}

function getMembers(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = intParam(searchParams, "page", 1);
  const size = intParam(searchParams, "size", 20);
  const search = searchParams.get("search")?.toLowerCase();
  const grade = searchParams.get("grade");
  const status = searchParams.get("status");
  const joinChannel = searchParams.get("joinChannel");

  let filtered = [...customers];

  if (search) {
    filtered = filtered.filter(
      (customer) =>
        customer.name.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search),
    );
  }
  if (grade) filtered = filtered.filter((customer) => customer.grade === grade);
  if (status) {
    filtered = filtered.filter((customer) => customer.status === status);
  }
  if (joinChannel) {
    filtered = filtered.filter(
      (customer) => customer.joinChannel === joinChannel,
    );
  }

  return json({
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

async function createMember(request: NextRequest) {
  const parsed = CustomerFormSchema.safeParse(await request.json());
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

  customers.push(customer);
  return json(customer, { status: 201 });
}

function getOrders(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = intParam(searchParams, "page", 1);
  const size = intParam(searchParams, "size", 20);
  const search = searchParams.get("search")?.toLowerCase();
  const status = searchParams.get("status");
  const paymentMethod = searchParams.get("paymentMethod");

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

  return json({
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

function getSettlements(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get("period");
  const partnerId = searchParams.get("partnerId");
  const status = searchParams.get("status");

  let filtered = [...settlements];

  if (period) filtered = filtered.filter((settlement) => settlement.period === period);
  if (partnerId) {
    filtered = filtered.filter((settlement) => settlement.partnerId === partnerId);
  }
  if (status) {
    filtered = filtered.filter((settlement) => settlement.status === status);
  }

  return json({
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

function getStock(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const warehouseId = searchParams.get("warehouseId");
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.toLowerCase();

  let filtered = [...inventoryItems];

  if (warehouseId) {
    filtered = filtered.filter((item) => item.warehouseId === warehouseId);
  }
  if (status) filtered = filtered.filter((item) => item.status === status);
  if (search) {
    filtered = filtered.filter(
      (item) =>
        item.productName.toLowerCase().includes(search) ||
        item.sku.toLowerCase().includes(search),
    );
  }

  return json({
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

function getDeliveries(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  let filtered = [...deliveries];
  if (status) filtered = filtered.filter((delivery) => delivery.status === status);
  if (type) filtered = filtered.filter((delivery) => delivery.type === type);

  return json(filtered);
}

function getVoc(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");

  let filtered = [...customerVoices];
  if (type) filtered = filtered.filter((item) => item.type === type);
  if (status) filtered = filtered.filter((item) => item.status === status);
  if (priority) filtered = filtered.filter((item) => item.priority === priority);

  return json({
    items: filtered,
    summary: {
      total: customerVoices.length,
      pending: customerVoices.filter((item) => item.status === "PENDING").length,
      inProgress: customerVoices.filter(
        (item) => item.status === "IN_PROGRESS",
      ).length,
      resolved: customerVoices.filter(
        (item) => item.status === "RESOLVED" || item.status === "CLOSED",
      ).length,
    },
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  const path = getPath(context);
  const segments = context.params.path ?? [];

  if (path === "catalog/products") return getProducts(request);
  if (path === "catalog/categories") return json(categories);
  if (path === "catalog/brands") return json(brands);
  if (segments[0] === "catalog" && segments[1] === "products" && segments[2]) {
    const product = products.find((item) => item.id === segments[2]);
    return product
      ? json(product)
      : notFound("상품을 찾을 수 없습니다.", "PRODUCT_NOT_FOUND");
  }

  if (path === "customer/members") return getMembers(request);
  if (segments[0] === "customer" && segments[1] === "members" && segments[2]) {
    const customer = customers.find((item) => item.id === segments[2]);
    return customer
      ? json(customer)
      : notFound("회원을 찾을 수 없습니다.", "CUSTOMER_NOT_FOUND");
  }
  if (path === "customer/promotions") {
    const activeOnly = request.nextUrl.searchParams.get("active") === "true";
    return json(
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
    const promotion = promotions.find((item) => item.id === segments[2]);
    return promotion
      ? json(promotion)
      : notFound("프로모션을 찾을 수 없습니다.", "PROMOTION_NOT_FOUND");
  }
  if (path === "customer/coupons") return json(coupons);
  if (path === "customer/voc") return getVoc(request);
  if (segments[0] === "customer" && segments[1] === "voc" && segments[2]) {
    const voc = customerVoices.find((item) => item.id === segments[2]);
    return voc ? json(voc) : notFound("VOC를 찾을 수 없습니다.", "VOC_NOT_FOUND");
  }

  if (path === "inventory/warehouses") return json(warehouses);
  if (path === "inventory/stock") return getStock(request);
  if (path === "inventory/deliveries") return getDeliveries(request);
  if (
    segments[0] === "inventory" &&
    segments[1] === "deliveries" &&
    segments[2]
  ) {
    const delivery = deliveries.find((item) => item.id === segments[2]);
    return delivery
      ? json(delivery)
      : notFound("배송 정보를 찾을 수 없습니다.", "DELIVERY_NOT_FOUND");
  }

  if (path === "settlement/orders") return getOrders(request);
  if (
    segments[0] === "settlement" &&
    segments[1] === "orders" &&
    segments[2]
  ) {
    const order = orders.find((item) => item.id === segments[2]);
    return order
      ? json(order)
      : notFound("주문을 찾을 수 없습니다.", "ORDER_NOT_FOUND");
  }
  if (path === "settlement/settlements") return getSettlements(request);
  if (
    segments[0] === "settlement" &&
    segments[1] === "settlements" &&
    segments[2]
  ) {
    const settlement = settlements.find((item) => item.id === segments[2]);
    return settlement
      ? json(settlement)
      : notFound("정산 내역을 찾을 수 없습니다.", "SETTLEMENT_NOT_FOUND");
  }
  if (path === "settlement/dashboard") return json(dashboardSummary);

  return notFound("관리자 API 경로를 찾을 수 없습니다.", "ADMIN_API_NOT_FOUND");
}

export async function POST(request: NextRequest, context: RouteContext) {
  const path = getPath(context);
  if (path === "catalog/products") return createProduct(request);
  if (path === "customer/members") return createMember(request);

  return notFound("관리자 API 경로를 찾을 수 없습니다.", "ADMIN_API_NOT_FOUND");
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const segments = context.params.path ?? [];
  if (segments[0] === "catalog" && segments[1] === "products" && segments[2]) {
    return updateProduct(request, segments[2]);
  }

  return notFound("관리자 API 경로를 찾을 수 없습니다.", "ADMIN_API_NOT_FOUND");
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const segments = context.params.path ?? [];
  if (
    segments[0] === "settlement" &&
    segments[1] === "orders" &&
    segments[2] &&
    segments[3] === "status"
  ) {
    const order = orders.find((item) => item.id === segments[2]);
    if (!order) return notFound("주문을 찾을 수 없습니다.", "ORDER_NOT_FOUND");

    const parsed = OrderStatusUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest("주문 상태가 올바르지 않습니다.");

    order.status = parsed.data.status;
    return json(order);
  }

  return notFound("관리자 API 경로를 찾을 수 없습니다.", "ADMIN_API_NOT_FOUND");
}

export function DELETE(_request: NextRequest, context: RouteContext) {
  const segments = context.params.path ?? [];

  if (segments[0] === "catalog" && segments[1] === "products" && segments[2]) {
    const index = products.findIndex((product) => product.id === segments[2]);
    if (index === -1) {
      return notFound("상품을 찾을 수 없습니다.", "PRODUCT_NOT_FOUND");
    }
    const deleted = products.splice(index, 1)[0];
    return json({ message: "상품이 삭제되었습니다.", id: deleted.id });
  }

  if (segments[0] === "customer" && segments[1] === "members" && segments[2]) {
    const index = customers.findIndex((customer) => customer.id === segments[2]);
    if (index === -1) {
      return notFound("회원을 찾을 수 없습니다.", "CUSTOMER_NOT_FOUND");
    }
    const deleted = customers.splice(index, 1)[0];
    return json({ message: "회원이 삭제되었습니다.", id: deleted.id });
  }

  return notFound("관리자 API 경로를 찾을 수 없습니다.", "ADMIN_API_NOT_FOUND");
}
