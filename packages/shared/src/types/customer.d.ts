/** 회원 등급 */
export type MemberGrade = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
/** 회원 상태 */
export type MemberStatus = "ACTIVE" | "DORMANT" | "WITHDRAWN";
/** 가입 채널 */
export type JoinChannel = "ONLINE" | "OFFLINE" | "APP" | "GLOBAL";
/** 회원 */
export interface Customer {
    id: string;
    email: string;
    name: string;
    phone: string;
    grade: MemberGrade;
    status: MemberStatus;
    joinChannel: JoinChannel;
    points: number;
    coupons: number;
    totalPurchaseAmount: number;
    totalOrders: number;
    lastLoginAt: string;
    joinedAt: string;
    birthDate?: string;
    address?: Address;
    preferences?: CustomerPreferences;
}
/** 주소 */
export interface Address {
    zipCode: string;
    address1: string;
    address2: string;
    city: string;
    isDefault: boolean;
}
/** 고객 선호도 */
export interface CustomerPreferences {
    skinType: string[];
    favoriteCategories: string[];
    favoriteBrands: string[];
    marketingConsent: boolean;
    pushNotification: boolean;
}
/** 쿠폰 타입 */
export type CouponType = "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
/** 쿠폰 상태 */
export type CouponStatus = "ACTIVE" | "USED" | "EXPIRED";
/** 쿠폰 */
export interface Coupon {
    id: string;
    code: string;
    name: string;
    type: CouponType;
    value: number;
    minPurchaseAmount: number;
    maxDiscountAmount?: number;
    status: CouponStatus;
    applicableCategories?: string[];
    applicableBrands?: string[];
    startDate: string;
    endDate: string;
    usedAt?: string;
}
/** 프로모션 타입 */
export type PromotionType = "DISCOUNT" | "BUNDLE" | "GIFT" | "POINTS_MULTIPLIER" | "FREE_SHIPPING";
/** 프로모션 */
export interface Promotion {
    id: string;
    name: string;
    description: string;
    type: PromotionType;
    value: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    targetProducts?: string[];
    targetCategories?: string[];
    targetGrades?: MemberGrade[];
    bannerImageUrl?: string;
    participantCount: number;
    maxParticipants?: number;
}
/** 고객 메시지 */
export interface CustomerMessage {
    id: string;
    customerId: string;
    type: "PUSH" | "SMS" | "EMAIL" | "KAKAO";
    title: string;
    content: string;
    sentAt: string;
    readAt?: string;
    isRead: boolean;
}
/** 고객의 소리 (VOC) */
export interface CustomerVoice {
    id: string;
    customerId: string;
    customerName: string;
    type: "INQUIRY" | "COMPLAINT" | "SUGGESTION" | "COMPLIMENT";
    category: string;
    title: string;
    content: string;
    status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    assignee?: string;
    createdAt: string;
    resolvedAt?: string;
    response?: string;
}
