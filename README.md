# 🌿 GreenMart Platform

> Health & Beauty 이커머스 어드민 플랫폼 — 모노레포 기반 카탈로그/커스터머/인벤토리/세틀먼트 통합 관리 시스템

## ✨ 주요 특징

- **4개 도메인 풀스택 CRUD** — 상품·회원·주문·정산·재고·배송·프로모션·VOC 전체 관리
- **모노레포 아키텍처** — `npm workspaces`로 타입/검증 스키마 공유, 빌드 의존성 자동 해소
- **Type-safe API 연동** — 공유 Zod 스키마 + TanStack Query 기반 타입 안전 데이터 페칭
- **Controller → Service → Repository** — 백엔드 계층 분리, 단일 책임 원칙
- **통합 검색** — 헤더에서 상품/회원/주문을 실시간 검색, 키보드 네비게이션 지원
- **엑셀(CSV) 내보내기** — 회원/주문/정산 목록 데이터 다운로드
- **모바일 반응형** — 사이드바 슬라이드인, 햄버거 메뉴, 전체 레이아웃 반응형 대응
- **Swagger API 문서** — `/api/docs`에서 전체 엔드포인트 인터랙티브 테스트 가능

## 📦 모노레포 구조

```
greenmart-platform/
├── apps/
│   ├── web/                        # Next.js 프론트엔드 (관리자 대시보드)
│   │   └── src/
│   │       ├── app/(dashboard)/    # 16개 라우트 (목록 + 상세 페이지)
│   │       ├── components/
│   │       │   ├── dashboard/      # 차트, KPI 카드
│   │       │   ├── forms/          # CRUD 모달 (상품/회원/주문 상태/삭제 확인)
│   │       │   ├── layout/         # Header (통합 검색), Sidebar (반응형)
│   │       │   ├── providers/      # QueryProvider (TanStack Query)
│   │       │   └── ui/             # Badge, Modal, Pagination, Toast, EmptyState
│   │       ├── hooks/              # 도메인별 TanStack Query 커스텀 훅 (7개)
│   │       └── lib/                # API Client, 유틸, 상수, 엑셀 내보내기
│   └── api/                        # Express REST API 서버
│       └── src/
│           ├── routes/             # 4개 도메인 라우터 (30+ 엔드포인트)
│           ├── services/           # 비즈니스 로직 계층
│           ├── repositories/       # 데이터 접근 계층
│           ├── middleware/         # Zod 검증, 에러 핸들링
│           └── lib/                # Winston 로거
├── packages/
│   └── shared/                     # 공유 TypeScript 타입 & Zod 검증 스키마
│       └── src/
│           ├── types/              # 4개 도메인 인터페이스 + API 공통 타입
│           └── validations/        # 8개 Zod 스키마 (폼, 필터, 에러)
├── package.json                    # 모노레포 루트 (npm workspaces)
└── tsconfig.json                   # 루트 TypeScript 설정
```

## 🚀 시작하기

### 사전 요구사항

- Node.js >= 18
- npm >= 9

### 설치

```bash
npm install
```

### 환경 변수

