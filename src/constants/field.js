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

export const MATRIMONIAL_FIELDS = [
  "id",
  "created_at",
  "updated_at",
  "name",
  "gender",
  "caste",
  "sub_caste",
  "date_time_birth",
  "is_manglik",
  "qualification",
  "occupation",
  "work_place",
  "income_per_month",
  "total_family_members",
  "father_name",
  "father_occupation",
  "address",
  "phone",
  "mother_name",
  "mother_occupation",
  "food_preference",
  "no_of_brother",
  "no_of_sister",
  "additional_info",
  "added_by_id",
  "birth_city",
  "birth_state",
  "height",
];

export const MATRIMONIAL_REQUEST_FIELDS = [
  "id",
  "sender_id",
  "matrimonial_profile_id",
  "status",
];

export const MATRIMONIAL_PHOTO_FIELD = [
  "id",
  "user_matrimonial_id",
  "path",
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
  "id",
  "user_id",
  "job_title",
  "bio",
  "experience",
  "education",
  "cover_images",
  "total_experience",
  "portfolio",
  "website",
  "language",
  "skill",
  "service",
  "main_category",
  "availability",
  "avg_ratings",
  "total_ratings",
];

export const LEADS_FIELD = [
  "id",
  "topic",
  "sub_topic",
  "city",
  "name",
  "query",
  "quotes",
  "required",
  "credits",
  "createdAt",
];

export const REVIEWS_FIELD = [
  "id",
  "user_id",
  "business_id",
  "rating",
  "review",
  "created_at",
];

export const FAVORITE_FIELD = [
  "id",
  "user_id",
  "business_id",
  "matrimonial_id",
  "created_at",
];

export const AVAILED_BUSINESS_FIELD = [
  "id",
  "user_id",
  "business_id",
  "created_at",
];

export const RECENT_VIEW_FIELD = ["id", "user_id", "business_id", "created_at"];

export const AD_FIELD = [
  "id",
  "active_from",
  "active_to",
  "locality",
  "city",
  "state",
  "latitude",
  "longitude",
  "radius",
  "is_active",
  "created_at",
  "placement",
];

export const CONTACT_FIELD = [
  "id",
  "name",
  "email",
  "mobile",
  "message",
  "type",
  "user_id",
  "createdAt",
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

export const QUESTIONS_FIELD_LISTING = [
  "question_id",
  "question_title",
  "status",
  "question_by",
  [sequelize.fn("LEFT", sequelize.col("question"), 130), "question"],
  "question_type",
  "area_of_law",
  "answers",
  "createdAt",
];

export const QUESTIONS_FIELD = [
  "question_id",
  "question_title",
  "status",
  "question_by",
  "question",
  "question_type",
  "area_of_law",
  "answers",
  "createdAt",
];

export const LAWYER_FIELD = [
  "area_of_law",
  "service_area",
  "practicing_since",
  "credits",
  "enrollment_number",
  "tags",
  "avg_ratings",
  "total_ratings",
  "total_answers",
  "courts",
  "language_spoken",
  "is_verified",
  "is_paid",
  "is_pro",
  "voice_charges",
  "message_charges",
  "video_charges",
  "f2f_charges",
  "voice_discount",
  "message_discount",
  "video_discount",
  "f2f_discount",
  "voice_charges_final",
  "message_charges_final",
  "video_charges_final",
  "f2f_charges_final",
  "education",
  "bio",
  "blog_author_id",
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

export const LAWYER_COMPLETENESS = [
  "area_of_law",
  "service_area",
  "practicing_since",
  "enrollment_number",
  "courts",
  "language_spoken",
  "voice_charges",
  "message_charges",
  "video_charges",
  "f2f_charges",
  "voice_charges_final",
  "message_charges_final",
  "video_charges_final",
  "f2f_charges_final",
  "bio",
];

export const START_DESC_ORDER = ["datetimeStart", "desc"];

export const CITY_FIELD = ["city_name"];

export const STATE_FIELD = ["city_state"];

export const AREA_OF_LAW_FIELD = ["law_name"];

export const LANGUAGE_FIELD = ["language_name"];

export const COURT_FIELD = ["court_name"];

export const COUPON_FIELD = [
  "coupon_id",
  "coupon_code",
  "coupon_type",
  "description",
];

export const CATEGORY_FIELD = [
  "id",
  "name",
  "position",
  "hindi_name",
  "image",
  "is_active",
  "is_featured",
];

export const SUB_CATEGORY_FIELD = [
  "id",
  "name",
  "position",
  "hindi_name",
  "image",
  "category_id",
  "is_popular",
  "is_gps_mandatory",
  "is_aadhaar_mandatory",
];

export const BUSINESS_FIELD = [
  "id",
  "name",
  "address",
  "description",
  "email",
  "whatsapp",
  // 'location',
  "is_top_rated",
  "is_verified_phone",
  "is_unavailable",
  "owner_name",
  "cover_image",
  "video",
  "specialized_in",
  "phone",
  'category_id',
  'sub_category_id',
  "rating",
  "user_id",
  "most_recommended",
  "locality",
  "city",
  "state",
  "pincode",
  "latitude",
  "longitude",
  "is_active",
  "subscribe_from",
  "subscribe_to",
  "avail_count",
  "view_count",
];

export const USER_CATEGORY_FIELD = [
  "id",
  "user_id",
  "category_id",
  "createdAt",
  "updatedAt",
];

export const ORDER_FIELD = [
  "id",
  "order_type",
  "business_category_id",
  "plan_name",
  "tax",
  "first_amount",
];

export const BANNERS_FIELD = [
  "id",
  "name",
  "path",
  "business_id",
  "user_id",
  "is_active",
  "priority",
  "type",
  "created_at"
];

export const HARDWARE_DEVICE_FIELD = [
  "id",
  "user_id",
  "device_id",
  "device_type",
  "name",
  "metadata",
  "heartbeat",
  "latitude",
  "longitude",
  "last_recorded_at",
  "is_active",
  "created_at",
  "updated_at"
];

export const DEVICE_FIELD = [
  "id",
  "device_id",
  "device_name",
  "device_type",
  "firmware_version",
  "sim_number",
  // "owner_id",
  // "owner_type",
  "is_active",
  "created_at",
  "updated_at"
];

export const BUSINESS_PHOTO_FIELD = [
  "id",
  "business_id",
  "path"
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

export const WALLETS_FIELD = [
  "id",
  "type",
  "status",
  "amount",
  "currency",
  "exchange_rate",
  "createdAt",
];

export const SERVICES_FIELD = [
  "service_id",
  "title",
  "fee",
  "booking_fee",
  "image",
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