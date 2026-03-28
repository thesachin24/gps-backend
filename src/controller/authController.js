import {
  userLogin,
  logoutUser,
  userVerify
} from '../service';
import logger from '../config/logger';
import { OK, SERVER_ERROR } from '../constants';

/**
 * User Login
 * @property {string} req.body.email - The mobile of user.
 * @property {string} req.body.type - The type of user.
 * @returns {object} user details object containing auth token
 */

export const login = async (req, res) => {
  try {
    const loginData = await userLogin(req.body);
    return res.status(OK).json(loginData);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

/**
 * User Verify
 * @property {string} req.body.mobile - The mobile of user.
 * @property {string} req.body.otp - The otp of user.
 * @returns {object} user details object containing auth token
 */

 export const verify = async (req, res) => {
  try {
    const loginData = await userVerify(req.body);
    return res.status(OK).json(loginData);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


/**
 * Logout from the application
 * @property {string} req.header - The Auth token of user in authorization header.
 * @returns {object} success or error message
 */
export const logout = async (req, res) => {
  try {
    const token = req.get('Authorization');
    const deactivate = req.body.deactivate || false
    const loginData = await logoutUser(token, deactivate);
    return res.status(OK).json(loginData);
  } catch (err) {
    logger.error(err);
    return res.status(err.status||SERVER_ERROR).json(err);
  }
};