```bash
cp .env.example .env
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

# 커버리지 포함
npm run test:coverage

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

Next.js 14 기반 관리자 대시보드. TanStack Query로 전체 페이지 API 연동, CRUD 모달/토스트 알림/통합 검색/엑셀 내보내기를 포함합니다.

| 라우트                         | 설명           | 주요 기능                                    |
| ------------------------------ | -------------- | -------------------------------------------- |
| `/`                            | 대시보드       | KPI 카드, 월별 매출 차트, 카테고리 파이차트  |
| `/catalog/products`            | 상품 목록/관리 | 검색, 필터, 그리드/테이블 뷰, 등록/수정/삭제 |
| `/catalog/products/[id]`       | 상품 상세      | 상세 정보, 리뷰 분포, 이미지, 삭제           |
| `/customer/members`            | 회원 목록/관리 | 등급·상태·채널 필터, 등록/삭제, CSV 내보내기 |
| `/customer/members/[id]`       | 회원 상세      | 프로필, 주문 이력, 등급 정보                 |
| `/customer/promotions`         | 프로모션 관리  | 진행 중 프로모션, 쿠폰 목록                  |
| `/customer/promotions/[id]`    | 프로모션 상세  | 할인 조건, 적용 상품, 사용 현황              |
| `/customer/voc`                | 고객의 소리    | 유형/상태 필터, 통계 카드                    |
| `/customer/voc/[id]`           | VOC 상세       | 문의/답변 내용, 처리 타임라인                |
| `/inventory/stock`             | 재고 관리      | 창고 현황, 재고 검색/필터, 경고 알림         |
| `/inventory/delivery`          | 배송 목록      | 상태/유형 필터, 타임라인 트래커              |
| `/inventory/delivery/[id]`     | 배송 상세      | 진행 단계, 배송/수령 정보, 타임라인          |
| `/settlement/orders`           | 주문 목록/관리 | 상태 탭, 주문 상태 변경, CSV 내보내기        |
| `/settlement/orders/[id]`      | 주문 상세      | 상품 목록, 결제 정보, 상태 변경              |
| `/settlement/settlements`      | 정산 목록      | 기간/상태 필터, 파트너사별 테이블, CSV       |
| `/settlement/settlements/[id]` | 정산 상세      | 정산 내역, 수수료 구조, 지급 정보            |

### `@greenmart/api` (apps/api)

Express + TypeScript REST API 서버. Controller → Service → Repository 아키텍처 적용. Zod 검증 미들웨어 내장.

| 엔드포인트                          | 메서드 | 설명                          |
| ----------------------------------- | ------ | ----------------------------- |
| `/api/health`                       | GET    | 헬스 체크                     |
| `/api/docs`                         | GET    | Swagger API 문서              |
| **카탈로그**                        |        |                               |
| `/api/catalog/products`             | GET    | 상품 목록 (필터/페이지네이션) |
| `/api/catalog/products/:id`         | GET    | 상품 상세                     |
| `/api/catalog/products`             | POST   | 상품 등록                     |
| `/api/catalog/products/:id`         | PUT    | 상품 수정                     |
| `/api/catalog/products/:id`         | DELETE | 상품 삭제                     |
| `/api/catalog/categories`           | GET    | 카테고리 목록                 |
| `/api/catalog/brands`               | GET    | 브랜드 목록                   |
| **커스터머**                        |        |                               |
| `/api/customer/members`             | GET    | 회원 목록 (필터/페이지네이션) |
| `/api/customer/members`             | POST   | 회원 등록                     |
| `/api/customer/members/:id`         | GET    | 회원 상세                     |
| `/api/customer/members/:id`         | DELETE | 회원 삭제                     |
| `/api/customer/promotions`          | GET    | 프로모션 목록                 |
| `/api/customer/promotions/:id`      | GET    | 프로모션 상세                 |
| `/api/customer/coupons`             | GET    | 쿠폰 목록                     |
| `/api/customer/voc`                 | GET    | VOC 목록 (필터/페이지네이션)  |
| `/api/customer/voc/:id`             | GET    | VOC 상세                      |
| **인벤토리**                        |        |                               |
| `/api/inventory/warehouses`         | GET    | 창고 목록                     |
| `/api/inventory/stock`              | GET    | 재고 목록 (필터)              |
| `/api/inventory/deliveries`         | GET    | 배송 목록 (필터)              |
| `/api/inventory/deliveries/:id`     | GET    | 배송 상세                     |
| `/api/inventory/movements`          | GET    | 재고 이동 내역                |
| **세틀먼트**                        |        |                               |
| `/api/settlement/orders`            | GET    | 주문 목록 (필터/페이지네이션) |
| `/api/settlement/orders/:id`        | GET    | 주문 상세                     |
| `/api/settlement/orders/:id/status` | PATCH  | 주문 상태 변경                |
| `/api/settlement/settlements`       | GET    | 정산 목록 (필터)              |
| `/api/settlement/settlements/:id`   | GET    | 정산 상세                     |
| `/api/settlement/dashboard`         | GET    | 대시보드 요약                 |

### `@greenmart/shared` (packages/shared)

4개 도메인의 TypeScript 타입 정의와 Zod 검증 스키마를 공유 패키지로 제공.

- **타입**: `Catalog`, `Customer`, `Inventory`, `Settlement` 도메인 전체 인터페이스
- **검증 스키마**:
  - `ProductFormSchema` — 상품 등록/수정 폼
  - `CustomerFormSchema` — 회원 등록 폼
  - `OrderStatusUpdateSchema` — 주문 상태 변경
  - `CustomerSearchSchema` — 회원 검색 필터
  - `OrderFilterSchema` — 주문 검색 필터
  - `SettlementQuerySchema` — 정산 조회 필터
  - `PaginationQuerySchema` — 공통 페이지네이션
  - `ApiErrorSchema` — API 에러 응답 형식

## 🔧 기술 스택

| 구분       | 기술                                                                  |
| ---------- | --------------------------------------------------------------------- |
| 프론트엔드 | Next.js 14, React 18, Tailwind CSS, Recharts, TanStack Query, Zustand |
| 백엔드     | Express, Node.js, TypeScript, Swagger/OpenAPI, Winston                |
| 검증       | Zod (프론트엔드 & 백엔드 공유 스키마)                                 |
| 테스트     | Jest, Testing Library, Supertest                                      |
| 아키텍처   | 모노레포 (npm workspaces), Controller → Service → Repository 패턴     |
| UI 패턴    | Type-safe API Client, CRUD 모달, Toast 알림, 통합 검색, CSV 내보내기  |

## 📁 도메인 모델

- **카탈로그**: 상품, 카테고리, 브랜드, 옵션, 리뷰
- **커스터머**: 회원, 쿠폰, 프로모션, VOC
- **인벤토리**: 창고, 재고, 배송, 재고 이동
- **세틀먼트**: 주문, 정산, 매출 통계, 대시보드
