/**
 * @file This file define the validation used in user routes.
 */
import { MESSAGE_CONSTANTS } from '../constants';
import Joi from 'joi';

export const user = {
  createUser: {
    body: Joi.object()
      .keys({
      email: Joi.string()
        .email({ minDomainSegments: 2 })
        .trim()
        .required(),
      firstName: Joi.string()
        .min(1)
        .max(50)
        .trim(),
      lastName: Joi.string()
        .min(1)
        .max(50)
        .trim(),
      countryCode: Joi.string()
        .min(1)
        .max(10)
        .allow('', null),
      phone: Joi.string()
        .min(8)
        .max(15)
        .allow('', null),
      password: Joi.string()
        .min(8)
        .max(15)
        .required(),
      address: Joi.string()
        .min(1)
        .max(40)
        .allow('', null)
        .trim()
        .error(() => {
          return { message: MESSAGE_CONSTANTS.ADDRESS_VALIDATION };
        }),
      state: Joi.string().allow('', null),
      city: Joi.string().allow('', null),
      country: Joi.string().allow('', null),
      stateId: Joi.number().when('state', {
        is: Joi.string().valid(null, ''),
        then: Joi.number().optional(),
        otherwise: Joi.number().required()
      }),
      cityId: Joi.number().when('city', {
        is: Joi.string().valid(null, ''),
        then: Joi.number().optional(),
        otherwise: Joi.number().required()
      }),
      countryId: Joi.number().when('country', {
        is: Joi.string().valid(null, ''),
        then: Joi.number().optional(),
        otherwise: Joi.number().required()
      }),
      pincode: Joi.string().allow('', null).min(4).max(9),
      deviceType: Joi.number()
        .min(1)
        .max(4)
        .required(),
      deviceId: Joi.string().allow('', null),
      pushToken: Joi.string().allow('', null)
    }).with('pushToken', 'deviceId')
  },
  updateUser: {
    body: {
      firstName: Joi.string()
        .min(1)
        .max(50)
        .trim(),
      lastName: Joi.string()
        .min(1)
        .max(50)
        .trim(),
      countryCode: Joi.string()
        .min(1)
        .max(10)
        .allow('', null),
      phone: Joi.string()
        .min(8)
        .max(15)
        .allow('', null),
      address: Joi.string()
        .min(1)
        .max(40)
        .allow('', null)
        .trim()
        .error(() => {
          return { message: MESSAGE_CONSTANTS.ADDRESS_VALIDATION };
        }),
      state: Joi.string().allow('', null),
      city: Joi.string().allow('', null),
      country: Joi.string().allow('', null),
      pincode: Joi.string().allow('', null).min(4).max(9),
      stateId: Joi.number().when('state', {
        is: Joi.string().valid(null, ''),
        then: Joi.number().optional(),
        otherwise: Joi.number().required()
      }),
      cityId: Joi.number().when('city', {
        is: Joi.string().valid(null, ''),
        then: Joi.number().optional(),
        otherwise: Joi.number().required()
      }),
      countryId: Joi.number().when('country', {
        is: Joi.string().valid(null, ''),
        then: Joi.number().optional(),
        otherwise: Joi.number().required()
      }),
      profilePic: Joi.string()
        .allow('', null)
        .trim(),
      fileName: Joi.string().when('profilePic', {
        is: Joi.string().valid(null, ''),
        then: Joi.string().optional(),
        otherwise: Joi.string().required()
      }),
      isActive: Joi.boolean().optional()
    }
  },
  getUsersList: {
    query: {
      search: Joi.string().optional().allow('', null),
      gender : Joi.string().optional().allow('', null),
      language : Joi.string().optional().allow('', null),
      city : Joi.string().optional().allow('', null),
      state : Joi.string().optional().allow('', null),
      min_exp :  Joi.number().optional(),
      max_exp : Joi.number().optional(),
      categories : Joi.array().optional(),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      sortByName: Joi.string().optional()
    }
  },
};
