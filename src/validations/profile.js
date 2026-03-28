/**
 * @file This file define the validation used in profile routes.
 */
import Joi from 'joi';
import { KYC_STATUS } from '../constants';
import { updateProfessional } from '../dao';


// Define schema for each object in the array
const objectSchema = Joi.object().pattern(
  /^.*$/, // Regular expression to match any key
  Joi.any() // Schema for any value type
);

export const profile = {
  updatePersonalProfile: {
    body: {
      name: Joi.string().optional().allow('', null),
      email: Joi.string().optional().allow('', null),
      address: Joi.string().optional().allow('', null),
      city: Joi.string().optional().allow('', null),
      state: Joi.string().optional().allow('', null),
      country: Joi.string().optional().allow('', null),
      locality: Joi.string().optional().allow('', null),
      pincode: Joi.number().optional().allow('', null),
      latitude: Joi.number().optional().allow('', null),
      longitude: Joi.number().optional().allow('', null),
      dob: Joi.date().optional().allow('', null),
      image: Joi.string().optional(),
      profile_image: Joi.string().optional(),
      cover_image :Joi.array().optional(),
      kyc_status: Joi.string().valid(KYC_STATUS.SUBMITTED).optional().allow('', null),
    },
  },
  updateImage: {
    body: {
      file_name: Joi.string().required(),
      image: Joi.string().optional(),
      profile_image: Joi.string().optional(),
      cover_image :Joi.string().optional(),
      kyc_self_image: Joi.string().optional(),
      kyc_doc_front: Joi.string().optional(),
      kyc_doc_back: Joi.string().optional(),
    },
  },
  updateProfessionalProfile: {
    body: {
      job_title: Joi.string().optional(),
      main_category: Joi.string().optional(),
      bio: Joi.string().optional(),
      education: Joi.array().items(objectSchema),
      availability: Joi.object().optional(),
      experience : Joi.array().items(objectSchema),
      portfolio : Joi.array().items(objectSchema),
      website : Joi.string().optional(),
      total_experience : Joi.number().optional(),
      skill :Joi.array().items(objectSchema),
      language :Joi.array().items(objectSchema),
      categories :Joi.array().optional(),
      cover_images :Joi.array().optional(),
      service: Joi.array().items(objectSchema),
      


    },
  },


  updateBankAccount: {
    body: {
      name: Joi.string().required(),
      bank_name: Joi.string().optional(),
      ifsc: Joi.string().required(),
      account_number: Joi.string().required(),
      upi: Joi.string().optional(),
    },
  },
  addReferral: {
    body: {
      referral_code: Joi.string().optional().allow('', null)
    },
  },
}
