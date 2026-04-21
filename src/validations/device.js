/**
 * @file Validation schemas for hardware device routes.
 */
import Joi from 'joi';

export const device = {
  getDeviceList: {
    query: {
      search: Joi.string().optional().allow('', null),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      sortByName: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').optional()
    }
  },
  createDevice: {
    body: {
      device_id: Joi.string().trim().required(),
      device_name: Joi.string().trim().optional().allow('', null),
      device_type: Joi.string().trim().optional(),
      firmware_version: Joi.string().trim().optional().allow('', null),
      sim_number: Joi.string().trim().optional().allow('', null),
      owner_id: Joi.number().integer().positive().optional().allow(null),
      owner_type: Joi.string().valid('USER', 'DISTRIBUTOR', 'ADMIN').optional().allow(null),
      is_active: Joi.boolean().optional()
    }
  },
  updateDevice: {
    params: {
      id: Joi.number().integer().positive().required()
    },
    body: {
      device_id: Joi.string().trim().optional(),
      device_name: Joi.string().trim().optional(),
      device_type: Joi.string().trim().optional(),
      firmware_version: Joi.string().trim().optional().allow('', null),
      sim_number: Joi.string().trim().optional().allow('', null),
      owner_id: Joi.number().integer().positive().optional().allow(null),
      owner_type: Joi.string().valid('USER', 'DISTRIBUTOR', 'ADMIN').optional().allow(null),
      is_active: Joi.boolean().optional()
    }
  },
  idOnly: {
    params: {
      id: Joi.number().integer().positive().required()
    }
  },
  getDeviceLocations: {
    query: {
      user_id: Joi.number().integer().optional().allow('', null),
      device_id: Joi.string().optional().allow('', null),
      device_type: Joi.string().optional().allow('', null),
      source: Joi.string().optional().allow('', null),
      search: Joi.string().optional().allow('', null),
      from: Joi.date().iso().optional(),
      to: Joi.date().iso().optional(),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      sortByRecordedAt: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').optional()
    }
  },
  getDeviceTrips: {
    params: {
      id: Joi.number().integer().positive().required()
    },
    query: {
      from: Joi.date().iso().optional(),
      to: Joi.date().iso().optional(),
      stop_duration: Joi.number().integer().min(1).max(1440).optional().default(15)
    }
  }
};
