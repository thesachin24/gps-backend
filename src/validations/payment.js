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
          ORDER_TYPE.ADVERTISEMENT,
          ORDER_TYPE.CONSULTATION
        ).required(),
      coupon: Joi.string().allow(null, '').optional(),
      ad_id: Joi.when('type', {
        is: Joi.string().valid(ORDER_TYPE.ADVERTISEMENT),
        then: Joi.number().required(),
        otherwise: Joi.number().optional()
      }),
      frequency: Joi.when('type', {
        is: Joi.string().valid(ORDER_TYPE.ADVERTISEMENT),
        then: Joi.number().required(),
        otherwise: Joi.number().optional()
      }),
      business_category_id: Joi.when('type', {
        is: Joi.string().valid(ORDER_TYPE.CONSULTATION),
        then: Joi.number().required(),
        otherwise: Joi.number().optional()
      }),
      radius: Joi.when('type', {
        is: Joi.string().valid(ORDER_TYPE.ADVERTISEMENT),
        then: Joi.number().required(),
        otherwise: Joi.number().optional()
      }),
      business_id: Joi.number().required(),
      category: Joi.string().required(),
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