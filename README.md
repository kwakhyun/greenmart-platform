<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/NestJS-10-E0234E?style=flat-square&logo=nestjs" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/TanStack_Query-5-red?style=flat-square&logo=react-query" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Zod-3.x-3068B7?style=flat-square" />
  <img src="https://img.shields.io/badge/Postgres-16-4169E1?style=flat-square&logo=postgresql" />
  <img src="https://img.shields.io/badge/MVP-order_request-brightgreen?style=flat-square" />
</p>

# GreenMart Fresh

> **주문 요청 기반 친환경 식료품 커머스 MVP**
> 고객이 제철 식재료를 고르고 배송 슬롯과 연락처를 남기면, 운영자가 `/admin` 백오피스에서 상품·주문·재고·고객 데이터를 확인하고 후속 안내를 진행하는 MVP 모노레포입니다.

---

## ⚡ 하이라이트

| 영역                 | 구현                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------- |
| **고객용 주문 요청 MVP** | 상품 탐색, 카테고리 필터, 장바구니, 배송 슬롯, 정기배송 옵션, 주문 요청 접수             |
| **Postgres 영속 저장소** | 카탈로그·고객·재고·배송·주문·정산·서비스 상품을 Postgres JSONB record store에 seed/저장 |
| **주문 요청 파이프라인** | `POST /api/orders` 서버 기준 가격 검산, 중복 제출 방지, SLA 산출, 재고 리스크 평가, Postgres outbox + Vercel Cron 웹훅 재시도 |
| **운영급 데이터 모델** | 주문 요청·주문 품목·감사 로그·outbox 이벤트를 정규화 테이블로 분리하고 unique/check/index 제약 적용 |
| **운영 백오피스**    | `/admin` 및 카탈로그/커스터머/인벤토리/세틀먼트 라우트의 목록/상세/상태 관리              |
| **공유 모노레포**    | `@greenmart/shared` 패키지로 TypeScript 타입 + Zod 스키마를 프론트/백엔드 공유            |
| **⌘K 커맨드 팔레트** | VS Code/Slack 스타일 – 전체 페이지 이동, 테마 전환, 키보드 완전 제어                      |
| **다크 모드 시스템** | FOUC 방지 인라인 스크립트 + localStorage 연동 + 시스템 테마 자동 감지                     |
| **고급 스켈레톤 UI** | Shimmer 애니메이션, 대시보드/테이블/상세/카드 등 6종 전용 스켈레톤                        |
| **접근성(a11y)**     | Skip Link, ARIA Live Region, Focus Trap, 키보드 네비게이션, `prefers-reduced-motion` 대응 |
| **성능 최적화**      | `React.memo`, Intersection Observer Lazy Loading, `AnimatedNumber` 카운트업, 번들 최적화  |
| **통합 검색**        | 헤더 실시간 검색 (상품/회원/주문), `Promise.allSettled` 병렬 페칭, 키보드 탐색            |
| **알림 시스템**      | NotificationBell 드롭다운, 읽음/삭제 관리, 미읽은 배지                                    |
| **CSV 내보내기**     | 회원/주문/정산 목록 데이터 엑셀 다운로드                                                  |
| **NestJS API 서버**  | 독립 `apps/api` 서버가 `/api/admin/*`, `/api/orders`, `/api/cron/outbox`를 제공하고 웹은 proxy로 위임 |
| **테스트 구성**      | Jest + Testing Library 기반 유틸/검증/컴포넌트/훅/API 테스트 구성             |

---

## 🎯 MVP 범위

이 프로젝트는 실제 결제·실재고·물류 자동화까지 연결된 상용 커머스가 아니라, **고객 주문 요청 → 운영자 확인 → 후속 안내** 흐름을 검증하기 위한 MVP입니다.

