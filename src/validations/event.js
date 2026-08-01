/**
 * @file Validation schemas for asset routes.
 */
import Joi from 'joi';
import { EVENT } from '../constants';

export const event = {
  getEventList: {
    query: {
      search: Joi.string().optional().allow('', null),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      sortByName: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').optional(),
      type: Joi.string().valid(...Object.values(EVENT)).optional()
    }
  },
  idOnly: {
    params: {
      id: Joi.number().integer().positive().required()
    }
  },
};
