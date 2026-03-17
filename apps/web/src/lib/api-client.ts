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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const DEFAULT_TIMEOUT = 10_000;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY = 500;
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

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

type RequestInterceptor = (config: RequestInit) => RequestInit;
type ResponseInterceptor = (response: Response) => Response;

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];

export function addRequestInterceptor(fn: RequestInterceptor) {
  requestInterceptors.push(fn);
  return () => {
    const idx = requestInterceptors.indexOf(fn);
    if (idx !== -1) requestInterceptors.splice(idx, 1);
  };
}

export function addResponseInterceptor(fn: ResponseInterceptor) {
  responseInterceptors.push(fn);
  return () => {
    const idx = responseInterceptors.indexOf(fn);
    if (idx !== -1) responseInterceptors.splice(idx, 1);
  };
}

function applyRequestInterceptors(config: RequestInit): RequestInit {
  return requestInterceptors.reduce((cfg, fn) => fn(cfg), config);
}

function applyResponseInterceptors(response: Response): Response {
  return responseInterceptors.reduce((res, fn) => fn(res), response);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit & { skipRetry?: boolean },
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options?.method ?? "GET";
  const isIdempotent =
    method === "GET" || method === "PUT" || method === "DELETE";
  const shouldRetry = !options?.skipRetry && isIdempotent;

  let config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  };

  config = applyRequestInterceptors(config);

  let lastError: Error | null = null;
  const attempts = shouldRetry ? MAX_RETRIES + 1 : 1;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      if (attempt > 0) {
        const delay = RETRY_BASE_DELAY * Math.pow(2, attempt - 1);
        await wait(delay);
      }

      let res = await fetchWithTimeout(url, config, DEFAULT_TIMEOUT);
      res = applyResponseInterceptors(res);

      if (!res.ok) {
        if (
          shouldRetry &&
          attempt < MAX_RETRIES &&
          RETRYABLE_STATUS_CODES.has(res.status)
        ) {
          lastError = new ApiClientError(
            res.status,
            "RETRYABLE",
            `Attempt ${attempt + 1} failed`,
          );
          continue;
        }

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
    } catch (err) {
      if (
        err instanceof ApiClientError &&
        !RETRYABLE_STATUS_CODES.has(err.status)
      ) {
        throw err;
      }

      if (err instanceof DOMException && err.name === "AbortError") {
        lastError = new ApiClientError(
          408,
          "TIMEOUT",
          "요청 시간이 초과되었습니다.",
        );
        if (!shouldRetry || attempt >= MAX_RETRIES) throw lastError;
        continue;
      }

      lastError = err instanceof Error ? err : new Error(String(err));
      if (!shouldRetry || attempt >= MAX_RETRIES) throw lastError;
    }
  }

  throw lastError ?? new Error("Unexpected error in fetchApi");
}

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
