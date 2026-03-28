import express from 'express';
const webhookRoutes = express.Router({ mergeParams: true });

import {
  webhookRazorpay
} from '../controller';

/**
 * @swagger
 * /webhooks:
 *   post:
 *     description: Checkout for Payment
 *     summary: Checkout for Payment
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Payment
 *     parameters:
 *       - name: type
 *         description: Webhook Type.
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Checkout for Payment
 */
 webhookRoutes.post(
  '/',
  webhookRazorpay
);

export default webhookRoutes;