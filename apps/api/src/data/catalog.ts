import type {
  Brand,
  Category,
  Product,
  ProductTag,
  SalesChannel,
} from "@greenmart/shared";

export const categories: Category[] = [
  {
    id: "cat-1",
    name: "채소",
    slug: "vegetables",
    parentId: null,
    depth: 0,
    sortOrder: 1,
    children: [
      {
        id: "cat-1-1",
        name: "제철 박스",
        slug: "seasonal-box",
        parentId: "cat-1",
        depth: 1,
        sortOrder: 1,
      },
      {
        id: "cat-1-2",
        name: "뿌리채소",
        slug: "root-vegetables",
        parentId: "cat-1",
        depth: 1,
        sortOrder: 2,
      },
      {
        id: "cat-1-3",
        name: "샐러드 채소",
        slug: "salad-greens",
        parentId: "cat-1",
        depth: 1,
        sortOrder: 3,
      },
    ],
  },
  {
    id: "cat-2",
    name: "과일",
    slug: "fruits",
    parentId: null,
    depth: 0,
    sortOrder: 2,
    children: [
      {
        id: "cat-2-1",
        name: "아침 과일",
        slug: "morning-fruits",
        parentId: "cat-2",
        depth: 1,
        sortOrder: 1,
      },
      {
        id: "cat-2-2",
        name: "시즌 과일",
        slug: "seasonal-fruits",
        parentId: "cat-2",
        depth: 1,
        sortOrder: 2,
      },
    ],
  },
  {
    id: "cat-3",
    name: "간편식",
    slug: "ready-meals",
    parentId: null,
    depth: 0,
    sortOrder: 3,
    children: [
      {
        id: "cat-3-1",
        name: "샐러드 키트",
        slug: "salad-kits",
        parentId: "cat-3",
        depth: 1,
        sortOrder: 1,
      },
      {
        id: "cat-3-2",
        name: "수프/밀키트",
        slug: "soup-meal-kits",
        parentId: "cat-3",
        depth: 1,
        sortOrder: 2,
      },
    ],
  },
  {
    id: "cat-4",
    name: "유제품",
    slug: "dairy",
    parentId: null,
    depth: 0,
    sortOrder: 4,
  },
  {
    id: "cat-5",
    name: "정기배송",
    slug: "subscriptions",
    parentId: null,
    depth: 0,
    sortOrder: 5,
  },
];

export const brands: Brand[] = [
  {
    id: "br-1",
    name: "양평 새벽농장",
    nameEn: "Yangpyeong Dawn Farm",
    logoUrl: "/brands/yangpyeong-dawn.png",
    country: "KR",
    isOfficial: true,
    description: "새벽 수확 채소와 허브를 공급하는 로컬 농장",
  },
  {
    id: "br-2",
    name: "상주 햇살과수원",
    nameEn: "Sangju Sunshine Orchard",
    logoUrl: "/brands/sangju-sunshine.png",
    country: "KR",
    isOfficial: true,
    description: "소가구용 과일 세트를 선별하는 경북 상주 과수원",
  },
  {
    id: "br-3",
    name: "성수 키친랩",
    nameEn: "Seongsu Kitchen Lab",
    logoUrl: "/brands/seongsu-kitchen.png",
    country: "KR",
    isOfficial: true,
    description: "세척 채소와 간편식 키트를 만드는 도심 키친",
  },
  {
    id: "br-4",
    name: "홍성 작은목장",
    nameEn: "Hongseong Small Dairy",
    logoUrl: "/brands/hongseong-dairy.png",
    country: "KR",
    isOfficial: true,
    description: "저온 발효 요거트와 유제품을 생산하는 목장",
  },
  {
    id: "br-5",
    name: "괴산 흙담농원",
    nameEn: "Goesan Heukdam Farm",
    logoUrl: "/brands/goesan-heukdam.png",
    country: "KR",
    isOfficial: true,
    description: "구이용 뿌리채소와 저장 채소를 공급하는 농원",
  },
  {
    id: "br-6",
    name: "GreenMart 키친",
    nameEn: "GreenMart Kitchen",
    logoUrl: "/brands/greenmart-kitchen.png",
    country: "KR",
    isOfficial: true,
    description: "제철 식재료 기반 수프와 밀키트를 만드는 자체 키친",
  },
];

