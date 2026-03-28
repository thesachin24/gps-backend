import express from 'express';
const paymentRoutes = express.Router({ mergeParams: true });
import { catchValidationErrors, authenticate } from '../middleware/index';
import validate from 'express-joi-validator';
import { payment } from '../validations/index';

import { checkoutPayment } from '../controller';

/**
 * @swagger
 * /payment/chekout:
 *   get:
 *     description: Checkout for Payment
 *     summary: Checkout for Payment
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Payment
 *     parameters:
 *       - name: type
 *         description: Type (SUBSCRIPTION, ADVERTISEMENT).
 *         in: query
 *         required: true
 *         type: string
 *       - name: service
 *         description: Type (BASIC).
 *         in: query
 *         required: true
 *         type: string
 *       - name: coupon
 *         description: Applied Coupon
 *         in: query
 *         type: string
 *       - name: business_id
 *         description: Business ID
 *         in: query
 *         type: number
 *       - name: amount
 *         description: Wallet Recharge Amount
 *         in: query
 *         type: number
 *       - name: initiateOrder
 *         description: Start Creating Order
 *         in: query
 *         type: number
 *     responses:
 *       200:
 *         description: Checkout for Payment
 */
 paymentRoutes.post(
  '/checkout',
  authenticate,
  validate(payment.checkout),
  catchValidationErrors,
  checkoutPayment
);


export default paymentRoutes;