import express from 'express';
const orderRoutes = express.Router({ mergeParams: true });
import validate from 'express-joi-validator';

import { catchValidationErrors, authenticate } from '../middleware/index';
import { order } from '../validations/index';
import {
  getOrderList,
  getOrderDetails,
  getTransactionList,
  getConsultationList,
  getConsultationsDetails,
  getPayoutList,
  getPayoutOrderList,
  updateConsultation,
  getOrderDetailsRazorId
} from '../controller';

/**
 * @swagger
 * /orders:
 *   get:
 *     description: Get Order List
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Order
 *     parameters:
 *       - name: search
 *         description: text to search.
 *         in: query
 *         type: string
 *       - name: page
 *         description: page index number.
 *         in: query
 *         type: number
 *       - name: limit
 *         description: page offset.
 *         in: query
 *         type: number
 *       - name: search
 *         description: Keyword search.
 *         in: query
 *         type: string
 *       - name: sortByName
 *         description: Sort data by Order name (asc, desc).
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Orders list
 */
orderRoutes.get(
  '/',
  authenticate,
  validate(order.getOrderList),
  catchValidationErrors,
  getOrderList
);


/**
 * @swagger
 * /orders/wallet-transaction:
 *   get:
 *     description: Get Wallet Transactions List
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Order
 *     parameters:
 *       - name: search
 *         description: text to search.
 *         in: query
 *         type: string
 *       - name: page
 *         description: page index number.
 *         in: query
 *         type: number
 *       - name: limit
 *         description: page offset.
 *         in: query
 *         type: number
 *       - name: search
 *         description: Keyword search.
 *         in: query
 *         type: string
 *       - name: sortByName
 *         description: Sort data by Order name (asc, desc).
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Orders list
 */
 orderRoutes.get(
  '/wallet-transaction',
  authenticate,
  validate(order.getWalletList),
  catchValidationErrors,
  getTransactionList
);


/**
 * @swagger
 * /orders/payouts:
 *   get:
 *     description: Get Lawyers Payouts
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Order
 *     parameters:
 *       - name: search
 *         description: text to search.
 *         in: query
 *         type: string
 *       - name: page
 *         description: page index number.
 *         in: query
 *         type: number
 *       - name: limit
 *         description: page offset.
 *         in: query
 *         type: number
 *       - name: search
 *         description: Keyword search.
 *         in: query
 *         type: string
 *       - name: sortByName
 *         description: Sort data by Order name (asc, desc).
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Payouts list
 */
 orderRoutes.get(
  '/payouts',
  authenticate,
  validate(order.getPayoutsList),
  catchValidationErrors,
  getPayoutList
);

/**
 * @swagger
 * /orders/payouts/{payout_id}:
 *   get:
 *     description: Get Lawyers Payout - Orders(Breakup)
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Order
 *     responses:
 *       200:
 *         description: Orders list
 */
 orderRoutes.get(
  '/payouts/:payout_id',
  authenticate,
  getPayoutOrderList
);


/**
 * @swagger
 * /orders/consultations:
 *   get:
 *     description: Consultations for Lawyers
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Order
 *     parameters:
 *       - name: search
 *         description: text to search.
 *         in: query
 *         type: string
 *       - name: page
 *         description: page index number.
 *         in: query
 *         type: number
 *       - name: limit
 *         description: page offset.
 *         in: query
 *         type: number
 *       - name: search
 *         description: Keyword search.
 *         in: query
 *         type: string
 *       - name: sortByName
 *         description: Sort data by Order name (asc, desc).
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Orders list
 */
 orderRoutes.get(
  '/consultations',
  authenticate,
  validate(order.getConsultationList),
  catchValidationErrors,
  getConsultationList
);


/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     description: Get Order Details
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Order
 *     parameters:
 *       - name: id
 *         description: Orders ID.
 *         in: path
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: Order Details
 */
orderRoutes.get(
  '/:id',
  authenticate,
  validate(order.idOnly),
  catchValidationErrors,
  getOrderDetails
);


/**
 * @swagger
 * /orders/razorpay/{rzr_order_id}:
 *   get:
 *     description: Get Order Details
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Order
 *     parameters:
 *       - name: rzr_order_id
 *         description: Razorpay Order ID.
 *         in: path
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: Order Details
 */
 orderRoutes.get(
  '/razorpay/:rzr_order_id',
  // authenticate,
  validate(order.idRazorpay),
  catchValidationErrors,
  getOrderDetailsRazorId
);


/**
 * @swagger
 * /consultations/{id}:
 *   get:
 *     description: Get Order Details
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Order
 *     parameters:
 *       - name: id
 *         description: Orders ID.
 *         in: path
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: Order Details
 */
 orderRoutes.get(
  '/consultations/:id',
  authenticate,
  validate(order.idOnly),
  catchValidationErrors,
  getConsultationsDetails
);



/**
 * @swagger
 * /consultations/{id}:
 *   put:
 *     description: Update Consultation
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Review
 *     parameters:
 *       - name: status
 *         description: Status - INPROGRESS | COMPLETED | APPROVED
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Review Details
 */
 orderRoutes.put(
  '/consultations/:id',
  authenticate,
  validate(order.updateConsultation),
  catchValidationErrors,
  updateConsultation
);

export default orderRoutes;