- 고객은 상품과 배송 슬롯을 선택하고 주문 요청을 접수할 수 있습니다.
- 주문 요청은 접수번호를 발급하며, 중복 제출을 방지하고 환경변수 설정 시 Postgres outbox에 웹훅 이벤트를 적재해 재시도 상태를 추적합니다.
- 운영자는 백오피스에서 상품, 고객, 재고, 배송, 주문, 정산성 데이터를 확인하고 상태를 관리할 수 있습니다.
- 결제 승인, 회원 인증, 외부 실재고 시스템, 실제 배송사 연동, 정기결제는 MVP 범위에 포함하지 않았습니다.

---

## 📦 모노레포 아키텍처

```
greenmart-platform/
├── apps/
│   ├── web/                         # Next.js 14 프론트엔드 (고객 주문 MVP + 운영 백오피스)
│   │   └── src/
│   │       ├── app/(dashboard)/     # 고객 홈 + 운영 라우트
│   │       ├── app/api/             # NestJS API 서버로 위임하는 BFF proxy
│   │       ├── components/
│   │       │   ├── service/         # GreenMart Fresh 고객용 주문 화면
│   │       │   ├── dashboard/       # StatCard (memo), Charts (memo), AnimatedNumber
│   │       │   ├── forms/           # CRUD 모달 (상품/회원/주문 상태/삭제 확인)
│   │       │   ├── layout/          # Header, Sidebar, CommandPalette, ThemeToggle, NotificationBell
│   │       │   ├── providers/       # QueryProvider, AriaAnnouncer, QueryErrorBoundary
│   │       │   └── ui/             # Skeleton, Modal, Toast, Pagination, Badge, Breadcrumb...
│   │       ├── hooks/               # 15개 커스텀 훅 (도메인 쿼리 7 + 유틸리티 8)
│   │       └── lib/                 # API Client/proxy, 유틸, 상수, 검증, CSV 내보내기
│   └── api/                         # NestJS API 서버 (운영 API source of truth)
│       └── src/
│           ├── modules/admin/       # 운영 백오피스 API
│           ├── modules/orders/      # 고객 주문 요청 API
│           ├── modules/cron/        # outbox retry cron endpoint
│           ├── modules/service/     # 고객 서비스 카탈로그 API
│           ├── modules/health/      # health/readiness
│           ├── lib/                 # Postgres record store, order pipeline, outbox
│           └── data/                # 초기 seed 데이터
├── packages/
│   └── shared/                      # 공유 TypeScript 타입 & Zod 검증 스키마
│       └── src/
│           ├── types/               # 4개 도메인 인터페이스 + API 공통 타입
│           └── validations/         # 8개 Zod 스키마 (폼, 필터, 에러)
├── package.json                     # 모노레포 루트 (npm workspaces)
└── tsconfig.json                    # 루트 TypeScript 설정
```

---

## 🧩 기술적 디테일

### Postgres 데이터 계층

- `DATABASE_URL`/`GREENMART_DATABASE_URL` 기반 lazy connection pool로 NestJS API build 시점의 DB 초기화를 방지합니다.
- Vercel 운영 환경에서는 Neon Postgres 연결 문자열을 API 프로젝트의 `GREENMART_DATABASE_URL` 또는 `DATABASE_URL`에 설정하고, 서버리스 연결 폭증을 막기 위해 기본 pool size를 1로 제한합니다.
- 카탈로그·고객·재고·정산 seed 데이터는 `greenmart_records` JSONB record store에 저장해 운영 백오피스 CRUD와 조회 API가 모두 Postgres를 통과합니다.
- 주문 요청은 `greenmart_order_requests`, `greenmart_order_request_items`, `greenmart_order_request_audit_events`로 분리해 idempotency unique constraint, 상태 check constraint, 조회 index를 적용했습니다.
- 웹훅 outbox는 `greenmart_outbox_events`에 저장하며 NestJS API의 `/api/cron/outbox`가 `FOR UPDATE SKIP LOCKED`로 due 이벤트를 claim해 병렬 실행 시 중복 전송을 방지합니다.
- 주문 요청 생성과 outbox 적재는 같은 DB transaction 안에서 처리되어, 주문만 저장되고 외부 전달 이벤트가 누락되는 상태를 피합니다.

