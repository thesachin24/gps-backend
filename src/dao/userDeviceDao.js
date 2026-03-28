import userDevice from '../models/userDevice';

export const getUserDevice = async filters =>
  userDevice.findOne({ where: filters, raw: true });

export const getAllUserDeviceTokens = async (user_id) => {
  return userDevice.findAll({
    attributes: ['push_token'],
    where: { user_id }, raw: true
  }).map(t => t.push_token);
}

export const getAllUserDevice = async (filters, attributes) =>
  userDevice.findAll({ attributes, where: filters, raw: true });

export const createUserDevice = async (payload, t) =>
  userDevice.create(payload, { transaction: t });

/**
 * This function update user's device data
 * @property {object} filters - user's object criteria for which is to be updated
 * @property {object} data - data which contains the user's device data to be updated field
 * @returns {object} user details object for success and error object for failure
 */

export const updateUserDevice = async (filters, data) =>
  userDevice.update(data, { where: filters, returning: true });

/**
 * This function delete device token for user
 * @property {object} filters - containing attributes
 * @returns {object} user device details object for success and error object for failure
 */
export const deleteUserDevice = filters => {
  return userDevice.destroy({
    where: filters
  });
};
