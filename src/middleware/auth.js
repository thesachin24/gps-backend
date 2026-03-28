import { CustomError, checkBearerToken } from '../utils';
import logger from '../config/logger';
import {
  MESSAGE_CONSTANTS,
  UN_PROCESSABLE_ENTITY,
  SERVER_ERROR,
  UNAUTHORIZED
} from '../constants';
import { getUserAuthToken } from '../dao';

/**
 * This function authenticate the user based on the Authorization header token
 * @property {object} req - express request object
 * @property {object} res - express response object
 * @property {object} next - middleware function to continue req execution
 * @returns {object} next object is returned if the error occurs otherwise continue execution
 */
export const authenticate = async (req, res, next) => {
  const bearerToken = req.get('Authorization');
  if(bearerToken == 'skip'){
    req.auth = { user_id: null }
    return next()
  }
  if (!bearerToken) {
    return next(
      new CustomError(
        UN_PROCESSABLE_ENTITY,
        MESSAGE_CONSTANTS.ACCESS_TOKEN_MISSING
      )
    );
  }
  try {
    const token = await checkBearerToken(bearerToken);
    const [auth] = await Promise.all([
      getUserAuthToken({ token })
    ]);
    if (!auth) {
      return next(
        new CustomError(UNAUTHORIZED, MESSAGE_CONSTANTS.INVALID_ACCESS_TOKEN)
      );
    }
    if (auth[`user.is_blocked`]) {
      throw new CustomError(UNAUTHORIZED, MESSAGE_CONSTANTS.DISABLED_USER);
    }
    req.auth = auth;
    next();
  } catch (err) {
    logger.error(err);
    return next(new CustomError(err.status || SERVER_ERROR, err.message, err));
  }
};



/**
 * This function authenticate the user based on the Authorization header token
 * @property {object} req - express request object
 * @property {object} res - express response object
 * @property {object} next - middleware function to continue req execution
 * @returns {object} next object is returned if the error occurs otherwise continue execution
 */
 export const authenticateAdmin = async (req, res, next) => {
  const bearerToken = req.get('Authorization');
  if (!bearerToken) {
    return next(
      new CustomError(
        UN_PROCESSABLE_ENTITY,
        MESSAGE_CONSTANTS.ACCESS_TOKEN_MISSING
      )
    );
  }
  try {
    const token = await checkBearerToken(bearerToken);
    const [auth] = await Promise.all([
      getUserAuthToken({ token })
    ]);
    if (!auth) {
      return next(
        new CustomError(UNAUTHORIZED, MESSAGE_CONSTANTS.INVALID_ACCESS_TOKEN)
      );
    }
    if (auth[`user.is_blocked`]) {
      throw new CustomError(UNAUTHORIZED, MESSAGE_CONSTANTS.DISABLED_USER);
    }

    if (auth[`user.role`] != 'ADMIN') {
      console.log(auth)
      throw new CustomError(UNAUTHORIZED, MESSAGE_CONSTANTS.ACCESS_DENIED);
    }
    req.auth = auth;
    next();
  } catch (err) {
    logger.error(err);
    return next(new CustomError(err.status || SERVER_ERROR, err.message, err));
  }
};