### 프론트엔드 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│  RootLayout                                              │
│  ├── SkipLink (a11y)                                     │
│  ├── QueryProvider (TanStack Query)                      │
│  ├── AriaAnnouncerProvider (ARIA Live Region)            │
│  └── ToastProvider                                       │
│       └── DashboardLayout                                │
│            ├── Sidebar (반응형 + 모바일 슬라이드인)        │
│            ├── ScrollProgress (스크롤 프로그레스 바)       │
│            ├── Breadcrumb (자동 경로 추적)                │
│            ├── PageTransition (fade + slide 전환)         │
│            ├── CommandPalette (⌘K)                        │
│            └── ShortcutHelpModal (⌘/)                    │
└─────────────────────────────────────────────────────────┘
```

### 커스텀 훅 (15개)

| 훅                        | 설명                                                               |
| ------------------------- | ------------------------------------------------------------------ |
| `useTheme`                | 다크 모드 상태 관리 (localStorage + system preference + FOUC 방지) |
| `useKeyboardShortcut`     | 전역 키보드 단축키 등록/해제 (meta/shift/ctrl 조합 지원)           |
| `useFocusTrap`            | 모달/다이얼로그 내 포커스 가두기 (WCAG 2.1 Level AA)               |
| `useIntersectionObserver` | Viewport 진입 감지 (Lazy Loading, 카운트업 트리거)                 |
| `useReducedMotion`        | `prefers-reduced-motion` 미디어 쿼리 감지                          |
| `useDebounce`             | 입력 디바운싱 (검색, 필터)                                         |
| `usePagination`           | 페이지네이션 로직 캡슐화                                           |
| `useMutationWithToast`    | TanStack Mutation + Toast 알림 통합                                |
| `useCatalogQueries`       | 상품/카테고리/브랜드 CRUD 쿼리                                     |
| `useCustomerQueries`      | 회원 CRUD 쿼리                                                     |
| `useOrderQueries`         | 주문 관리 쿼리                                                     |
| `useInventoryQueries`     | 재고/배송 조회 쿼리                                                |
| `usePromotionQueries`     | 프로모션/쿠폰/VOC 쿼리                                             |
| `useSettlementQueries`    | 정산/대시보드 쿼리                                                 |

### 접근성 (Accessibility)

- **Skip Link** — Tab 키로 본문 바로 이동
- **ARIA Live Region** — 스크린 리더에 동적 상태 변경 전달
- **Focus Trap** — 모달/커맨드 팔레트 내 키보드 포커스 순환
- **키보드 네비게이션** — ↑↓ 목록 탐색, Enter 선택, Esc 닫기
- **`prefers-reduced-motion`** — 모션 감소 설정 존중 (애니메이션 비활성화)
- **Focus Visible** — 키보드 탐색 시에만 브랜드 컬러 포커스 링 표시
- **Semantic HTML** — `role`, `aria-label`, `aria-expanded`, `aria-selected` 등 적극 활용

### 성능 최적화

- **`React.memo`** — StatCard, SalesChart, CategoryPieChart 등 순수 컴포넌트 메모이제이션
- **`LazySection`** — Intersection Observer로 뷰포트 진입 시에만 차트 렌더링
- **`AnimatedNumber`** — easeOutExpo 카운트업 (60fps, RAF 기반)
- **`Promise.allSettled`** — 통합 검색 시 병렬 API 호출 (일부 실패 허용)
- **Next.js 최적화** — `optimizePackageImports`, `compress`, `standalone` 빌드
- **스켈레톤 UI** — CLS(Cumulative Layout Shift) 방지

---

## 🎨 UI/UX 특징

### 다크 모드

- `localStorage` + 시스템 테마 자동 감지 (media query)
- **FOUC(Flash of Unstyled Content) 방지** — `<head>` 인라인 스크립트로 초기 플리커 제거
- `⌘D` 단축키 또는 헤더 토글로 전환
- Tailwind `dark:` 프리픽스 기반 전체 앱 다크 모드 지원

### ⌘K 커맨드 팔레트

- 전체 페이지 빠른 이동 (9개 라우트)
- 다크 모드 전환, 단축키 도움말 등 설정 액션
- 퍼지 검색 (한글/영어 키워드 매칭)
- ↑↓ 키보드 탐색 + 자동 스크롤

### 스켈레톤 로딩 시스템

| 컴포넌트              | 용도                                   |
| --------------------- | -------------------------------------- |
| `DashboardSkeleton`   | KPI 카드 + 차트 + 테이블 복합 스켈레톤 |
| `TablePageSkeleton`   | 필터바 + 테이블 + 페이지네이션         |
| `DetailPageSkeleton`  | 이미지 + 정보 카드 + 서브 섹션         |
| `ProductCardSkeleton` | 그리드 뷰 카드형 스켈레톤              |
| `ListSkeleton`        | 아바타 + 텍스트 리스트형               |
| `TableSkeleton`       | 범용 테이블 행/열                      |

---

## 🚀 시작하기

### 사전 요구사항

- Node.js >= 18
- npm >= 9
- Docker Desktop 또는 Homebrew Postgres 16+

### 설치 & 실행

```bash
# 설치
npm install

