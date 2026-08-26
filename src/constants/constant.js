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
  ONE_YEAR: {
    TITLE: "1 Year Subscription",
    FEATURES: [
      "Unlimited Locations",
      "3 Months Data Retention",
      "Unlimited Views",
    ],
    FEE: 999,
    VALIDITY: "1 Year",
    DAYS: 365
  },
  TWO_YEARS: {
    TITLE: "2 Years Subscription",
    FEATURES: [
      "Unlimited Locations",
      "6 Months Data Retention",
      "Unlimited Views",
    ],
    FEE: 1999,
    VALIDITY: "2 Years",
    DAYS: 730
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
  IGNITION_STATE_CHANGED: "IGNITION_STATE_CHANGED",
  OTP_CONFIRM: "OTP_CONFIRM",
  OVERSPEED: "OVERSPEED",
  GEOFENCE: "GEOFENCE",
  DEVICE_ALARM: "DEVICE_ALARM",
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
  '+919871102231',
]

export const EVENT = Object.freeze({
  // Device Command
  RELAY_ON: 'RELAY_ON',
  RELAY_OFF: 'RELAY_OFF',

  // Geofence (server-side mapped zones)
  GEOFENCE_ENTER: 'GEOFENCE_ENTER',
  GEOFENCE_EXIT: 'GEOFENCE_EXIT',

  // Speed
  OVERSPEED: 'OVERSPEED',

  // Ignition
  IGNITION_ON: 'IGNITION_ON',
  IGNITION_OFF: 'IGNITION_OFF',

  // Device-side alarms (ET06 0x13 / 0x16)
  SOS: 'SOS',
  SHOCK: 'SHOCK',
  POWER_CUT: 'POWER_CUT',
  LOW_BATTERY: 'LOW_BATTERY',
  DEVICE_GEOFENCE_IN: 'DEVICE_GEOFENCE_IN',
  DEVICE_GEOFENCE_OUT: 'DEVICE_GEOFENCE_OUT',
  REMOVAL: 'REMOVAL',
});

export const GEOFENCE_TYPE = Object.freeze({
  // Geofence Type
  REGULAR_ZONE: 'REGULAR_ZONE',
  SAFE_ZONE: 'SAFE_ZONE',
  NO_ENTRY_ZONE: 'NO_ENTRY_ZONE',
});

export const SPEED_TYPE = Object.freeze({
  OVERSPEED: 'OVERSPEED',
  IDLE: 'IDLE',
});


export const CHECKOUT_TITLE = {
  FEE: "Service Fee",
  VALIDITY: "Validity"
}

export const TAX = {
  title: "GST",
  // slab: 18
  slab: 0
}

export const INVENTORY_STATUS = Object.freeze({
  IN_STOCK: 'IN_STOCK',
  ASSIGNED: 'ASSIGNED',
  SOLD: 'SOLD',
  ACTIVATED: 'ACTIVATED'
});

export const HOLDER_TYPE = Object.freeze({
  ADMIN: 'ADMIN',
  DISTRIBUTOR: 'DISTRIBUTOR',
  DEALER: 'DEALER',
  CUSTOMER: 'CUSTOMER'
});