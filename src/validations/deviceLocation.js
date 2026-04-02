import Joi from 'joi';

export const deviceLocation = {
  createDeviceLocation: {
    body: {
      device_id: Joi.string().trim().required(),
      device_type: Joi.string().trim().required(),
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      recorded_at: Joi.date().iso().required(),
      accuracy: Joi.number().optional().allow(null),
      speed: Joi.number().optional().allow(null),
      heading: Joi.number().optional().allow(null),
      altitude: Joi.number().optional().allow(null),
      source: Joi.string().trim().optional().allow('', null)
    }
  },
  updateDeviceLocation: {
    params: {
      id: Joi.number().integer().required()
    },
    body: {
      user_id: Joi.number().integer().optional(),
      device_id: Joi.string().trim().optional(),
      device_type: Joi.string().trim().optional(),
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional(),
      recorded_at: Joi.date().iso().optional(),
      accuracy: Joi.number().optional().allow(null),
      speed: Joi.number().optional().allow(null),
      heading: Joi.number().optional().allow(null),
      altitude: Joi.number().optional().allow(null),
      source: Joi.string().trim().optional().allow('', null)
    }
  },
  idOnly: {
    params: {
      id: Joi.number().integer().required()
    }
  }
};