# 환경 변수
cp .env.example .env

# 로컬 Postgres 실행
# Docker가 있으면 docker compose를 사용하고,
# Docker가 없고 Homebrew postgresql@16이 설치되어 있으면 brew service를 사용합니다.
npm run db:up

# Docker가 없는 macOS 환경에서 postgresql@16도 없다면 먼저 설치
brew install postgresql@16
brew services start postgresql@16
npm run db:up

# Neon 등 외부 Postgres를 로컬에서도 쓰는 경우 apps/web/.env.local 또는 루트 .env에 DATABASE_URL 설정
# 로컬 개발에서 값을 비워두면 docker-compose 기본 URL을 사용합니다.

# 선택: 주문 요청을 외부 운영 도구로 전달
GREENMART_ORDER_WEBHOOK_URL=https://example.com/webhook

# 전체 빌드 (shared → web)
npm run build

# API 서버 실행 (Postgres API source of truth)
npm run dev:api      # http://localhost:4000

# MVP 웹 실행 (고객 화면 + 운영 백오피스 + API proxy)
npm run dev          # http://localhost:3000
```

### 테스트

```bash
# 전체 테스트
npm test

# 커버리지 포함
npm run test:coverage -w apps/web

# 개별
npm test -w apps/web

# Postgres 주문 파이프라인 통합 테스트
GREENMART_TEST_DATABASE_URL=postgres://greenmart:greenmart@localhost:5432/greenmart_test npm test -w apps/web -- --runTestsByPath src/__tests__/order-requests.test.ts
```

### 린트 & 타입 체크

```bash
npm run lint
npm run type-check
```

### Vercel + Neon 배포

운영 배포는 Next.js 웹과 NestJS API를 Vercel 프로젝트 2개로 분리하고, 영속 저장소는 Neon Postgres를 연결하는 구성을 기본으로 합니다. API source of truth는 `apps/api`입니다.

1. Neon에서 Postgres 프로젝트를 생성하고 pooled connection string을 복사합니다.
2. `greenmart-platform-api` Vercel 프로젝트의 Environment Variables에 아래 값을 설정합니다.

```bash
GREENMART_DATABASE_URL=postgres://...
GREENMART_DB_POOL_MAX=1
CRON_SECRET=<충분히 긴 랜덤 문자열>
CORS_ORIGIN=https://<web-vercel-domain>