function createProduct(
  overrides: Partial<Product> &
    Pick<Product, "id" | "name" | "brand" | "category">,
): Product {
  const originalPrice = overrides.originalPrice ?? 25000;
  const salePrice = overrides.salePrice ?? originalPrice;
  const discountRate =
    originalPrice > salePrice
      ? Math.round((1 - salePrice / originalPrice) * 100)
      : 0;

  const defaults: Product = {
    id: overrides.id,
    name: overrides.name,
    brand: overrides.brand,
    category: overrides.category,
    slug: overrides.name.replace(/\s+/g, "-").toLowerCase(),
    description:
      overrides.description ??
      `${overrides.brand.name}에서 공급하는 GreenMart Fresh 상품입니다.`,
    shortDescription:
      overrides.shortDescription ?? `${overrides.brand.name} ${overrides.name}`,
    originalPrice,
    salePrice,
    discountRate,
    images: overrides.images ?? [],
    options: overrides.options ?? [],
    tags: overrides.tags ?? [],
    salesChannels: overrides.salesChannels ?? ["ONLINE"],
    status: overrides.status ?? "ACTIVE",
    reviewSummary: overrides.reviewSummary ?? {
      averageRating: 4.6,
      totalCount: 420,
      distribution: { 5: 70, 4: 18, 3: 7, 2: 3, 1: 2 },
    },
    createdAt: "2026-05-01T09:00:00Z",
    updatedAt: "2026-06-20T08:30:00Z",
  };

  return {
    ...defaults,
    ...overrides,
    discountRate: overrides.discountRate ?? discountRate,
  };
}

