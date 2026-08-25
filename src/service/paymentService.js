import { update } from 'lodash';
import logger from '../config/logger';
import {
  BAD_REQUEST,
  CONSULTATION_VALIDITY,
  COUPON_TYPE,
  FORBIDDEN,
  LAWYER_FIELD,
  MESSAGE_CONSTANTS,
  NOT_FOUND,
  ORDER_STATUS,
  PAYMENT_STATUS,
  ORDER_TYPE,
  SERVICES,
  SUBSCRIPTIONS,
  TAX,
  UN_PROCESSABLE_ENTITY,
  WALLET_VALIDITY,
  SERVICES_FIELD,
} from '../constants';
import { getLawyer, getOrder, getService, updateOrder } from '../dao';
import { getCoupon } from '../dao/couponDao';
import { getCheckoutObject } from '../helper';
import {
  calculateCredits,
  CustomError,
  precise,
} from '../utils';
import { createOrderRazorpay } from '../utils/razorPay';
import { createOrders } from './orderService';


const _applyCoupon = async (coupon_code, total) => {
  const couponObj = await getCoupon({ coupon_code })
  if (!couponObj) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.COUPON_NOT_FOUND);
  }
  const { coupon_value, coupon_type, min_value, usage } = couponObj
  let discount = 0
  if (min_value && total < min_value) {
    throw new CustomError(BAD_REQUEST, MESSAGE_CONSTANTS.MINIMUM_VALUE + min_value);
  }
  // Apply Discount
  if (coupon_type === COUPON_TYPE.PERCENTAGE) {
    discount = (coupon_value / 100) * total;
  } else {
    discount = total - coupon_value;
  }
  return discount
}

export const _insertOrder = async (payload, order_by) => {
  const {
    total,
    plan_name,
    tax,
    subTotal,
    discount,
    order_type, 
    coupon,
    finalAmount,
    user_id,
    device_id } = payload

  const orderPayload = {
    user_id: user_id,
    device_id: device_id,
    order_type: order_type,
    plan_name: plan_name,
    tax,
    tax_percentage: TAX.slab,
    order_amount: total,
    sub_total: subTotal,
    discount_amount: discount,
    coupon_code: coupon ? coupon : "",
    final_total: finalAmount,
    order_time: new Date(),
    payment_status: PAYMENT_STATUS.INITIATED
  }
  return createOrders(orderPayload)
}

export const _createNewOrder = async (payload, order_by) => {
  const { finalAmount, plan_name, discount, initiateOrder, order_type, coupon } = payload
  let order = {}
  if (precise(finalAmount) !== precise(initiateOrder)) {
    throw new CustomError(UN_PROCESSABLE_ENTITY, MESSAGE_CONSTANTS.AMOUNT_MISMATCH);
  }
  const { data } = await _insertOrder(payload, order_by)

  const options = {
    amount: (finalAmount * 100),
    currency: "INR",
    receipt: data.id,
    payment: {
      capture: "automatic",
      capture_options: {
        automatic_expiry_period: 12,
        manual_expiry_period: 7200,
        refund_speed: "optimum"
      }
    },
    notes: {
      order_id: data.id,
      order_type, 
      plan_name,
      discount,
      coupon
    }
  };
  try {
    order = await createOrderRazorpay(options)
    const orderInfo = await getOrder({ id: data.id })
    updateOrder(orderInfo, { rzr_order_id: order.id })
  } catch (err) {
    logger.error(err);
    throw new CustomError(UN_PROCESSABLE_ENTITY, err.error.description);
  }
  return order;
}

export const getPlanDetails = (plan_name) => {
  const subscription = SUBSCRIPTIONS[`${plan_name}`];

  if (!subscription) {
    return { error: 'Subscription type not found' };
  }

  // const plan = subscription.plans.find(p => p.plan_type === plan_type);

  // if (!plan) {
  //   return { error: 'Plan type not found for the given subscription' };
  // }

  return {
    price: subscription.FEE,
    validity: subscription.VALIDITY
  };
}

export const _getAmountAndValidity = async (payload) => {
  const { order_type, plan_name, amount } = payload
  let total = 0
  let validity = ""
  console.log(order_type, plan_name, amount)
  if (order_type === ORDER_TYPE.SUBSCRIPTION) {
    const planDetails = getPlanDetails(plan_name);
    console.log(planDetails)
    if(planDetails.error){
      throw new CustomError(FORBIDDEN, planDetails.error);
    }
    total = planDetails.price;
    validity = planDetails.validity;
  }
  //  else if (order_type === ORDER_TYPE.SERVICE) {
  //   const serviceObj = await getService({ service_id });
  //   if( serviceObj.booking_fee){
  //     total = serviceObj.booking_fee;
  //   }else{
  //     total = serviceObj.fee;
  //   }
  //   validity = serviceObj.validity;
  // } 
  else {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.SOMETHING_WENT_WRONG)
  }
  if (!total) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.SOMETHING_WENT_WRONG)
  }
  return { total, validity }
}

export const getCheckoutData = async (query, user_id) => {
  const { order_type, coupon, plan_name, amount, initiateOrder } = query
  //Get Amount
  const { total, validity } = await Promise.resolve(
    _getAmountAndValidity({order_type, user_id, plan_name, amount})
  )

  console.log(total, validity)

  //Apply Coupon
  let discount = 0
  if (coupon) {
    discount = await Promise.resolve(
      _applyCoupon(coupon, total)
    )
  }
console.log(discount, "discount")
  //Sub Total Amount
  const subTotal = total - discount;
console.log(subTotal, "subTotal")
  //Apply Taxes
  const tax = (subTotal * TAX.slab / 100)
console.log(tax, "tax")
  //Final Amount
  const finalAmount = Math.round(tax + subTotal);
console.log(finalAmount, "finalAmount")
  console.log(order_type, plan_name, user_id, finalAmount)
  //Get Label/Placeholder
  const { title } = await getCheckoutObject(order_type, plan_name);
console.log(title)
  const data = {
    order_type, plan_name, title, user_id, validity,
    coupon, 
    total : precise(total),
    discount: precise(discount), 
    subTotal: precise(subTotal), 
    tax: precise(tax), 
    finalAmount: precise(finalAmount), 
    initiateOrder
  }
  console.log(data)

  //Create Order
  if (initiateOrder) {
    data.order = await _createNewOrder(data, user_id)
  }
  // if (order_type === ORDER_TYPE.WALLET) {
  //   const lawyerObj = await getLawyer({ advocate_id: order_by });
  //   const { credits, normalCredits, proCredits } = calculateCredits(lawyerObj, total)
  //   data.credits = credits
  //   data.normalCredits = normalCredits
  //   data.proCredits = proCredits
  // }

  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data
  };
};
