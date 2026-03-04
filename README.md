# 🌿 GreenMart Platform

> Health & Beauty E-Commerce Core Platform — 모노레포 기반 카탈로그/커스터머/인벤토리/세틀먼트 통합 관리 플랫폼

## 📦 모노레포 구조

```
greenmart-platform/
├── apps/
│   ├── web/          # Next.js 프론트엔드 (대시보드 & 관리자 UI)
│   └── api/          # Express API 서버 (RESTful 엔드포인트)
├── packages/
│   └── shared/       # 공유 타입 정의 & Zod 검증 스키마
├── package.json      # 모노레포 루트 (npm workspaces)
└── tsconfig.json     # 루트 TypeScript 설정
```

## 🚀 시작하기

### 사전 요구사항

- Node.js >= 18
- npm >= 9

### 설치

```bash
npm install
```

### 빌드

```bash
# 전체 빌드 (shared → api → web 순서)
npm run build

# 개별 빌드
npm run build:shared
npm run build:api
npm run build:web
```

### 개발 서버

```bash
# 웹 + API 동시 실행
npm run dev

# 개별 실행
npm run dev:web    # http://localhost:3000
npm run dev:api    # http://localhost:4000
```

### 테스트

```bash
# 전체 테스트
npm test

# 개별 테스트
npm test -w apps/web
npm test -w apps/api
```

### 린트 & 타입 체크

```bash
npm run lint
npm run type-check
```

## 🏗️ 패키지 상세

### `@greenmart/web` (apps/web)

Next.js 14 기반 관리자 대시보드. Tailwind CSS, Recharts, Zustand 사용.

| 라우트                    | 설명                       |
| ------------------------- | -------------------------- |
| `/`                       | 대시보드 (매출 통계, 차트) |
| `/catalog/products`       | 상품 목록/관리             |
| `/catalog/products/[id]`  | 상품 상세                  |
| `/customer/members`       | 회원 관리                  |
| `/customer/promotions`    | 프로모션 관리              |
| `/customer/voc`           | 고객의 소리 (VOC)          |
| `/inventory/stock`        | 재고 관리                  |
| `/inventory/delivery`     | 배송 관리                  |
| `/settlement/orders`      | 주문 관리                  |
| `/settlement/settlements` | 정산 관리                  |

### `@greenmart/api` (apps/api)

Express + TypeScript REST API 서버. Zod 검증 미들웨어 내장.

| 엔드포인트                      | 메서드 | 설명                          |
| ------------------------------- | ------ | ----------------------------- |
| `/api/health`                   | GET    | 헬스 체크                     |
| `/api/docs`                     | GET    | Swagger API 문서              |
| `/api/catalog/products`         | GET    | 상품 목록 (필터/페이지네이션) |
| `/api/catalog/products/:id`     | GET    | 상품 상세                     |
| `/api/catalog/products`         | POST   | 상품 등록                     |
| `/api/catalog/products/:id`     | PUT    | 상품 수정                     |
| `/api/catalog/products/:id`     | DELETE | 상품 삭제                     |
| `/api/catalog/categories`       | GET    | 카테고리 목록                 |
| `/api/catalog/brands`           | GET    | 브랜드 목록                   |
| `/api/customer/members`         | GET    | 회원 목록                     |
| `/api/customer/members/:id`     | GET    | 회원 상세                     |
| `/api/customer/promotions`      | GET    | 프로모션 목록                 |
| `/api/customer/coupons`         | GET    | 쿠폰 목록                     |
| `/api/customer/voc`             | GET    | VOC 목록                      |
| `/api/inventory/warehouses`     | GET    | 창고 목록                     |
| `/api/inventory/stock`          | GET    | 재고 목록                     |
| `/api/inventory/deliveries`     | GET    | 배송 목록                     |
| `/api/inventory/deliveries/:id` | GET    | 배송 상세                     |
| `/api/inventory/movements`      | GET    | 재고 이동 내역                |
| `/api/settlement/orders`        | GET    | 주문 목록                     |
| `/api/settlement/orders/:id`    | GET    | 주문 상세                     |
| `/api/settlement/settlements`   | GET    | 정산 목록                     |
| `/api/settlement/dashboard`     | GET    | 대시보드 요약                 |

### `@greenmart/shared` (packages/shared)

4개 도메인의 TypeScript 타입 정의와 Zod 검증 스키마를 공유 패키지로 제공.

- **타입**: `Catalog`, `Customer`, `Inventory`, `Settlement` 도메인 전체 타입
- **검증**: `ProductFormSchema`, `CustomerSearchSchema`, `OrderFilterSchema`, `SettlementQuerySchema`

## 🔧 기술 스택

| 구분       | 기술                                                                  |
| ---------- | --------------------------------------------------------------------- |
| 프론트엔드 | Next.js 14, React 18, Tailwind CSS, Recharts, Zustand, TanStack Query |
| 백엔드     | Express, Node.js, TypeScript, Swagger/OpenAPI, Winston                |
| 검증       | Zod (프론트엔드 & 백엔드 공유)                                        |
| 테스트     | Jest, Testing Library, Supertest                                      |
| 아키텍처   | 모노레포 (npm workspaces), Controller → Service → Repository 패턴     |
| 빌드       | npm workspaces, TypeScript Composite Projects                         |

## 📁 도메인 모델

- **카탈로그**: 상품, 카테고리, 브랜드, 옵션, 리뷰
- **커스터머**: 회원, 쿠폰, 프로모션, VOC
- **인벤토리**: 창고, 재고, 배송, 재고 이동
- **세틀먼트**: 주문, 정산, 매출 통계, 대시보드
