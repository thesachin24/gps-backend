/**
 * @file This file define the middleware to catch validation errors thrown by joi throughout the app.
 */
import _ from 'lodash';
import logger from '../config/logger';
import { CustomError }  from '../utils';
import {
  UN_PROCESSABLE_ENTITY
} from '../constants';

/**
 * This function will catch the validation errors as middleware
 * @property {object} err - joi validation error object
 * @property {object} req - express request object
 * @property {object} res - express response object
 * @property {object} next - middleware function to continue req execution
 * @returns {object} res object is returned if the validation error occurs otherwise continue execution
 */

export const catchValidationErrors = (err, req, res, next) => {
  if (err.isBoom) {
    const { data, output: { payload: { statusCode }}} = err;
    const errorDetails = _.map(data, _.partialRight(_.pick, ['message', 'path', 'type']));
    const errorObj = new CustomError(statusCode, errorDetails[0].message, errorDetails);
    return res.status(UN_PROCESSABLE_ENTITY).json(errorObj).end();
  }
  if (err instanceof CustomError) {
    logger.error(err.stack);
    return res.status(err.status).json(err).end();
  }
  return next();
};
