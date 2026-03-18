<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Express-4.x-green?style=flat-square&logo=express" />
  <img src="https://img.shields.io/badge/TanStack_Query-5-red?style=flat-square&logo=react-query" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Zod-3.x-3068B7?style=flat-square" />
  <img src="https://img.shields.io/badge/Tests-189_passed-brightgreen?style=flat-square" />
</p>

# 🌿 GreenMart Core Platform

> **Health & Beauty 이커머스 어드민 플랫폼**
> 모노레포 기반 카탈로그 · 커스터머 · 인벤토리 · 세틀먼트 통합 관리 시스템

4개 도메인(카탈로그/커스터머/인벤토리/세틀먼트)의 **풀스택 CRUD 파이프라인**을
하나의 모노레포에서 타입 안전하게 운영하는 이커머스 코어 플랫폼입니다.

---

## ⚡ 하이라이트

| 영역                 | 구현                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------- |
| **풀스택 CRUD**      | 16개 라우트, 30+ API 엔드포인트, 8개 도메인 모델의 목록/상세/생성/수정/삭제               |
| **공유 모노레포**    | `@greenmart/shared` 패키지로 TypeScript 타입 + Zod 스키마를 프론트/백엔드 공유            |
| **⌘K 커맨드 팔레트** | VS Code/Slack 스타일 – 전체 페이지 이동, 테마 전환, 키보드 완전 제어                      |
| **다크 모드 시스템** | FOUC 방지 인라인 스크립트 + localStorage 연동 + 시스템 테마 자동 감지                     |
| **고급 스켈레톤 UI** | Shimmer 애니메이션, 대시보드/테이블/상세/카드 등 6종 전용 스켈레톤                        |
| **접근성(a11y)**     | Skip Link, ARIA Live Region, Focus Trap, 키보드 네비게이션, `prefers-reduced-motion` 대응 |
| **성능 최적화**      | `React.memo`, Intersection Observer Lazy Loading, `AnimatedNumber` 카운트업, 번들 최적화  |
| **통합 검색**        | 헤더 실시간 검색 (상품/회원/주문), `Promise.allSettled` 병렬 페칭, 키보드 탐색            |
| **알림 시스템**      | NotificationBell 드롭다운, 읽음/삭제 관리, 미읽은 배지                                    |
| **CSV 내보내기**     | 회원/주문/정산 목록 데이터 엑셀 다운로드                                                  |
| **API 문서**         | Swagger `/api/docs`에서 전체 엔드포인트 인터랙티브 테스트                                 |
| **148+ 테스트**      | Jest + Testing Library + Supertest – 유틸/검증/컴포넌트/훅/API 189개 통합 테스트          |

---

## 📦 모노레포 아키텍처

```
greenmart-platform/
├── apps/
│   ├── web/                         # Next.js 14 프론트엔드 (관리자 대시보드)
│   │   └── src/
│   │       ├── app/(dashboard)/     # 16개 라우트 (목록 + 상세 페이지)
│   │       ├── components/
│   │       │   ├── dashboard/       # StatCard (memo), Charts (memo), AnimatedNumber
│   │       │   ├── forms/           # CRUD 모달 (상품/회원/주문 상태/삭제 확인)
│   │       │   ├── layout/          # Header, Sidebar, CommandPalette, ThemeToggle, NotificationBell
│   │       │   ├── providers/       # QueryProvider, AriaAnnouncer, QueryErrorBoundary
│   │       │   └── ui/             # Skeleton, Modal, Toast, Pagination, Badge, Breadcrumb...
│   │       ├── hooks/               # 15개 커스텀 훅 (도메인 쿼리 7 + 유틸리티 8)
│   │       └── lib/                 # API Client, 유틸, 상수, 검증, CSV 내보내기
│   └── api/                         # Express REST API 서버
│       └── src/
│           ├── routes/              # 4개 도메인 라우터 (30+ 엔드포인트)
│           ├── services/            # 비즈니스 로직 계층
│           ├── repositories/        # 데이터 접근 계층
│           ├── middleware/          # Zod 검증, CORS, 에러 핸들링
│           └── lib/                 # Winston 로거, Swagger 설정
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

### 설치 & 실행

```bash
# 설치
npm install

# 환경 변수
cp .env.example .env

