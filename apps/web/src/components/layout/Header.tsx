"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  Package,
  Users,
  ShoppingCart,
  Truck,
  X,
  Loader2,
} from "lucide-react";
import { useDebounce } from "@/hooks";
import { catalogApi, customerApi, orderApi } from "@/lib/api-client";

interface HeaderProps {
  title: string;
  description?: string;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "product" | "member" | "order" | "delivery";
  href: string;
}

const typeConfig = {
  product: { icon: Package, label: "상품", color: "text-blue-600 bg-blue-100" },
  member: {
    icon: Users,
    label: "회원",
    color: "text-purple-600 bg-purple-100",
  },
  order: {
    icon: ShoppingCart,
    label: "주문",
    color: "text-orange-600 bg-orange-100",
  },
  delivery: {
    icon: Truck,
    label: "배송",
    color: "text-green-600 bg-green-100",
  },
};

export default function Header({ title, description }: HeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 400);
  const containerRef = useRef<HTMLDivElement>(null);

  const performSearch = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const [products, members, orders] = await Promise.allSettled([
        catalogApi.getProducts({ search: searchTerm, page: 1, size: 5 }),
        customerApi.getMembers({ search: searchTerm, page: 1, size: 5 }),
        orderApi.getOrders({ search: searchTerm, page: 1, size: 5 }),
      ]);

      const items: SearchResult[] = [];

      if (products.status === "fulfilled") {
        products.value.items.forEach((p) =>
          items.push({
            id: p.id,
            title: p.name,
            subtitle: `${p.brand.name} · ${p.category.name}`,
            type: "product",
            href: `/catalog/products/${p.id}`,
          }),
        );
      }
      if (members.status === "fulfilled") {
        members.value.items.forEach((m) =>
          items.push({
            id: m.id,
            title: m.name,
            subtitle: m.email,
            type: "member",
            href: `/customer/members/${m.id}`,
          }),
        );
      }
      if (orders.status === "fulfilled") {
        orders.value.items.forEach((o) =>
          items.push({
            id: o.id,
            title: o.orderNumber,
            subtitle: `${o.customerName} · ${o.totalAmount.toLocaleString()}원`,
            type: "order",
            href: `/settlement/orders/${o.id}`,
          }),
        );
      }

      setResults(items);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(result: SearchResult) {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    router.push(result.href);
  }

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-6">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Global Search */}
          <div className="relative" ref={containerRef}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
            <input
              type="text"
              placeholder="통합 검색... (상품, 회원, 주문)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                if (query.length >= 2) setIsOpen(true);
              }}
              className="h-9 w-72 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-8 text-sm outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary/30 transition-all"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setIsOpen(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Search Results Dropdown */}
            {isOpen && query.length >= 2 && (
              <div className="absolute top-full right-0 mt-1 w-96 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden z-50">
                {isSearching && (
                  <div className="p-4 text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-primary mx-auto" />
                    <p className="text-xs text-gray-400 mt-1">검색 중...</p>
                  </div>
                )}
                {!isSearching && results.length === 0 && (
                  <div className="p-6 text-center">
                    <Search className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      &quot;{query}&quot;에 대한 결과가 없습니다
                    </p>
                  </div>
                )}
                {!isSearching && results.length > 0 && (
                  <div className="max-h-80 overflow-y-auto">
                    {results.map((result) => {
                      const config = typeConfig[result.type];
                      const Icon = config.icon;
                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleSelect(result)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                        >
                          <div className={`rounded-lg p-1.5 ${config.color}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {result.title}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {result.subtitle}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.color}`}
                          >
                            {config.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="relative rounded-lg p-2 hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-500" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-brand-accent" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5">
            <div className="h-7 w-7 rounded-full bg-brand-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-brand-primary">관</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-gray-900">관리자</p>
              <p className="text-[10px] text-gray-400">Core Platform</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
