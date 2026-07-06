import sequelize from "../models";

/**
 * @file List of all common constants
 */
export const ID_ONLY = ["id"];
export const REGISTRATION_ID = ["registration_id"];
export const USER_FIELDS = [
  "id",
  "name",
  "email",
  "phone",
  "is_active",
  "country_code",
  "city",
  "dob",
  "state",
  "address",
  "locality",
  "pincode",
  "profile_image",
  "kyc_self_image",
  "kyc_doc_front",
  "kyc_doc_back",
  "kyc_status",
  "referral_code",
  "latitude",
  "longitude",
  "createdAt",
];

export const USER_LOGIN_FIELDS = [
  "id",
  "name",
  "email",
  // 'country_code',
  "phone",
  // 'type',
  'dob',
  "is_active",
  "is_blocked",
  "verification_code",
  // 'address_line_1',
  // 'address_line_2',
  // 'is_aadhaar_verified',
  // 'city_id',
  // 'state_id',
  // 'is_business_active',
  // 'has_business',
  // 'referral_code',
  "city",
  "state",
  "pincode",
  "locality",
  "address",
  "latitude",
  "longitude",
  "profile_image",
  "kyc_self_image",
  "kyc_doc_front",
  "kyc_doc_back",
  "kyc_status",
  "created_at",
  "updated_at",
];


export const USER__BASIC = [
  "registration_id",
  "name",
  "city",
  "state",
  "profile_image",
  "type",
];

export const PROFESSIONAL_FIELD = [
  // "id",
  // "user_id",
  // "job_title",
  // "bio",
  // "experience",
  // "education",
  // "cover_images",
  // "total_experience",
  // "portfolio",
  // "website",
  // "language",
  // "skill",
  // "service",
  // "main_category",
  // "availability",
  // "avg_ratings",
  // "total_ratings",
];


export const NOTIFICATIONS_FIELD = [
  "notification_id",
  "notification_from",
  "notification_to",
  "event_id",
  "notification",
  "notification_type",
  "createdAt",
];

export const USER_COMPLETENESS = [
  "name",
  "mobile",
  "email",
  "address",
  "city",
  "state",
  "pincode",
  "locality",
  "profile_image",
];

export const COUPON_FIELD = [
  "coupon_id",
  "coupon_code",
  "coupon_type",
  "description",
];

export const ORDER_FIELD = [
  "id",
  "order_type",
  "business_category_id",
  "plan_name",
  "tax",
  "first_amount",
];


export const DEVICE_FIELD = [
  "id",
  "device_id",
  "device_name",
  "device_type",
  "firmware_version",
  "sim_number",
  "owner_id",
  // "owner_type",
  "is_active",
  "created_at",
  "updated_at"
];


export const ORDER_DETAIL_FIELD = [
  "order_id",
  "order_for",
  "order_type",
  "order_amount",
  "business_category_id",
  "sub_total",
  "tax",
  "tax_percentage",
  "coupon_code",
  "discount_amount",
  "final_total",
  "plan_name",
  "createdAt",
  "order_status_new",
  "payment_status_new",
  "advocate_commission",
];


export const REFERRAL_FIELD = ["id", "refer_by", "refer_to"];

export const ASSET_FIELD = [
  "id",
  "user_id",
  "type",
  "name",
  "registration_number",
  "make",
  "model",
  "color",
  "metadata",
  "created_at",
  "updated_at"
];


export const TELEMETRY_FIELD = [
  "id",
  "device_id",
  "latitude",
  "longitude",
  "speed",
  "heading",
  "ignition",
  "recorded_at",
];