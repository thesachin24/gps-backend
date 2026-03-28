/**
 * @file This file define the validation used in Banner routes.
 */
import Joi from 'joi';

export const banner = {
  createBanner: {
    body: {
      name: Joi.string().required(),
      business_id: Joi.number().required(),
      path: Joi.string().optional().allow('', null),
    }
  },
  updateBanner: {
    params: {
      id: Joi.number().required()
    },
    body: {
      business_id: Joi.number().required(),
    }
  },
  idOnly: {
    params: {
      id: Joi.number().required()
    }
  },
  getBannerList: {
    query: {
      business_id: Joi.number().optional().allow('', null),
      search: Joi.string().optional().allow('', null),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      sortByName: Joi.string().optional(),
    }
  },
  createBannerMedia: {
    body: {
      file_name: Joi.string().required(),
      name: Joi.string().required(),
      banner_image: Joi.string().required(),
      business_id: Joi.number().required()
    }
  },
  updateMedia: {
      body: {
        file_name: Joi.string().required(),
        path :Joi.string().optional()
      },
    },
};
