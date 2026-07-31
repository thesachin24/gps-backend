/**
 * @file Validation schemas for geofence routes.
 */
import Joi from 'joi';

const GEOFENCE_TYPES = ['REGULAR', 'SAFE_ZONE', 'NO_ENTRY'];

export const geofence = {
  getGeofenceList: {
    query: {
      search: Joi.string().optional().allow('', null),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      sortByName: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').optional()
    }
  },
  createGeofence: {
    body: {
      type: Joi.string().valid(...GEOFENCE_TYPES).required(),
      name: Joi.string().required(),
      center_latitude: Joi.number().required(),
      center_longitude: Joi.number().required(),
      radius: Joi.number().integer().required(),
      is_active: Joi.boolean().required(),
      metadata: Joi.object().optional().allow(null)
    }
  },
  updateGeofence: {
    params: {
      id: Joi.number().integer().positive().required()
    },
    body: {
      type: Joi.string().valid(...GEOFENCE_TYPES).optional(),
      name: Joi.string().required(),
      center_latitude: Joi.number().required(),
      center_longitude: Joi.number().required(),
      radius: Joi.number().integer().required(),
      is_active: Joi.boolean().required(),
      metadata: Joi.object().optional().allow(null)
    }
  },
  idOnly: {
    params: {
      id: Joi.number().integer().positive().required()
    }
  },
  mapAssetToGeofence: {
    params: {
      id: Joi.number().integer().positive().required()
    },
    body: {
      asset_id: Joi.number().integer().positive().required()
    }
  },
  unassignAssetFromGeofence: {
    params: {
      id: Joi.number().integer().positive().required()
    },
    body: {
      asset_id: Joi.number().integer().positive().required()
    }
  }
};
