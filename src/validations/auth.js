/**
 * @file This file define the validation used in auth routes.
 */
import Joi from 'joi';
import { MESSAGE_CONSTANTS, ROLES, USER_TYPE } from '../constants';

export const auth = {
  body: Joi.object({
    phone: Joi.string()
      // .min(10)
      // .max(10)
      // .regex(/^[0-9]{10}$/)
      .required()
      .error(() => {
        return { message: MESSAGE_CONSTANTS.INVALID_MOBILE };
      }),
    type: Joi.string()
      .valid(USER_TYPE.USER, ROLES.ADMIN)
      .required()
  })
};

export const verify = {
  body: Joi.object({
    phone: Joi.string()
      .required()
      .error(() => {
        return { message: MESSAGE_CONSTANTS.INVALID_MOBILE };
      }),
    otp: Joi.string()
      .required()
      .error(() => {
        return { message: MESSAGE_CONSTANTS.INVALID_OTP };
      })
  })
};