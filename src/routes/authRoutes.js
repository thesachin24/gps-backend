import express from 'express';
const authRoutes = express.Router();
import validate from 'express-joi-validator';
import { auth, verifyAuth } from '../validations';
import { catchValidationErrors } from '../middleware';
import {
  login,
  logout,
  verify
} from '../controller';

/**
 * @swagger
 * /auth/login:
 *   post:
 *     description: Login to the application
 *     tags:
 *     - Authentication
 *     parameters:
 *       - name: mobile
 *         description: Mobile to use for login.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: type
 *         description: User type (user, advocate).
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: login
 */
authRoutes.post(
  '/login',
  validate(auth),
  catchValidationErrors,
  login
);


/**
 * @swagger
 * /auth/verify:
 *   post:
 *     description: Verify OTP
 *     tags:
 *     - Authentication
 *     parameters:
 *       - name: mobile
 *         description: Mobile to use for login.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: otp
 *         description: Enter One Time Password
 *         in: formData
 *         required: true
 *         type: string
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
 *         description: notification token.
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: verify
 */
 authRoutes.post(
  '/verify',
  validate(verifyAuth),
  catchValidationErrors,
  verify
);

/**
 * @swagger
 * /auth/logout:
 *   put:
 *     description: Logout user from the application
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Authentication
 *     responses:
 *       200:
 *         description: Logout success
 */
authRoutes.put(
  '/logout',
  logout
);
export default authRoutes;
