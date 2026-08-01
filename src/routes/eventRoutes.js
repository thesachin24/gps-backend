import express from 'express';
import validate from 'express-joi-validator';
import { catchValidationErrors, authenticate } from '../middleware/index';
import {
  getEventList
} from '../controller';
import { event } from '../validations';

const eventRoutes = express.Router({ mergeParams: true });

/**
 * @swagger
 * /events:
 *   get:
 *     description: List events for the authenticated user
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Event
 */
eventRoutes.get(
  '/',
  authenticate,
  validate(event.getEventList),
  catchValidationErrors,
  getEventList
);

export default eventRoutes;
