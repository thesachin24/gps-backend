import logger from '../config/logger';
import {
  MESSAGE_CONSTANTS,
  ORDER_STATUS, PAYMENT_STATUS,
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
  CREATED
} from '../constants';
import { createOrder, createTransaction, createUser, createWallet, getDeviceSubscription, getLawyer, getLawyerSubscription, getOrder, getPayout, getTransaction, getUserWithIgnoreCase, updateLawyer, updateMultiOrder, updateOrder, updatePayout } from '../dao';
import sequelize from '../models';
import { calculateCredits, CustomError, get10DigitMobile, getTax, getTaxIncluding, precise, _notify } from '../utils';
// import { createOrderInvoice } from '../utils/invoice';
import { getPlanDetails } from './paymentService';

export const _performOrderAction = async (orderInfo) => {
  const { order_type, device_id } = orderInfo
  if (order_type === ORDER_TYPE.SUBSCRIPTION) {
    //Add/Append Subscription
    const planDetails = getPlanDetails(orderInfo.plan_name);
    const days = planDetails.days;
    console.log("days", days, device_id)
    const dataOj = await getDeviceSubscription({ id: device_id });

    // if(!dataOj){
    // }
    // const { subscription = {} } = dataOj

    let active_from = new Date();
    let active_to = new Date();
    if (
      dataOj &&
      dataOj.subscription &&
      dataOj.subscription.active_to &&
      dataOj.subscription.active_to > active_from) {
      active_to = new Date(dataOj.subscription.active_to);
      active_to = active_to.setDate(active_to.getDate() + days);
    } else {
      active_to.setDate(active_from.getDate() + days);
    }
    console.log("active_to", active_to)
    
    await updateOrder(orderInfo, { active_from, active_to })
    // const deviceObj = await getDevice({ device_id });
    // await updateDevice(deviceObj, { is_paid: 1, is_pro: 1 })
  }
}

export const _createTransaction = async (event, payment, receipt) => {
  const { amount, email, contact, order_id } = payment
  const transaction = {
    event,
    order_id: receipt,
    rzr_order_id: order_id,
    amount: (amount / 100),
    email: email,
    phone: contact
  }
  await createTransaction(transaction);
}

export const _updateOrderData = async (orderInfo, event) => {
  let update = {}
  if (event === "order.paid") {
    let order_status = ORDER_STATUS.PROCESSING
    
    // Lawyer Consultation Book
    // if (orderInfo.order_for) {
    //   order_status = ORDER_STATUS.ASSIGNED
    // }
    
    // Wallet Recharge
    // if (orderInfo.order_type === ORDER_TYPE.WALLET) {
    //   order_status = ORDER_STATUS.RECHARGE
    // }

     // Subscription
     if (orderInfo.order_type === ORDER_TYPE.SUBSCRIPTION) {
      order_status = ORDER_STATUS.ACTIVE
    }

    update = {
      payment_status: PAYMENT_STATUS.PAID,
      order_status
    }

  } else if (event === "refund.processed") {
    update = {
      payment_status: PAYMENT_STATUS.REFUNDED
    }
  } else if (event === "payment.failed") {
    update = {
      payment_status: PAYMENT_STATUS.FAILED
    }
  }
  return updateOrder(orderInfo, update);
}

export const _proceed = async (event, payment, order) => {
  let { order_id } = payment
  let { receipt } = order

  console.log("order_id", order_id)

  //Getting Order Data
  const orderInfo = await getOrder({ rzr_order_id: order_id });
  
  if(!orderInfo){
    throw new CustomError(BAD_REQUEST, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }

  //If already Paid - Order
  if (event === "order.paid") {
    if(orderInfo.payment_status == PAYMENT_STATUS.PAID){
      throw new CustomError(CREATED, MESSAGE_CONSTANTS.ALREADY_PAID);
    }
  }

  if(orderInfo){
  //Entry in Transactions
  // await _createTransaction(event, payment, orderInfo.order_id)

  //Perform Add Credit | Add Subscription - For New Order
  if (event === "order.paid") {
    await _performOrderAction(orderInfo);
  }

  //Update Order Status
  return _updateOrderData(orderInfo, event);
  }else{
  return {}
  }
}

export const webhookRazorpayData = async payloadOj => {
  const { event, payload } = payloadOj
  let response = {}
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
      )
      //Order Invoice
      // response.invoicePath = await createOrderInvoice(response)
      //Notify Auth
      await _notify(
        NOTIFY.NEW_ORDER,
        response.user_id,
        response
      );
      break;
    case "refund.processed":
      response = await _proceed(
        event,
        payload.payment.entity,
        {}
      )
      response.refund_amount =  payload.payment.entity.amount_refunded/100
      //Notify Auth
      _notify(
        NOTIFY.REFUND_PROCESSED,
        response.user_id,
        response
      );
      break;
    case "payment.failed":
      response = await _proceed(
        event,
        payload.payment.entity,
        {}
      )
      break;
    default:
      break;
  }
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data: response
  };
};
