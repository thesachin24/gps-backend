import Sequelize from 'sequelize';
import logger from "../config/logger";
import {
  MESSAGE_CONSTANTS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  ORDER_TYPE,
  TAX,
  WALLET_CREDIT_MULTIPLY,
  WALLET_STATUS,
  WALLET_TYPE,
  SUBSCRIPTIONS,
  WALLET_CREDIT_MULTIPLY_PRO,
  LAWYER_COMMISSION,
  NOTIFY,
  MOBILE,
  USER__BASIC,
  USER_TYPE,
  BAD_REQUEST,
  CREATED,
} from "../constants";
import {
  createOrder,
  createTransaction,
  createUser,
  createWallet,
  getAd,
  getBusiness,
  getLawyer,
  getLawyerSubscription,
  getOrder,
  getPayout,
  getTransaction,
  getUserWithIgnoreCase,
  updateAd,
  updateBusiness,
  updateLawyer,
  updateMultiOrder,
  updateOrder,
  updatePayout,
} from "../dao";
import sequelize from "../models";
import {
  calculateCredits,
  CustomError,
  get10DigitMobile,
  getTax,
  getTaxIncluding,
  precise,
  _notify,
} from "../utils";
import { createOrderInvoice } from "../utils/invoice";

export const _performOrderAction = async (order_id) => {
  const orderInfo = await getOrder({
    rzr_order_id: order_id,
    type: { [Sequelize.Op.in]: [ORDER_TYPE.ADVERTISEMENT, ORDER_TYPE.CONSULTATION] },
  });

  if (!orderInfo) {
    throw new CustomError(
      BAD_REQUEST,
      "Ignoring Order! Not Found or Likely a Subscription Order."
    );
    return;
  }

  const { type, ad_id } = orderInfo;
  //Perform Advertisement Action
  if (type === ORDER_TYPE.ADVERTISEMENT) {
    console.log("ad_id", ad_id);
    const adInfo = await getAd({
      id: ad_id,
    });

    if (!adInfo) {
      throw new CustomError(BAD_REQUEST, "Ad Not Found");
    }
    await updateAd(adInfo, {
      is_active: true,
    });
  }
  return orderInfo;
};


export const _performSubscriptionAction = async (orderInfo) => {
  const { type, subscription_id, business_id } = orderInfo;
  // console.log("orderInfo", orderInfo);
  //Perform Subscription Action
  if (type === ORDER_TYPE.SUBSCRIPTION) {
    
    const businessInfo = await getBusiness({
      id: business_id,
    });

    if (!businessInfo) {
      throw new CustomError(BAD_REQUEST, "Business Not Found");
    }
    await updateBusiness(businessInfo, {
      subscribe_from: orderInfo.start_date,
      subscribe_to: orderInfo.end_date,
    });

    //Notify User
    _notify(NOTIFY.SUBSCRIPTION_CHARGED, orderInfo.user_id, {
      name: businessInfo.name,
      order_id: orderInfo.id,
      start_date: orderInfo.start_date,
      end_date: orderInfo.end_date,
    });
  }
  return orderInfo;
};

export const _activateSubscription = async (subscription_id, order_id, subscription) => {
  let orderInfo = {};


  const start_date = new Date(subscription.current_start * 1000);
  const end_date = new Date(subscription.current_end * 1000);

  // First Subscription Order
  orderInfo = await getOrder({
    rzr_subscription_id: subscription_id,
    rzr_order_id: null,
    type: ORDER_TYPE.SUBSCRIPTION,
  });
  if (orderInfo) {
    await updateOrder(orderInfo, { rzr_order_id: order_id, start_date, end_date });
    return orderInfo;
  }

  // Check if the subscription is already charged
  orderInfo = await getOrder({
    rzr_subscription_id: subscription_id,
    rzr_order_id: order_id,
    type: ORDER_TYPE.SUBSCRIPTION,
  });

  if (orderInfo) {
    throw new CustomError(
      BAD_REQUEST,
      MESSAGE_CONSTANTS.ALREADY_SUBSCRIPTION_CHARGED
    );
  } else {
    // Create a new subscription order from previous subscription order
    let previousOrderInfo = await getOrder({
      rzr_subscription_id: subscription_id,
      type: ORDER_TYPE.SUBSCRIPTION,
    });
    previousOrderInfo = previousOrderInfo.toJSON();
    if (previousOrderInfo) {
      delete previousOrderInfo.id;
      return await createOrder({
        ...previousOrderInfo,
        rzr_order_id: order_id,
        start_date,
        end_date,
      });
    }
  }
};

export const _createTransaction = async (event, payment, receipt) => {
  const { amount, email, contact, order_id } = payment;
  const transaction = {
    event,
    order_id: receipt,
    rzr_order_id: order_id,
    amount: amount / 100,
    email: email,
    phone: contact,
  };
  await createTransaction(transaction);
};

export const _updateOrderData = async (orderInfo, event) => {
  let update = {};
  if (event === "order.paid") {
    let order_status = ORDER_STATUS.ACTIVE;
    update = {
      payment_status: PAYMENT_STATUS.PAID,
      order_status,
    };
  } else if (event === "refund.processed") {
    update = {
      payment_status: PAYMENT_STATUS.REFUNDED,
    };
  } else if (event === "payment.failed") {
    update = {
      payment_status: PAYMENT_STATUS.FAILED,
    };
  } else if (event === "subscription.charged") {
    update = {
      payment_status: PAYMENT_STATUS.PAID,
      order_status: ORDER_STATUS.ACTIVE,
    };
  }
  console.log(update);
  return updateOrder(orderInfo, update);
};

export const _proceed = async (event, payment, order, subscription) => {
  let orderInfo = {};

  //Action for Advertisement || Ignore Subscription Order
  if (event === "order.paid") {
    //Only for Advertisement
    console.log(
      "*********************** Action for Advertisement OR Consultation ***********************"
    );
    orderInfo = await _performOrderAction(payment.order_id);
  }

  //Action for Subscription
  if (event === "subscription.charged") {
    console.log(
      "*********************** Action for Subscription.... ***********************"
    );
    orderInfo = await _activateSubscription(
      subscription.id,
      payment.order_id,
      subscription
    );
    await _performSubscriptionAction(orderInfo);
  }

  //If already Paid - Order
  if (event === "order.paid") {
    if (orderInfo.payment_status == PAYMENT_STATUS.PAID) {
      // throw new CustomError(CREATED, MESSAGE_CONSTANTS.ALREADY_PAID);
    }
  }

  if (orderInfo) {
    //Update Order Payment Status & Order Status
    return _updateOrderData(orderInfo, event);
  } else {
    return {};
  }
};

export const webhookRazorpayData = async (payloadOj) => {
  const { event, payload } = payloadOj;
  let response = {};
  switch (event) {
    case "payment.authorized":
      //Nothing
      break;
    case "payment.captured":
      //Nothing
      break;
    case "order.paid":
      response = await _proceed(
        event,
        payload.payment.entity,
        payload.order.entity,
        null
      );
      break;
    case "refund.processed":
      response = await _proceed(event, payload.payment.entity, {});
      response.refund_amount = payload.payment.entity.amount_refunded / 100;
      //Notify Auth
      // _notify(NOTIFY.REFUND_PROCESSED, response.order_by, response);
      break;
    case "payment.failed":
      response = await _proceed(event, payload.payment.entity, {});
      break;
    case "subscription.charged":
      response = await _proceed(
        event,
        payload.payment.entity,
        null,
        payload.subscription.entity
      );
      break;
    default:
      break;
  }
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data: response,
  };
};
