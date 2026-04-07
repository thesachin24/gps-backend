/**
 * @file Validation schemas for hardware device routes.
 */
import Joi from 'joi';

export const hardwareDevice = {
  getHardwareDeviceList: {
    query: {
      search: Joi.string().optional().allow('', null),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      sortByName: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').optional()
    }
  },
  createHardwareDevice: {
    body: {
      device_id: Joi.string().trim().required(),
      device_type: Joi.string().trim().optional(),
      name: Joi.string().trim().optional().allow('', null),
      metadata: Joi.object().optional().allow(null),
      is_active: Joi.boolean().optional()
    }
  },
  updateHardwareDevice: {
    params: {
      id: Joi.number().integer().positive().required()
    },
    body: {
      device_id: Joi.string().trim().optional(),
      device_type: Joi.string().trim().optional(),
      name: Joi.string().trim().optional().allow('', null),
      metadata: Joi.object().optional().allow(null),
      is_active: Joi.boolean().optional()
    }
  },
  idOnly: {
    params: {
      id: Joi.number().integer().positive().required()
    }
  }
};
