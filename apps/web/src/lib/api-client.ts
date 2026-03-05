import type {
  Product,
  Category,
  Brand,
  Customer,
  Promotion,
  Coupon,
  CustomerVoice,
  Order,
  OrderStatus,
  Settlement,
  DashboardSummary,
  Warehouse,
  InventoryItem,
  Delivery,
  PaginatedResponse,
  ApiErrorResponse,
} from "@greenmart/shared";
import type { CustomerFormData, ProductFormData } from "@greenmart/shared";

// ============================================================
// API Client — 프론트엔드에서 백엔드 API 호출
// ============================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error: ApiErrorResponse = await res.json().catch(() => ({
      status: res.status,
      message: res.statusText,
      code: "UNKNOWN_ERROR",
    }));
    throw new ApiClientError(
      error.status,
      error.code,
      error.message,
      error.details,
    );
  }

  return res.json() as Promise<T>;
}

// ============================================================
// Catalog API
// ============================================================

export interface ProductListParams {
  page?: number;
  size?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  tags?: string;
  channels?: string;
  status?: string;
  sortBy?: string;
}

function toQueryString(
  params: Record<string, string | number | undefined>,
): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "",
  );
  if (entries.length === 0) return "";
  return (
    "?" +
    new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
  );
}

export const catalogApi = {
  getProducts(
    params: ProductListParams = {},
  ): Promise<PaginatedResponse<Product>> {
    return fetchApi<PaginatedResponse<Product>>(
      `/catalog/products${toQueryString(params as Record<string, string | number | undefined>)}`,
    );
  },

  getProductById(id: string): Promise<Product> {
    return fetchApi<Product>(`/catalog/products/${id}`);
  },

  getCategories(): Promise<Category[]> {
    return fetchApi<Category[]>("/catalog/categories");
  },

  getBrands(): Promise<Brand[]> {
    return fetchApi<Brand[]>("/catalog/brands");
  },

  createProduct(data: ProductFormData): Promise<Product> {
    return fetchApi<Product>("/catalog/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateProduct(id: string, data: ProductFormData): Promise<Product> {
    return fetchApi<Product>(`/catalog/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteProduct(id: string): Promise<{ message: string; id: string }> {
    return fetchApi<{ message: string; id: string }>(
      `/catalog/products/${id}`,
      { method: "DELETE" },
    );
  },
};

// ============================================================
// Customer API
// ============================================================

export interface MemberListParams {
  page?: number;
  size?: number;
  search?: string;
  grade?: string;
  status?: string;
  joinChannel?: string;
}

export interface MemberListResponse {
  items: Customer[];
  pagination: {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    total: number;
    PLATINUM: number;
    GOLD: number;
    SILVER: number;
    BRONZE: number;
  };
}

export const customerApi = {
  getMembers(params: MemberListParams = {}): Promise<MemberListResponse> {
    return fetchApi<MemberListResponse>(
      `/customer/members${toQueryString(params as Record<string, string | number | undefined>)}`,
    );
  },

  getMemberById(id: string): Promise<Customer> {
    return fetchApi<Customer>(`/customer/members/${id}`);
  },

  createMember(data: CustomerFormData): Promise<Customer> {
    return fetchApi<Customer>("/customer/members", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deleteMember(id: string): Promise<{ message: string; id: string }> {
    return fetchApi<{ message: string; id: string }>(
      `/customer/members/${id}`,
      { method: "DELETE" },
    );
  },
};

// ============================================================
// Settlement (Order) API
// ============================================================

export interface OrderListParams {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
  paymentMethod?: string;
}

export interface OrderListResponse {
  items: Order[];
  pagination: {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
  };
  statusCounts: Record<string, number>;
}

export const orderApi = {
  getOrders(params: OrderListParams = {}): Promise<OrderListResponse> {
    return fetchApi<OrderListResponse>(
      `/settlement/orders${toQueryString(params as Record<string, string | number | undefined>)}`,
    );
  },

  getOrderById(id: string): Promise<Order> {
    return fetchApi<Order>(`/settlement/orders/${id}`);
  },

  updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return fetchApi<Order>(`/settlement/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};

// ============================================================
// Settlement API (정산)
// ============================================================

export interface SettlementListParams {
  period?: string;
  partnerId?: string;
  status?: string;
}

export interface SettlementListResponse {
  items: Settlement[];
  summary: {
    totalSales: number;
    totalRefunds: number;
    totalCommission: number;
    totalNet: number;
  };
}

export const settlementApi = {
  getSettlements(
    params: SettlementListParams = {},
  ): Promise<SettlementListResponse> {
    return fetchApi<SettlementListResponse>(
      `/settlement/settlements${toQueryString(params as Record<string, string | number | undefined>)}`,
    );
  },

  getSettlement(id: string): Promise<Settlement> {
    return fetchApi<Settlement>(`/settlement/settlements/${id}`);
  },

  getDashboard(): Promise<DashboardSummary> {
    return fetchApi<DashboardSummary>("/settlement/dashboard");
  },
};

// ============================================================
// Inventory API (재고/배송)
// ============================================================

export interface StockListParams {
  warehouseId?: string;
  status?: string;
  search?: string;
}

export interface StockListResponse {
  items: InventoryItem[];
  summary: { total: number; lowStock: number; outOfStock: number };
}

export interface DeliveryListParams {
  status?: string;
  type?: string;
}

export const inventoryApi = {
  getWarehouses(): Promise<Warehouse[]> {
    return fetchApi<Warehouse[]>("/inventory/warehouses");
  },

  getStock(params: StockListParams = {}): Promise<StockListResponse> {
    return fetchApi<StockListResponse>(
      `/inventory/stock${toQueryString(params as Record<string, string | number | undefined>)}`,
    );
  },

  getDeliveries(params: DeliveryListParams = {}): Promise<Delivery[]> {
    return fetchApi<Delivery[]>(
      `/inventory/deliveries${toQueryString(params as Record<string, string | number | undefined>)}`,
    );
  },

  getDeliveryById(id: string): Promise<Delivery> {
    return fetchApi<Delivery>(`/inventory/deliveries/${id}`);
  },
};

// ============================================================
// Customer API (프로모션/쿠폰/VOC)
// ============================================================

export interface VocListParams {
  type?: string;
  status?: string;
  priority?: string;
}

export interface VocListResponse {
  items: CustomerVoice[];
  summary: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
  };
}

export const promotionApi = {
  getPromotions(activeOnly = false): Promise<Promotion[]> {
    const qs = activeOnly ? "?active=true" : "";
    return fetchApi<Promotion[]>(`/customer/promotions${qs}`);
  },

  getPromotion(id: string): Promise<Promotion> {
    return fetchApi<Promotion>(`/customer/promotions/${id}`);
  },

  getCoupons(): Promise<Coupon[]> {
    return fetchApi<Coupon[]>("/customer/coupons");
  },

  getVoc(params: VocListParams = {}): Promise<VocListResponse> {
    return fetchApi<VocListResponse>(
      `/customer/voc${toQueryString(params as Record<string, string | number | undefined>)}`,
    );
  },

  getVocItem(id: string): Promise<CustomerVoice> {
    return fetchApi<CustomerVoice>(`/customer/voc/${id}`);
  },
};

export { ApiClientError };
