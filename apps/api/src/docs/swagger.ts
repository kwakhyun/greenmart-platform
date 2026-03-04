/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: 서버 헬스 체크
 *     responses:
 *       200:
 *         description: 서버 정상 동작
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *
 * /api/catalog/products:
 *   get:
 *     tags: [Catalog]
 *     summary: 상품 목록 조회 (필터, 검색, 페이지네이션)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 12
 *         description: 페이지 크기
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색어 (상품명, 브랜드명, 카테고리명)
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: 카테고리 ID
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: string
 *         description: 브랜드 ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, OUT_OF_STOCK, DISCONTINUED]
 *         description: 상품 상태
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [latest, price_asc, price_desc, rating, reviews]
 *           default: latest
 *         description: 정렬 기준
 *     responses:
 *       200:
 *         description: 상품 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *   post:
 *     tags: [Catalog]
 *     summary: 상품 등록
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, brandId, categoryId, originalPrice, salePrice, description, shortDescription, tags, salesChannels, status]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               brandId:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               originalPrice:
 *                 type: number
 *                 minimum: 100
 *               salePrice:
 *                 type: number
 *                 minimum: 0
 *               description:
 *                 type: string
 *                 minLength: 10
 *               shortDescription:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               salesChannels:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [ONLINE, OFFLINE, GLOBAL]
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, OUT_OF_STOCK, DISCONTINUED]
 *     responses:
 *       201:
 *         description: 상품 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: 유효성 검증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 * /api/catalog/products/{id}:
 *   get:
 *     tags: [Catalog]
 *     summary: 상품 상세 조회
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: 상품 상세
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: 상품 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   put:
 *     tags: [Catalog]
 *     summary: 상품 수정
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 상품 수정 성공
 *       404:
 *         description: 상품 없음
 *   delete:
 *     tags: [Catalog]
 *     summary: 상품 삭제
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       404:
 *         description: 상품 없음
 *
 * /api/catalog/categories:
 *   get:
 *     tags: [Catalog]
 *     summary: 카테고리 목록 조회
 *     responses:
 *       200:
 *         description: 카테고리 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *
 * /api/catalog/brands:
 *   get:
 *     tags: [Catalog]
 *     summary: 브랜드 목록 조회
 *     responses:
 *       200:
 *         description: 브랜드 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Brand'
 *
 * /api/customer/members:
 *   get:
 *     tags: [Customer]
 *     summary: 회원 목록 조회
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *           enum: [BRONZE, SILVER, GOLD, PLATINUM]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, DORMANT, WITHDRAWN]
 *     responses:
 *       200:
 *         description: 회원 목록
 *
 * /api/customer/promotions:
 *   get:
 *     tags: [Customer]
 *     summary: 프로모션 목록 조회
 *     responses:
 *       200:
 *         description: 프로모션 목록
 *
 * /api/customer/voc:
 *   get:
 *     tags: [Customer]
 *     summary: 고객의 소리 목록 조회
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INQUIRY, COMPLAINT, SUGGESTION, COMPLIMENT]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, RESOLVED, CLOSED]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *     responses:
 *       200:
 *         description: VOC 목록
 *
 * /api/inventory/stock:
 *   get:
 *     tags: [Inventory]
 *     summary: 재고 목록 조회
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [IN_STOCK, LOW_STOCK, OUT_OF_STOCK, RESERVED]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 재고 목록
 *
 * /api/inventory/deliveries:
 *   get:
 *     tags: [Inventory]
 *     summary: 배송 목록 조회
 *     responses:
 *       200:
 *         description: 배송 목록
 *
 * /api/settlement/orders:
 *   get:
 *     tags: [Settlement]
 *     summary: 주문 목록 조회
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 주문 목록
 *
 * /api/settlement/settlements:
 *   get:
 *     tags: [Settlement]
 *     summary: 정산 내역 조회
 *     responses:
 *       200:
 *         description: 정산 목록
 *
 * /api/settlement/dashboard:
 *   get:
 *     tags: [Settlement]
 *     summary: 대시보드 요약 데이터
 *     responses:
 *       200:
 *         description: 대시보드 요약
 */
export {};
