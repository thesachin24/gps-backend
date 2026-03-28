/**@fileOverview
 * This file contains constants which are used in database objects
 */

export const APP_NAME = "GPS";

export const DEVICE_TYPE = Object.freeze({
  WEB: 1,
  ANDROID: 2
});

export const USER_TYPE = Object.freeze({
  USER: "user",
});

export const CONTACT_TYPE = Object.freeze({
  QUERRY: "QUERRY",
  BOOKING: "BOOKING"
});

export const ROLES = Object.freeze({
  DEFAULT: "DEFAULT",
  ADMIN: "ADMIN"
});

export const ORDER_TYPE = Object.freeze({
  SUBSCRIPTION: "SUBSCRIPTION",
  ADVERTISEMENT: "ADVERTISEMENT",
  CONSULTATION: "CONSULTATION"
});


export const PAYMENT_STATUS = Object.freeze({
  INITIATED: "INITIATED",
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED"
});


export const ORDER_STATUS = Object.freeze({
  //Subscription
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
});

export const OPTIONS = Object.freeze({
  PAYMENT: ['BANK', 'UPI', 'OTHER'],
  CUSTOMER_SUPPORT: ['CUSTOMER_SUPPORT'],
  MAINTENANCE: ['ONGOING','UPCOMING'],
  INVESTMENT: ['INVESTMENT'],
  ALERT: ['ALERT'],
  APP_FORCE_UPDATE: ['ANDROID','IOS'],
});

export const SUBSCRIPTIONS = {
  BASIC: {
    TITLE: "3 Months Subscription",
    FEATURES: [
      "3 Months Subscription",
      "1000 Views",
    ],
    FEE: 2999,
    VALIDITY: "3 Months",
    DAYS: 90
  }
}

export const FAQS = [
  {
    "question": "What is this?",
    "answer": "Xyz Answer.",
    "type": "common"
  }
]



export const COUPON_TYPE = {
  PERCENTAGE: "PERCENTAGE",
  FLAT: "FLAT"
}

export const TRANSACTION_TYPE = {
  DEPOSIT: "DEPOSIT",
  WITHDRAWAL: "WITHDRAWAL"
}


export const FORCE_UPDATE = {
  //If Device version == Latest Version -> No Popup
  //If Device version >= Min Version -> Skip Popup
  //If Device version < Min Version -> Force Update
  LATEST_VERSION: 1.5,
  MIN_VERSION: 1.5
}

export const MOBILE = 'phone';


export const CUSTOMER_SUPPORT = {
  MOBILE: "+91-999999999",
  WHATSAPP: "+91-999999999",
  EMAIL: "support@xyz.com",
  FACEBOOK: "https://www.facebook.com",
  WEBSITE: "https://www.xyz.com",
}

export const MAINTENANCE = {
  ONGOING: {
    SHOW: false,
    ALERT: "We are currently undergoing scheduled maintenance. Please try again in some time."
  },
  UPCOMING: {
    SHOW: false,
    ALERT: "We are....."
  }
}

export const KYC_STATUS = Object.freeze({
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
});


export const MATRIMONIAL_STATUS = Object.freeze({
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
});


export const MATRIMONIAL_REQUEST_STATUS = Object.freeze({
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED"
});


export const NOTIFY = Object.freeze({
  OTP_CONFIRM: "OTP_CONFIRM",
  SUBSCRIPTION_CHARGED: "SUBSCRIPTION_CHARGED",
  REFUND_PROCESSED: "REFUND_PROCESSED"
});

export const BANNER_TYPE = Object.freeze({
  SUBSCRIPTION: "SUBSCRIPTION",
  CONSULTATION: "CONSULTATION"
});

export const NOTIFY_SERVICES = Object.freeze({
  EMAIL: false,
  PUSH: true,
  TELEGRAM: false,
  SMS: true,
  WHATSAPP: false,
});

export const SUBSCRIPTION_STATUS = Object.freeze({
  UNSUBSCRIBED: 'UNSUBSCRIBED',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
});

export const TEST_NUMBERS = [
  // '+919871102231',
  '+919999453558',
  '+917836944462'
]