/**
 * @file This file define the validation used in admin routes.
 */
import Joi from "joi";
import { KYC_STATUS, LEAD_STATUS, ORDER_STATUS } from "../constants";
import { user } from "./user";

export const admin = {
  updateUser: {
    body: {
      name: Joi.string().optional(),
      email: Joi.string().optional(),
      address: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      locality: Joi.string().optional(),
      pincode: Joi.number().optional(),
      latitude: Joi.number().optional(),
      longitude: Joi.number().optional(),
      image: Joi.string().optional(),
      profile_image: Joi.string().optional(),
      cover_image: Joi.array().optional(),
      is_active: Joi.boolean().optional(),
      is_blocked: Joi.boolean().optional(),
      kyc_status: Joi.string()
        .valid(KYC_STATUS.SUBMITTED, KYC_STATUS.APPROVED, KYC_STATUS.REJECTED)
        .optional(),
    },
  },
  getUsersList: {
    query: {
      search: Joi.string().optional().allow("", null),
      gender: Joi.string().optional().allow("", null),
      language: Joi.string().optional().allow("", null),
      city: Joi.string().optional().allow("", null),
      state: Joi.string().optional().allow("", null),
      min_exp: Joi.number().optional(),
      max_exp: Joi.number().optional(),
      categories: Joi.array().optional(),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      sortByName: Joi.string().optional(),
    },
  },
  idOnly: {
    params: {
      id: Joi.number().required(),
    },
  },
  getBusinessList: {
    query: {
      category_id: Joi.number().optional(),
      search: Joi.string().optional().allow("", null),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      sortBy: Joi.string().optional().allow("", null),
      sortOrder: Joi.string().optional().allow("", null),
      owner: Joi.string().optional().allow("", null),
    },
  },
  updateBusiness: {
    params: {
      id: Joi.number().required(),
    },
    body: {
      name: Joi.string().max(255).optional(),
      phone: Joi.string().max(128).optional(),
      category_id: Joi.number().optional(),
      sub_category_id: Joi.number().optional().allow(null),
      address: Joi.string().optional(),
      description: Joi.string().optional(),
      email: Joi.string().email().max(254).optional(),
      whatsapp: Joi.string().max(128).optional(),
      cover_image: Joi.string().max(200).optional().allow(null),
      video: Joi.string().max(200).optional().allow(null),
      specialized_in: Joi.array().items(Joi.string().max(350)).optional(),
      is_top_rated: Joi.boolean().optional(),
      owner_name: Joi.string().optional().allow(null),
      rating: Joi.number().optional(),
      locality: Joi.string().max(255).optional().allow(null),
      city: Joi.string().max(255).optional().allow(null),
      state: Joi.string().max(255).optional().allow(null),
      pincode: Joi.string().max(255).optional().allow(null),
      country: Joi.string().max(255).optional().allow(null),
      latitude: Joi.number().optional().allow(null),
      longitude: Joi.number().optional().allow(null),
      user_id: Joi.number().optional(),
      is_active: Joi.boolean().optional(),
    },
  },
  getMatrimonialList: {
    query: {
      search: Joi.string().optional().allow("", null),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      sortByName: Joi.string().optional(),
      owner: Joi.string().optional().allow("", null),
    },
  },
  updateMatrimonial: {
    params: {
      id: Joi.number().required(),
    },
    body: {
      name: Joi.string().max(150).optional().allow("", null),
      gender: Joi.string()
        .valid("Male", "Female", "Other")
        .max(10)
        .optional()
        .allow("", null),
      caste: Joi.string().max(150).optional().allow("", null),
      sub_caste: Joi.string().max(150).optional().allow("", null),
      date_time_birth: Joi.date().optional().allow("", null),
      is_manglik: Joi.boolean().optional().allow("", null),
      qualification: Joi.string().max(150).optional().allow("", null),
      occupation: Joi.string().max(150).optional().allow("", null),
      work_place: Joi.string().max(150).optional().allow("", null),
      income_per_month: Joi.number().optional().allow(null),
      total_family_members: Joi.number().optional().allow(null),
      father_name: Joi.string().max(150).optional().allow("", null),
      father_occupation: Joi.string().max(150).optional().allow("", null),
      address: Joi.string().max(150).optional().allow("", null),
      phone: Joi.string().max(128).optional().allow("", null),
      mother_name: Joi.string().max(150).optional().allow("", null),
      mother_occupation: Joi.string().optional().allow("", null),
      food_preference: Joi.string()
        .valid("Veg", "Non-Veg", "Eggetarian")
        .max(10)
        .optional()
        .allow("", null),
      no_of_brother: Joi.number().optional().allow(null),
      no_of_sister: Joi.number().optional().allow(null),
      additional_info: Joi.string().optional().allow("", null),
      added_by_id: Joi.number().optional().allow(null),
      birth_city: Joi.string().optional().allow(null),
      birth_state: Joi.string().optional().allow(null),
      height: Joi.object().optional().allow(null), // Assuming height is a JSON object
    },
  },
  getCategoryList: {
    query: {
      search: Joi.string().optional().allow("", null),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      sortByName: Joi.string().optional(),
    },
  },
  createCategory: {
    body: {
      name: Joi.string().max(150).required(),
      position: Joi.number().optional(),
      hindi_name: Joi.string().max(150).optional(),
      is_active: Joi.boolean().optional(),
      is_featured: Joi.boolean().optional(),
    },
  },
  updateCategory: {
    params: {
      id: Joi.number().required(),
    },
    body: {
      name: Joi.string().max(150).optional(),
      position: Joi.number().optional(),
      hindi_name: Joi.string().max(150).optional(),
      // image: Joi.string().max(200).optional(),
      is_active: Joi.boolean().optional(),
      is_featured: Joi.boolean().optional(),
    },
  },
  getSubCategoryList: {
    query: {
      search: Joi.string().optional().allow("", null),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      sortByName: Joi.string().optional(),
    },
  },
  updateSubCategory: {
    params: {
      id: Joi.number().required(),
    },
    body: {
      name: Joi.string().max(150).required(),
      position: Joi.number().optional(),
      hindi_name: Joi.string().max(150).optional(),
      // image: Joi.string().max(200).required(),
      category_id: Joi.number().required(),
      is_aadhaar_mandatory: Joi.boolean().optional().allow("", null),
      is_gps_mandatory: Joi.boolean().optional().allow("", null),
      is_popular: Joi.boolean().optional().allow("", null),
      // is_active: Joi.boolean().optional(),
    },
  },
  createSubCategory: {
    body: {
      name: Joi.string().max(150).required(),
      position: Joi.number().optional(),
      hindi_name: Joi.string().max(150).optional(),
      category_id: Joi.number().required(),
      is_aadhaar_mandatory: Joi.boolean().optional().allow("", null),
      is_gps_mandatory: Joi.boolean().optional().allow("", null),
      is_popular: Joi.boolean().optional().allow("", null),
    },
  },
  getBannerList: {
    query: {
      search: Joi.string().optional().allow("", null),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      sortByName: Joi.string().optional(),
      type: Joi.string().optional().allow("", null),
    },
  },
  updateBanner: {
    params: {
      id: Joi.number().required(),
    },
    body: {
      business_id: Joi.number().required(),
      is_active: Joi.boolean().required(),
      name: Joi.string().optional(),
      priority: Joi.number().optional()
    },
  },
  getAdList: {
    query: {
      search: Joi.string().optional().allow("", null),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      sortByName: Joi.string().optional(),
    },
  },
  getAvaailedBusinessList: {
    query: {
      search: Joi.string().optional().allow("", null),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      sortByName: Joi.string().optional(),
    },
  },
  updateAd: {
    params: {
      id: Joi.number().required(),
    },
    body: {
      name: Joi.string().max(150).optional(),
      locality: Joi.string().max(255).optional().allow("", null),
      city: Joi.string().max(255).optional().allow("", null),
      state: Joi.string().max(255).optional().allow("", null),
      latitude: Joi.number().optional().allow(null),
      longitude: Joi.number().optional().allow(null),
      active_from: Joi.date().optional().allow(null),
      active_to: Joi.date().optional().allow(null),
      banner_id: Joi.number().optional().allow(null),
      radius: Joi.number().optional().allow(null),
      business_id: Joi.number().optional().allow(null),
      placement: Joi.string().optional().allow("", null),
      is_active: Joi.boolean().optional().allow(null),
    },
  },
  updateMedia: {
    body: {
      file_name: Joi.string().optional(),
      image: Joi.string().optional(),
      banner_image: Joi.string().optional(),
      banner_video: Joi.string().optional(),
      profile_image: Joi.string().optional(),
      category_image: Joi.string().optional(),
      sub_category_image: Joi.string().optional(),
      cover_image: Joi.string().optional(),
    },
  },
};