export const products: Product[] = [
  createProduct({
    id: "prod-1",
    name: "이번 주 제철 채소 박스",
    brand: brands[0],
    category: categories[0].children![0],
    originalPrice: 32000,
    salePrice: 28900,
    tags: ["BEST", "EDITOR_PICK"] as ProductTag[],
    salesChannels: ["ONLINE", "OFFLINE"] as SalesChannel[],
    volume: "1박스",
    reviewSummary: {
      averageRating: 4.8,
      totalCount: 1284,
      distribution: { 5: 76, 4: 16, 3: 5, 2: 2, 1: 1 },
    },
    images: [
      {
        id: "img-1-1",
        url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop",
        alt: "이번 주 제철 채소 박스",
        sortOrder: 1,
        type: "main",
      },
    ],
    description:
      "샐러드 채소, 구이용 뿌리채소, 허브를 산지 상황에 맞춰 구성한 주간 채소 박스입니다.",
    shortDescription: "당일 수확 채소 중심 주간 박스",
  }),
  createProduct({
    id: "prod-2",
    name: "아침 과일 세트",
    brand: brands[1],
    category: categories[1].children![0],
    originalPrice: 27000,
    salePrice: 24600,
    tags: ["NEW", "BEST"] as ProductTag[],
    volume: "6입",
    images: [
      {
        id: "img-2-1",
        url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop",
        alt: "아침 과일 세트",
        sortOrder: 1,
        type: "main",
      },
    ],
    description:
      "사과, 배, 감귤을 소가구 냉장 보관량에 맞춰 구성한 아침 과일 세트입니다.",
    shortDescription: "저당 선별 소포장 과일 세트",
  }),
  createProduct({
    id: "prod-3",
    name: "5분 샐러드 키트",
    brand: brands[2],
    category: categories[2].children![0],
    originalPrice: 13900,
    salePrice: 11900,
    tags: ["BEST", "ONLINE_ONLY"] as ProductTag[],
    volume: "2인분",
    reviewSummary: {
      averageRating: 4.7,
      totalCount: 982,
      distribution: { 5: 72, 4: 19, 3: 6, 2: 2, 1: 1 },
    },
    images: [
      {
        id: "img-3-1",
        url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop",
        alt: "5분 샐러드 키트",
        sortOrder: 1,
        type: "main",
      },
    ],
    description:
      "세척 채소, 곡물 토핑, 드레싱을 한 팩에 담은 평일 점심용 샐러드 키트입니다.",
    shortDescription: "조리 없이 먹는 샐러드 키트",
  }),
  createProduct({
    id: "prod-4",
    name: "목장 요거트 번들",
    brand: brands[3],
    category: categories[3],
    originalPrice: 18800,
    salePrice: 16800,
    tags: ["EDITOR_PICK"] as ProductTag[],
    volume: "4개",
    images: [
      {
        id: "img-4-1",
        url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop",
        alt: "목장 요거트 번들",
        sortOrder: 1,
        type: "main",
      },
    ],
    description:
      "저온 발효 요거트와 그래놀라를 함께 받을 수 있는 무가당 아침 번들입니다.",
    shortDescription: "무가당 냉장 요거트 번들",
  }),
  createProduct({
    id: "prod-5",
    name: "구이용 뿌리채소 팩",
    brand: brands[4],
    category: categories[0].children![1],
    originalPrice: 15000,
    salePrice: 13200,
    tags: ["SALE"] as ProductTag[],
    volume: "900g",
    images: [
      {
        id: "img-5-1",
        url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop",
        alt: "구이용 뿌리채소 팩",
        sortOrder: 1,
        type: "main",
      },
    ],
    description:
      "당근, 비트, 감자를 손질해 오븐과 에어프라이어에 바로 넣기 좋은 상태로 제공합니다.",
    shortDescription: "오븐 조리에 맞춘 뿌리채소 팩",
  }),
  createProduct({
    id: "prod-6",
    name: "퇴근 후 수프 팩",
    brand: brands[5],
    category: categories[2].children![1],
    originalPrice: 16900,
    salePrice: 14900,
    tags: ["NEW", "ONLINE_ONLY"] as ProductTag[],
    volume: "2팩",
    images: [
      {
        id: "img-6-1",
        url: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=400&fit=crop",
        alt: "퇴근 후 수프 팩",
        sortOrder: 1,
        type: "main",
      },
    ],
    description:
      "제철 채소를 갈아 만든 저염 냉장 수프입니다. 데우기만 하면 저녁 식사가 완성됩니다.",
    shortDescription: "데우기만 하는 제철 채소 수프",
  }),
  createProduct({
    id: "prod-7",
    name: "샐러드 채소 리필 팩",
    brand: brands[0],
    category: categories[0].children![2],
    originalPrice: 11800,
    salePrice: 9900,
    tags: ["TODAY_DEAL"] as ProductTag[],
    volume: "450g",
    status: "ACTIVE",
    images: [
      {
        id: "img-7-1",
        url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop",
        alt: "샐러드 채소 리필 팩",
        sortOrder: 1,
        type: "main",
      },
    ],
    description:
      "양상추, 루꼴라, 케일을 세척해 소분한 샐러드 채소 리필 팩입니다.",
    shortDescription: "세척 완료 샐러드 채소",
  }),
  createProduct({
    id: "prod-8",
    name: "시즌 과일 미니 박스",
    brand: brands[1],
    category: categories[1].children![1],
    originalPrice: 19800,
    salePrice: 19800,
    tags: ["NEW"] as ProductTag[],
    volume: "1박스",
    status: "ACTIVE",
    images: [
      {
        id: "img-8-1",
        url: "https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=400&h=400&fit=crop",
        alt: "시즌 과일 미니 박스",
        sortOrder: 1,
        type: "main",
      },
    ],
    description:
      "입고 상황에 맞춰 가장 상태가 좋은 시즌 과일을 소량으로 구성합니다.",
    shortDescription: "소량 구성 시즌 과일 박스",
  }),
  createProduct({
    id: "prod-9",
    name: "주간 식단 루틴 박스",
    brand: brands[5],
    category: categories[4],
    originalPrice: 64000,
    salePrice: 59800,
    tags: ["BEST", "EDITOR_PICK"] as ProductTag[],
    volume: "3일분",
    status: "ACTIVE",
    images: [
      {
        id: "img-9-1",
        url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=400&fit=crop",
        alt: "주간 식단 루틴 박스",
        sortOrder: 1,
        type: "main",
      },
    ],
    description:
      "채소 박스, 샐러드 키트, 수프 팩을 조합해 3일치 식단을 구성한 정기배송 박스입니다.",
    shortDescription: "3일치 식단 정기배송 구성",
  }),
  createProduct({
    id: "prod-10",
    name: "비건 점심 키트",
    brand: brands[2],
    category: categories[2].children![0],
    originalPrice: 15900,
    salePrice: 13900,
    tags: ["ONLINE_ONLY", "SALE"] as ProductTag[],
    volume: "1인분 x 2",
    status: "OUT_OF_STOCK",
    images: [
      {
        id: "img-10-1",
        url: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=400&fit=crop",
        alt: "비건 점심 키트",
        sortOrder: 1,
        type: "main",
      },
    ],
    description:
      "곡물, 콩단백 토핑, 세척 채소를 함께 담은 비건 점심 키트입니다.",
    shortDescription: "비건 옵션 점심 키트",
  }),
];
