/**
 * @file This file define the validation used in auth routes.
 */
import Joi from 'joi';
import { MESSAGE_CONSTANTS } from '../constants';

export const common = {
  getListing: {
    query: Joi.object({
      type: Joi.string().required()
    })
  },
  foregroundBackground: {
    body: Joi.object({
      device_type: Joi.string().valid('WEB', 'ANDROID', 'IOS').required(),
      device_id: Joi.string().allow('', null),
      push_token: Joi.string().allow('', null)
    })
  },
  imageGeneration: {
    query: Joi.object({
      keyword: Joi.string().allow('', null)
    })
  },
  contentGeneration: {
    query: Joi.object({
      keyword: Joi.string().allow('', null)
    })
  }
};
