import {
  createUser,
  updateUser,
  getAllUsers,
  getUserDetail,
  getProfileData
} from '../service';
import { CREATED, OFFSET, OK, PAGE_LIMIT, SERVER_ERROR } from '../constants';
import logger from '../config/logger';

/**
 * Get all user
 * @property {string} req.params.search - text to search user.
 * @returns {array} user list
 */
export const getUserList = async (req, res) => {
  try {
    const userList = await getAllUsers(req.query);
    return res.status(OK).json(userList);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

/**
 * Get User Details by id
 * @property {string} req.params.id - User id.
 * @returns {object} user details object
 */
export const getUserDetails = async (req, res) => {
  const { params: { id }, auth } = req;
  try {
    const user = await getProfileData(id, auth);
    return res.status(OK).json(user);
  } catch (err) {
    logger.error(err);
    res.status(err.status || SERVER_ERROR).json(err);
  }
};

/**
 * Create a user
 * @property {string} req.body - User detail Object.
 * @returns {object} user details object
 */
export const registerUsers = async (req, res) => {
  const api_key = req.get('x-partner-key');
  try {
    const user = await createUser(req.body, api_key);
    return res.status(CREATED).json(user);
  } catch (err) {
    logger.error(err);
    res.status(err.status || SERVER_ERROR).json(err);
  }
};

/**
 * Update a user detail
 * @property {object} req.body - User detail Object for update.
 * @returns {object} user details object
 */
export const updateUserDetails = async (req, res) => {
  const {
    params: { id },
    auth: { userid, role },
    body
  } = req;
  try {
    const isAdmin = role === 'admin';
    const user = await updateUser(isAdmin && id || userid, isAdmin, body);
    return res.status(OK).json(user);
  } catch (err) {
    logger.error(err);
    res.status(err.status || SERVER_ERROR).json(err);
  }
};
