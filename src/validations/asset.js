/**
 * @file Validation schemas for asset routes.
 */
import Joi from 'joi';

const ASSET_TYPES = ['CAR', 'BIKE', 'TRUCK', 'BOAT', 'CONTAINER', 'OTHER'];

export const asset = {
  getAssetList: {
    query: {
      search: Joi.string().optional().allow('', null),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      sortByName: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').optional()
    }
  },
  createAsset: {
    body: {
      type: Joi.string().valid(...ASSET_TYPES).required(),
      name: Joi.string().trim().optional().allow('', null),
      registration_number: Joi.string().trim().optional().allow('', null),
      make: Joi.string().trim().optional().allow('', null),
      model: Joi.string().trim().optional().allow('', null),
      color: Joi.string().trim().optional().allow('', null),
      metadata: Joi.object().optional().allow(null)
    }
  },
  updateAsset: {
    params: {
      id: Joi.number().integer().positive().required()
    },
    body: {
      type: Joi.string().valid(...ASSET_TYPES).optional(),
      name: Joi.string().trim().optional().allow('', null),
      registration_number: Joi.string().trim().optional().allow('', null),
      make: Joi.string().trim().optional().allow('', null),
      model: Joi.string().trim().optional().allow('', null),
      color: Joi.string().trim().optional().allow('', null),
      metadata: Joi.object().optional().allow(null)
    }
  },
  idOnly: {
    params: {
      id: Joi.number().integer().positive().required()
    }
  }
};
