import authModel from '../models/accesstoken';
import User from '../models/user';
import { TOKEN_EXPIRY_TIME, ROLE_ID_NAME } from '../constants';

/**
 * This function create user auth token
 * @property {object} userDetails - object containing user auth attributes
 * @property {object} t - transaction instance
 * @returns {object} user auth details object for success and error object for failure
 */
export const createUserAuthToken = async (userDetails, t) => {
  userDetails.ttl = TOKEN_EXPIRY_TIME;
  return authModel.build(userDetails).save({ transaction: t });
};
/**
 * This function find auth token for user
 * @property {object} filters - query condition
 * @returns {object} user details object for success and error object for failure
 */
export const getUserAuthToken = async filters => {
  return authModel.findOne({
    where: filters,
    include:[{
      model: User,
      attributes: ['is_blocked','role'],
      where: { is_active: true }
    }],
    raw: true
  });
};

/**
 * This function delete auth token for user
 * @property {object} filters - containing attributes
 * @returns {object} user details object for success and error object for failure
 */
export const deleteAuthToken = filters => {
  return authModel.destroy({
    where: filters
  });
};
