/**
 * @file This file define the validation used in payment routes.
 */
import Joi from 'joi';
import { CONSULTATION_TYPE, MINIMUM_WALLET, ORDER_TYPE, SUBSCRIPTION_PLANS } from '../constants';

export const payment = {
  checkout: {
    body: {
      type: Joi.string()
        .valid(
          ORDER_TYPE.SUBSCRIPTION,
        ).required(),
      coupon: Joi.string().allow(null, '').optional(),
      plan_name: Joi.string().required(),
      amount: Joi.number().optional(),
      initiateOrder: Joi.number().optional()
    }
  },
  redeemCredits: {
    body: {
      code: Joi.string().trim().required()
    }
  },
};