# 전체 빌드 (shared → api → web)
npm run build

# 개발 서버 (웹 + API 동시 실행)
npm run dev          # http://localhost:3000 + http://localhost:4000

# 개별 실행
npm run dev:web      # http://localhost:3000
npm run dev:api      # http://localhost:4000
```

### 테스트

```bash
# 전체 테스트 (API 27 + Web 162 = 189)
npm test

# 커버리지 포함
npm run test:coverage

# 개별
npm test -w apps/web
npm test -w apps/api
```

### 린트 & 타입 체크

```bash
npm run lint
npm run type-check
```

---

## 🗂️ 라우트 맵

| 라우트                         | 설명          | 주요 기능                                                                    |
| ------------------------------ | ------------- | ---------------------------------------------------------------------------- |
| `/`                            | 대시보드      | KPI 카드(AnimatedNumber), 매출 차트, 카테고리 파이차트, 인기 상품, 최근 주문 |
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
| `/settlement/orders/[id]`      | 주문 상세     | 상품 목록, 결제 정보, 상태 변경                                              |
| `/settlement/settlements`      | 정산 목록     | 기간/상태 필터, 파트너사별 테이블, CSV                                       |
| `/settlement/settlements/[id]` | 정산 상세     | 정산 내역, 수수료 구조, 지급 정보                                            |

---

## 🔌 API 엔드포인트

| 엔드포인트                          | 메서드         | 설명                                |
| ----------------------------------- | -------------- | ----------------------------------- |
| `/api/health`                       | GET            | 헬스 체크                           |
| `/api/docs`                         | GET            | Swagger API 문서                    |
| **카탈로그**                        |                |                                     |
| `/api/catalog/products`             | GET/POST       | 상품 목록(필터/페이지네이션) / 등록 |
| `/api/catalog/products/:id`         | GET/PUT/DELETE | 상품 상세 / 수정 / 삭제             |
| `/api/catalog/categories`           | GET            | 카테고리 목록                       |
| `/api/catalog/brands`               | GET            | 브랜드 목록                         |
| **커스터머**                        |                |                                     |
| `/api/customer/members`             | GET/POST       | 회원 목록 / 등록                    |
| `/api/customer/members/:id`         | GET/DELETE     | 회원 상세 / 삭제                    |
| `/api/customer/promotions`          | GET            | 프로모션 목록                       |
| `/api/customer/promotions/:id`      | GET            | 프로모션 상세                       |
| `/api/customer/coupons`             | GET            | 쿠폰 목록                           |
| `/api/customer/voc`                 | GET            | VOC 목록                            |
| `/api/customer/voc/:id`             | GET            | VOC 상세                            |
| **인벤토리**                        |                |                                     |
| `/api/inventory/warehouses`         | GET            | 창고 목록                           |
| `/api/inventory/stock`              | GET            | 재고 목록                           |
| `/api/inventory/deliveries`         | GET            | 배송 목록                           |
| `/api/inventory/deliveries/:id`     | GET            | 배송 상세                           |
| `/api/inventory/movements`          | GET            | 재고 이동 내역                      |
| **세틀먼트**                        |                |                                     |
| `/api/settlement/orders`            | GET            | 주문 목록                           |
| `/api/settlement/orders/:id`        | GET            | 주문 상세                           |
| `/api/settlement/orders/:id/status` | PATCH          | 주문 상태 변경                      |
| `/api/settlement/settlements`       | GET            | 정산 목록                           |
| `/api/settlement/settlements/:id`   | GET            | 정산 상세                           |
| `/api/settlement/dashboard`         | GET            | 대시보드 요약                       |

---

## 🔧 기술 스택

| 구분           | 기술                                                                                |
| -------------- | ----------------------------------------------------------------------------------- |
| **프론트엔드** | Next.js 14, React 18, Tailwind CSS, Recharts, TanStack Query v5, Zustand            |
| **백엔드**     | Express, Node.js, TypeScript, Swagger/OpenAPI, Winston                              |
| **공유 검증**  | Zod (프론트엔드 & 백엔드 동일 스키마)                                               |
| **테스트**     | Jest, React Testing Library, Supertest                                              |
| **아키텍처**   | npm workspaces 모노레포, Controller → Service → Repository                          |
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