# 선택: 주문 요청을 외부 운영 도구로 전달할 때만 설정
GREENMART_ORDER_WEBHOOK_URL=https://example.com/webhook
```

3. `greenmart-platform-web` Vercel 프로젝트의 Environment Variables에 API URL을 설정합니다.

```bash
GREENMART_API_URL=https://<api-vercel-domain>/api
```

4. Vercel 프로젝트 Root Directory를 설정하고 최신 커밋을 재배포합니다.

- web 프로젝트: 저장소 루트, 루트 `vercel.json` 사용
- api 프로젝트: `apps/api`, `apps/api/vercel.json` 사용

로컬에서 같은 순서로 검증할 수 있습니다.

```bash
npm run build -w packages/shared
npm run build -w apps/api
npm run build -w apps/web
```

5. 배포 후 API를 확인합니다.

```bash
curl https://<api-vercel-domain>/api/ready
curl https://<api-vercel-domain>/api/admin/catalog/products?page=1\&size=1
curl https://<api-vercel-domain>/api/admin/settlement/order-requests?page=1\&size=1
```

6. `apps/api/vercel.json`의 cron 설정이 `/api/cron/outbox`를 호출해 Postgres outbox 재시도를 실행합니다. 이 endpoint는 `Authorization: Bearer $CRON_SECRET` 헤더가 없으면 거부됩니다.

---

## 🗂️ 라우트 맵

| 라우트                         | 설명          | 주요 기능                                                                    |
| ------------------------------ | ------------- | ---------------------------------------------------------------------------- |
| `/`                            | 고객 주문 MVP | 상품 탐색, 장바구니, 배송 슬롯, 정기배송 옵션, 주문 요청                       |
| `/admin`                       | 운영 대시보드 | KPI 카드(AnimatedNumber), 매출 차트, 카테고리 파이차트, 인기 상품, 최근 주문 |
| `/catalog/products`            | 상품 관리     | 검색, 카테고리/브랜드 필터, 그리드/테이블 뷰, 등록/수정/삭제 모달            |
| `/catalog/products/[id]`       | 상품 상세     | 이미지, 가격/할인, 리뷰 분포 차트, 태그, 채널                                |
| `/customer/members`            | 회원 관리     | 등급/상태/채널 필터, 등록/삭제, CSV 내보내기                                 |
| `/customer/members/[id]`       | 회원 상세     | 프로필, 등급, 주문 이력, 포인트                                              |
| `/customer/promotions`         | 프로모션 관리 | 진행 중 프로모션, 쿠폰 목록                                                  |
| `/customer/promotions/[id]`    | 프로모션 상세 | 할인 조건, 적용 상품, 사용 현황                                              |
| `/customer/voc`                | 고객의 소리   | 유형/상태 필터, 통계 카드                                                    |
| `/customer/voc/[id]`           | VOC 상세      | 문의/답변 내용, 처리 타임라인                                                |
| `/inventory/stock`             | 재고 관리     | 창고 현황, 검색/필터, 재고 부족 경고                                         |
| `/inventory/delivery`          | 배송 목록     | 상태/유형 필터, 타임라인 트래커                                              |
| `/inventory/delivery/[id]`     | 배송 상세     | 진행 단계, 배송/수령 정보, 타임라인                                          |
| `/settlement/orders`           | 주문 관리     | 상태 탭, 주문 상태 변경, CSV 내보내기                                        |
| `/settlement/orders/[id]`      | 주문 상세     | 상품 목록, 결제 수단/금액 정보, 상태 변경                                    |
| `/settlement/settlements`      | 정산 목록     | 기간/상태 필터, 파트너사별 테이블, CSV                                       |
| `/settlement/settlements/[id]` | 정산 상세     | 정산 내역, 수수료 구조, 지급 정보                                            |

---

## 🔌 API 엔드포인트

| 엔드포인트                          | 메서드         | 설명                                |
| ----------------------------------- | -------------- | ----------------------------------- |
| `/api/orders`                       | POST           | 고객 주문 요청 접수, 서버 기준 가격 검산, 중복 제출 방지, Postgres outbox 웹훅 적재 |
| `/api/admin/catalog/products`       | GET/POST       | 운영 상품 목록 / 등록               |
| `/api/admin/catalog/products/:id`   | GET/PUT/DELETE | 운영 상품 상세 / 수정 / 삭제        |
| `/api/admin/catalog/categories`     | GET            | 운영 카테고리 목록                  |
| `/api/admin/catalog/brands`         | GET            | 운영 공급자 목록                    |
| `/api/admin/customer/members`       | GET/POST       | 운영 회원 목록 / 등록               |
| `/api/admin/customer/members/:id`   | GET/DELETE     | 운영 회원 상세 / 삭제               |
| `/api/admin/customer/promotions`    | GET            | 운영 프로모션 목록                  |
| `/api/admin/customer/coupons`       | GET            | 운영 쿠폰 목록                      |
| `/api/admin/customer/voc`           | GET            | 운영 VOC 목록                       |
| `/api/admin/inventory/warehouses`   | GET            | 운영 창고 목록                      |
| `/api/admin/inventory/stock`        | GET            | 운영 재고 목록                      |
| `/api/admin/inventory/deliveries`   | GET            | 운영 배송 목록                      |
| `/api/admin/settlement/order-requests` | GET         | 고객 주문 요청 큐, 리스크/SLA/웹훅 상태 조회 |
| `/api/admin/settlement/order-requests/:id/status` | PATCH | 고객 주문 요청 상태 변경            |
| `/api/admin/settlement/order-requests/outbox/retry` | POST | 실패/대기 중인 웹훅 outbox 이벤트 재시도 |
| `/api/cron/outbox`                 | GET            | Vercel Cron 전용 outbox 재시도 실행 |
| `/api/admin/settlement/orders`      | GET            | 운영 주문 목록                      |
| `/api/admin/settlement/orders/:id/status` | PATCH    | 운영 주문 상태 변경                 |
| `/api/admin/settlement/settlements` | GET            | 운영 정산 목록                      |
| `/api/admin/settlement/dashboard`   | GET            | 운영 대시보드 요약                  |

MVP 기본 실행과 운영 백오피스 조회는 Postgres와 연결된 NestJS API(`/api/admin/*`)를 사용합니다. `apps/web`의 Route Handler는 배포 경계를 유지하기 위한 proxy 역할만 담당합니다.

---

## 🔧 기술 스택

| 구분           | 기술                                                                                |
| -------------- | ----------------------------------------------------------------------------------- |
| **프론트엔드** | Next.js 14, React 18, Tailwind CSS, Recharts, TanStack Query v5, Zustand            |
| **백엔드/API** | NestJS 10, Postgres, `pg`, Node.js, TypeScript                                    |
| **공유 검증**  | Zod (프론트엔드 & 백엔드 동일 스키마)                                               |
| **테스트**     | Jest, React Testing Library                                                        |
| **아키텍처**   | npm workspaces 모노레포, 독립 NestJS API 서버, Next.js BFF proxy, Postgres record store, 정규화 주문 요청 테이블, DB-backed outbox |
| **UI/UX**      | 다크 모드, ⌘K 커맨드 팔레트, 스켈레톤 UI, 페이지 전환 애니메이션, 스크롤 프로그레스 |
| **접근성**     | WCAG 2.1 기준 — Skip Link, ARIA Live, Focus Trap, 키보드 네비게이션, 모션 감소      |
| **성능**       | React.memo, Lazy Section, AnimatedNumber, optimizePackageImports, standalone 빌드   |

---

## 🎹 키보드 단축키

| 단축키  | 동작                  |
| ------- | --------------------- |
| `⌘K`    | 커맨드 팔레트 열기    |
| `⌘D`    | 다크/라이트 모드 전환 |
| `⌘B`    | 사이드바 접기/펼치기  |
| `⌘/`    | 키보드 단축키 도움말  |
| `↑` `↓` | 검색 결과/목록 탐색   |
| `Enter` | 선택/확인             |
| `Esc`   | 팝업/모달 닫기        |

---

## 📄 라이선스

MIT © [kwakhyun](https://github.com/kwakhyun)
