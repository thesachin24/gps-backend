import express from 'express';
const commonRoutes = express.Router({ mergeParams: true });
import { authenticate,catchValidationErrors } from '../middleware';
import {
  contentGeneration,
  foregroundBackground,
  getCoupons,
  getDashboard, getFAQs, getListing, getService, getServices, getSubscriptionPlans, imageGeneration
} from '../controller';
import { common } from '../validations';
import validate from 'express-joi-validator';

/**
 * @swagger
 * /common/dashboard:
 *   get:
 *     description: Get Dashboard
 *     summary: Dashboard Data
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Common
 *     responses:
 *       200:
 *         description: Dashboard
 */
commonRoutes.get(
  '/dashboard',
  authenticate,
  getDashboard
);


/**
 * @swagger
 * /common/listing:
 *   get:
 *     description: Get All List - City | State | Area of Law | Courts | Languages
 *     summary: Get All Listing Data
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Common
 *     responses:
 *       200:
 *         description: Dashboard
 */
 commonRoutes.get(
  '/listing',
  // authenticate,
  validate(common.getListing),
  catchValidationErrors,
  getListing
);

/**
 * @swagger
 * /common/coupons:
 *   get:
 *     description: Get All Coupons
 *     summary: Get All Coupons
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Common
 *     responses:
 *       200:
 *         description: Dashboard
 */
 commonRoutes.get(
  '/coupons',
  authenticate,
  getCoupons
);

/**
 * @swagger
 * /common/plans:
 *   get:
 *     description: Get All Subscription Plans
 *     summary: Get All Subscription Plans
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Common
 *     responses:
 *       200:
 *         description: Dashboard
 */
 commonRoutes.get(
  '/plans',
  authenticate,
  getSubscriptionPlans
);



/**
 * @swagger
 * /common/services:
 *   get:
 *     description: Get All Services
 *     summary: Get All Services
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Common
 *     responses:
 *       200:
 *         description: Services
 */
 commonRoutes.get(
  '/services',
  // authenticate,
  getServices
);

/**
 * @swagger
 * /common/service/{id}:
 *   get:
 *     description: Get Service  Details
 *     summary: Get Service  Details
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Common
 *     responses:
 *       200:
 *         description: Service Details
 */
 commonRoutes.get(
  '/service/:id',
  // authenticate,
  getService
  );

/**
 * @swagger
 * /common/faqs::
 *   get:
 *     description: Get FAQs
 *     summary: Get FAQs
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Common
 *     responses:
 *       200:
 *         description: FAQs
 */
 commonRoutes.get(
  '/faqs',
  // authenticate,
  getFAQs
  );


/**
 * @swagger
 * /common/foreground-background:
 *   post:
 *     description: Foreground Background - Update FCM, Force Update
 *     summary: Update FCM, Force Update
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Common
 *     parameters:
 *       - name: device_type
 *         description: login device type (WEB, ANDROID, IOS).
 *         in: formData
 *         required: true
 *         type: number
 *       - name: device_id
 *         description: unique id of the device.
 *         in: formData
 *         type: string
 *       - name: push_token
 *         description: FCM Token.
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: Update FCM, Force Update
 */
 commonRoutes.post(
  '/foreground-background',
  validate(common.foregroundBackground),
  catchValidationErrors,
  authenticate,
  foregroundBackground
  );


/**
 * @swagger
 * /common/open-ai/image-generation:
 *   get:
 *     description: Image Generation AI
 *     summary: Image Generation AI
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Common
 *     parameters:
 *       - name: keyword
 *         description: a red apple
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Update FCM, Force Update
 */
 commonRoutes.get(
  '/open-ai/image-generation',
  validate(common.imageGeneration),
  catchValidationErrors,
  authenticate,
  imageGeneration
  );


/**
 * @swagger
 * /common/open-ai/image-generation:
 *   get:
 *     description: Image Generation AI
 *     summary: Image Generation AI
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Common
 *     parameters:
 *       - name: keyword
 *         description: a red apple
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Update FCM, Force Update
 */
 commonRoutes.get(
  '/open-ai/content-generation',
  validate(common.contentGeneration),
  catchValidationErrors,
  authenticate,
  contentGeneration
  );

export default commonRoutes;
