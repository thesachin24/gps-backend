import express from 'express';
const notificationRoutes = express.Router({ mergeParams: true });
import validate from 'express-joi-validator';

import { catchValidationErrors, authenticate } from '../middleware/index';
import { notification } from '../validations/index';
import {
  getNotificationList
} from '../controller';

/**
 * @swagger
 * /notifications:
 *   get:
 *     description: Get Notification List
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Notification
 *     parameters:
 *       - name: lawyer_id
 *         description: Lawyer ID.
 *         in: query
 *         type: string
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
 *         description: Sort data by Notification name (asc, desc).
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Notifications list
 */
notificationRoutes.get(
  '/',
  authenticate,
  validate(notification.getNotificationList),
  catchValidationErrors,
  getNotificationList
);

export default notificationRoutes;
