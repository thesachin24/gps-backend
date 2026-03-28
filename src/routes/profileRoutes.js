import express from 'express';
const profileRoutes = express.Router({ mergeParams: true });
import validate from 'express-joi-validator';

import { catchValidationErrors, authenticate } from '../middleware/index';
import { profile } from '../validations/index';
import {
  addReferral,
  deleteProfile,
  getBankAccount,
  getProfile, removeBankAccount, removeBankDetails, updateBankAccount, updateImage, updatePersonalProfile, updateProfessionalProfile,
} from '../controller';

/**
 * @swagger
 * /profile:
 *   get:
 *     description: Get Dashboard
 *     summary: Dashboard Data
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Profile
 *     responses:
 *       200:
 *         description: Dashboard
 */
profileRoutes.get(
  '/',
  authenticate,
  getProfile
);


/**
 * @swagger
 * /profile/personal:
 *   put:
 *     description: Update Personal Profile
 *     summary: Update Personal Profile
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Profile
 *     responses:
 *       200:
 *         description: Dashboard
 */
 profileRoutes.put(
  '/personal',
  validate(profile.updatePersonalProfile),
  catchValidationErrors,
  authenticate,
  updatePersonalProfile
);

/**
 * @swagger
 * /profile/upload:
 *   put:
 *     description: Update Profile Picture
 *     summary: Update Profile Picture
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Profile
*     parameters:
 *       - name: file_name
 *         description: File Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: profile_image
 *         description: Profile Image
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Dashboard
 */
 profileRoutes.put(
  '/upload',
  validate(profile.updateImage),
  catchValidationErrors,
  authenticate,
  updateImage
);


/**
 * @swagger
 * /profile/professional:
 *   put:
 *     description: Update professional Profile
 *     summary: Update professional Profile
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Profile
 *     responses:
 *       200:
 *         description: Dashboard
 */
 profileRoutes.put(
  '/professional',
  validate(profile.updateProfessionalProfile),
  catchValidationErrors,
  authenticate,
  updateProfessionalProfile
);



/**
 * @swagger
 * /profile/bank-details:
 *   get:
 *     description: Get Bank Account - Lawyer
 *     summary: Get Bank Account - Lawyer
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Profile
 *     responses:
 *       200:
 *         description: Bank Account
 */
 profileRoutes.get(
  '/bank-details',
  authenticate,
  getBankAccount
);


/**
 * @swagger
 * /profile/bank-details:
 *   post:
 *     description: Update Bank Account - Lawyer
 *     summary: Update Bank Account - Lawyer
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Profile
 *     responses:
 *       200:
 *         description: Bank Account
 */
 profileRoutes.post(
  '/bank-details',
  validate(profile.updateBankAccount),
  catchValidationErrors,
  authenticate,
  updateBankAccount
);


/**
 * @swagger
 * /profile/bank-details:
 *   delete:
 *     description: Remove Bank Account - Lawyer
 *     summary: Remove Bank Account - Lawyer
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Profile
 *     responses:
 *       200:
 *         description: Bank Account
 */
 profileRoutes.delete(
  '/bank-details',
  authenticate,
  removeBankAccount
);


/**
 * @swagger
 * /profile/referral:
 *   post:
 *     description: Add Referral
 *     summary: Add Referral
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Profile
 *     responses:
 *       200:
 *         description: Dashboard
 */
 profileRoutes.post(
  '/referral',
  validate(profile.addReferral),
  catchValidationErrors,
  authenticate,
  addReferral
);

/**
 * @swagger
 * /profile:
 *   delete:
 *     description: Delete Profile
 *     summary: Delete Profile
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Profile
 *     responses:
 *       200:
 *         description: Dashboard
 */
 profileRoutes.delete(
  '/',
  authenticate,
  deleteProfile
);

export default profileRoutes;
