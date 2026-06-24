"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Leaf,
  Minus,
  Plus,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRound,
} from "lucide-react";
import { useToast } from "@/components/ui";
import { cn } from "@/lib/utils";

export type ServiceProduct = {
  id: string;
  catalogProductId: string;
  name: string;
  farm: string;
  category: "채소" | "과일" | "간편식" | "유제품";
  price: number;
  unit: string;
  image: string;
  description: string;
  badges: string[];
  stock: number;
};

export type DeliverySlot = {
  id: string;
  label: string;
  time: string;
  capacity: string;
};

export type SubscriptionPlan = {
  id: "once" | "weekly" | "biweekly";
  title: string;
  summary: string;
  discount: string;
};

export type ServiceCatalog = {
  products: ServiceProduct[];
  deliverySlots: DeliverySlot[];
  subscriptionPlans: SubscriptionPlan[];
};

type CustomerForm = {
  name: string;
  phone: string;
  address: string;
  note: string;
};

const categories = ["전체", "채소", "과일", "간편식", "유제품"] as const;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);

export function GreenMartService({ catalog }: { catalog: ServiceCatalog }) {
  const { toast } = useToast();
  const { products, deliverySlots, subscriptionPlans } = catalog;
  const [category, setCategory] = useState<(typeof categories)[number]>("전체");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({
    "box-seasonal": 1,
    "salad-kit": 1,
  });
  const [selectedSlot, setSelectedSlot] = useState(
    deliverySlots[0]?.id ?? "",
  );
  const [selectedPlan, setSelectedPlan] = useState(
    subscriptionPlans[0]?.id ?? "once",
  );
  const [form, setForm] = useState<CustomerForm>({
    name: "",
    phone: "",
    address: "",
    note: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = category === "전체" || product.category === category;
      const matchesQuery =
        !loweredQuery ||
        [product.name, product.farm, product.description, product.category]
          .join(" ")
          .toLowerCase()
          .includes(loweredQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, products, query]);

  const cartLines = useMemo(
    () =>
      products
        .map((product) => ({ product, quantity: cart[product.id] ?? 0 }))
        .filter((line) => line.quantity > 0),
    [cart, products],
  );

  const subtotal = cartLines.reduce(
    (total, line) => total + line.product.price * line.quantity,
    0,
  );
  const deliveryFee = subtotal >= 40000 || subtotal === 0 ? 0 : 3000;
  const planDiscount =
    selectedPlan === "weekly"
      ? Math.floor(subtotal * 0.07)
      : selectedPlan === "biweekly"
        ? Math.floor(subtotal * 0.04)
        : 0;
  const total = subtotal + deliveryFee - planDiscount;
  const itemCount = cartLines.reduce((count, line) => count + line.quantity, 0);

  const updateQuantity = (productId: string, nextQuantity: number) => {
    setCart((current) => {
      const quantity = Math.max(0, nextQuantity);
      const nextCart = { ...current };

      if (quantity === 0) {
        delete nextCart[productId];
      } else {
        nextCart[productId] = quantity;
      }

      return nextCart;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (cartLines.length === 0) {
      toast("error", "상품을 하나 이상 선택해주세요.");
      return;
    }

    if (!form.name || !form.phone || !form.address) {
      toast("error", "이름, 연락처, 배송지를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setOrderId(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          deliverySlot: deliverySlots.find((slot) => slot.id === selectedSlot),
          subscriptionPlan: subscriptionPlans.find(
            (plan) => plan.id === selectedPlan,
          ),
          items: cartLines.map(({ product, quantity }) => ({
            id: product.id,
            name: product.name,
            unit: product.unit,
            price: product.price,
            quantity,
          })),
          pricing: {
            subtotal,
            deliveryFee,
            planDiscount,
            total,
          },
        }),
      });

      const result = (await response.json()) as {
        orderId?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(result.message ?? "주문 요청을 접수하지 못했습니다.");
      }

      setOrderId(result.orderId ?? null);
      toast("success", "주문 요청이 접수되었습니다.");
    } catch (error) {
      toast(
        "error",
        error instanceof Error
          ? error.message
          : "주문 요청 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="relative min-h-[78svh] overflow-hidden bg-zinc-950 text-white md:min-h-[82svh]">
        <Image
          src="https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=1800&q=85"
          alt="신선한 채소와 과일이 진열된 마켓"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-zinc-950/55" />

        <div className="relative mx-auto flex min-h-[78svh] w-full max-w-7xl flex-col px-5 py-5 md:min-h-[82svh] md:px-8">
          <header className="flex items-center justify-between gap-4">
            <a href="/" className="flex items-center gap-2 font-semibold">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white text-emerald-700">
                <Leaf className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>GreenMart Fresh</span>
            </a>
            <nav
              aria-label="주요 메뉴"
              className="hidden items-center gap-2 text-sm text-white/85 md:flex"
            >
              <a className="rounded-md px-3 py-2 hover:bg-white/10" href="#shop">
                상품
              </a>
              <a className="rounded-md px-3 py-2 hover:bg-white/10" href="#plans">
                정기배송
              </a>
              <a className="rounded-md px-3 py-2 hover:bg-white/10" href="#order">
                주문
              </a>
              <a className="rounded-md px-3 py-2 hover:bg-white/10" href="/admin">
                운영
              </a>
            </nav>
          </header>

          <div className="flex flex-1 items-center py-12">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm text-white">
                <Sparkles className="h-4 w-4 text-amber-200" aria-hidden="true" />
                서울 일부 지역 새벽배송 파일럿 운영
              </div>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                GreenMart Fresh
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/88 sm:text-lg">
                산지에서 선별한 제철 식재료를 소가구 식단에 맞춰 묶고, 원하는
                배송 슬롯에 맞춰 문 앞까지 보냅니다.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#shop"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-100"
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  장보기
                </a>
                <a
                  href="#order"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/45 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <Truck className="h-4 w-4" aria-hidden="true" />
                  주문 요청
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-t border-white/20 py-5 text-sm text-white/88 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-200" aria-hidden="true" />
              생산자 실명 표기
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-sky-200" aria-hidden="true" />
              24시간 내 수확분 우선 구성
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-amber-200" aria-hidden="true" />
              주 3회 지정 배송
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 py-5 md:grid-cols-4 md:px-8">
          {[
            ["38", "이번 주 산지 출고 품목"],
            ["4.8/5", "첫 구매 고객 만족도"],
            ["92%", "재사용 보냉재 회수율"],
            ["11시", "당일 변경 마감"],
          ].map(([value, label]) => (
            <div key={label} className="border-l border-stone-200 pl-4">
              <p className="text-2xl font-semibold text-zinc-950">{value}</p>
              <p className="mt-1 text-sm text-zinc-600">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="shop" className="bg-stone-50 py-14">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                This week
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-zinc-950">
                지금 받을 수 있는 상품
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                수확량과 배송 가능 수량을 기준으로 주간 상품을 열고 닫습니다.
              </p>
            </div>

            <label className="relative block w-full md:w-80">
              <span className="sr-only">상품 검색</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                aria-hidden="true"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-md border border-stone-300 bg-white py-3 pl-10 pr-4 text-sm text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                placeholder="상품, 산지, 용도 검색"
              />
            </label>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={cn(
                  "inline-flex shrink-0 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition",
                  category === item
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-stone-300 bg-white text-zinc-700 hover:border-emerald-700",
                )}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const quantity = cart[product.id] ?? 0;

              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      {product.badges.map((badge) => (
                        <span
                          key={badge}
                          className="rounded-md bg-white/92 px-2 py-1 text-xs font-semibold text-emerald-800"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-zinc-500">
                          {product.farm}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-zinc-950">
                          {product.name}
                        </h3>
                      </div>
                      <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                        {product.stock}개
                      </span>
                    </div>
                    <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-600">
                      {product.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-zinc-950">
                          {formatCurrency(product.price)}
                        </p>
                        <p className="text-xs text-zinc-500">{product.unit}</p>
                      </div>
                      <div className="flex h-10 items-center rounded-md border border-stone-300 bg-stone-50">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(product.id, quantity - 1)
                          }
                          className="inline-flex h-10 w-10 items-center justify-center text-zinc-700 transition hover:bg-white disabled:text-zinc-300"
                          aria-label={`${product.name} 수량 줄이기`}
                          disabled={quantity === 0}
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(product.id, quantity + 1)
                          }
                          className="inline-flex h-10 w-10 items-center justify-center text-zinc-700 transition hover:bg-white"
                          aria-label={`${product.name} 수량 늘리기`}
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="plans" className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold text-sky-700">Routine</p>
              <h2 className="mt-2 text-3xl font-semibold text-zinc-950">
                냉장고를 채우는 주기 선택
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                주문 요청 후 GreenMart 매니저가 식단, 알레르기, 부재중 수령
                방식을 확인하고 배송을 확정합니다.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {subscriptionPlans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition",
                    selectedPlan === plan.id
                      ? "border-sky-700 bg-sky-50"
                      : "border-stone-200 bg-white hover:border-sky-700",
                  )}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-base font-semibold text-zinc-950">
                      {plan.title}
                    </span>
                    {selectedPlan === plan.id ? (
                      <Check className="h-5 w-5 text-sky-700" aria-hidden="true" />
                    ) : null}
                  </span>
                  <span className="mt-3 block text-sm leading-6 text-zinc-600">
                    {plan.summary}
                  </span>
                  <span className="mt-4 inline-flex rounded-md bg-zinc-950 px-2 py-1 text-xs font-semibold text-white">
                    {plan.discount}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="order" className="bg-zinc-950 py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 md:px-8 lg:grid-cols-[1fr_420px]">
          <form onSubmit={handleSubmit} className="rounded-lg bg-white p-5 text-zinc-950 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-emerald-700">Order</p>
                <h2 className="mt-2 text-2xl font-semibold">배송 요청</h2>
              </div>
              <ShoppingBag className="h-7 w-7 text-emerald-700" aria-hidden="true" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-zinc-800">이름</span>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  placeholder="홍길동"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-zinc-800">연락처</span>
                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  placeholder="010-0000-0000"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-zinc-800">배송지</span>
              <input
                value={form.address}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                placeholder="서울시 성동구 ..."
              />
            </label>

            <div className="mt-5">
              <span className="text-sm font-medium text-zinc-800">
                배송 슬롯
              </span>
              <div className="mt-2 grid gap-2 md:grid-cols-3">
                {deliverySlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlot(slot.id)}
                    className={cn(
                      "rounded-md border p-3 text-left transition",
                      selectedSlot === slot.id
                        ? "border-emerald-700 bg-emerald-50"
                        : "border-stone-300 bg-white hover:border-emerald-700",
                    )}
                  >
                    <span className="block text-sm font-semibold">
                      {slot.label}
                    </span>
                    <span className="mt-1 block text-xs text-zinc-600">
                      {slot.time}
                    </span>
                    <span className="mt-2 inline-flex text-xs font-semibold text-emerald-700">
                      {slot.capacity}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-zinc-800">요청사항</span>
              <textarea
                value={form.note}
                onChange={(event) =>
                  setForm((current) => ({ ...current, note: event.target.value }))
                }
                className="mt-2 min-h-24 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                placeholder="알레르기, 부재중 수령 위치, 선호 식재료"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {isSubmitting ? (
                <>
                  <ChevronDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
                  접수 중
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" aria-hidden="true" />
                  주문 요청 보내기
                </>
              )}
            </button>

            {orderId ? (
              <p className="mt-4 rounded-md bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-800">
                접수번호 {orderId}
              </p>
            ) : null}
          </form>

          <aside className="rounded-lg border border-white/12 bg-white/8 p-5 backdrop-blur md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white/65">Cart</p>
                <h2 className="mt-1 text-2xl font-semibold">주문 요약</h2>
              </div>
              <span className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-950">
                {itemCount}개
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {cartLines.length === 0 ? (
                <div className="rounded-md border border-white/15 p-4 text-sm text-white/70">
                  선택된 상품이 없습니다.
                </div>
              ) : (
                cartLines.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-start justify-between gap-3 border-b border-white/10 pb-3"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="mt-1 text-sm text-white/60">
                        {product.unit} x {quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatCurrency(product.price * quantity)}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-white/70">
                <span>상품 금액</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>배송비</span>
                <span>{deliveryFee === 0 ? "무료" : formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>정기배송 할인</span>
                <span>-{formatCurrency(planDiscount)}</span>
              </div>
              <div className="flex justify-between border-t border-white/15 pt-4 text-lg font-semibold text-white">
                <span>예상 결제액</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <a
              href="#shop"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
            >
              상품 더 보기
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>

            <div className="mt-5 flex items-start gap-3 rounded-md border border-white/12 p-3 text-sm text-white/70">
              <UserRound className="mt-0.5 h-4 w-4 text-sky-200" aria-hidden="true" />
              주문 확정 전 담당 매니저가 연락처로 재고와 배송 가능 여부를
              확인합니다.
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
