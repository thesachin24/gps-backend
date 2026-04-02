import moment from 'moment';
import userModel from '../models/user';

import {
  TEN,
  USER_FIELDS,
  USER_EMAIL,
  REGISTRATION_ID,
  OFFSET,
  PAGE_LIMIT,
  USER_LIST_FIELD,
  BOOKING_STATUS,
  ROLE_ID_NAME,
  USER__BASIC,
  PROFESSIONAL_FIELD,
  CATEGORY_FIELD,
  USER_LOGIN_FIELDS
} from '../constants';
import sequelize from '../models';
// import bcrypt from 'bcryptjs';
import Sequelize from 'sequelize';

// const { CONFIRMED, EXTENDED, RESCHEDULED } = BOOKING_STATUS;
export const getUser = async (filters, fields) =>
  userModel.findOne({
    where: filters,
    attributes: fields || USER_LOGIN_FIELDS,
    // include:[{
    //   model: Professional,
    //   attributes: PROFESSIONAL_FIELD,
    //   // where: { is_active: true }
    //   // raw: true
    // },
    
    // {
    //   model: Category,
    //   attributes: CATEGORY_FIELD,
    //   where: { is_active: true },
    //   required: false,

    //   // raw: true
    // }],
    
    // raw: true
  });


export const getAllUsers = async (filters, attributes) =>
userModel.findAll({ attributes, where: filters, raw: true });


export const getAllUsersList = async (filter, page, pageSize, order) => {
  // const { search: text, startDate, endDate, active, gender, categories, min_exp, max_exp, city, state , service, language} = payload;
  const offset = page * pageSize;
  // let filter = {};
  
  const count = await userModel.count({
    where: filter,
    include:[
    ],
  distinct: true,
  col: 'id'  // Assuming 'registration_id' is the primary key of userModel
  });
  const rows = await userModel.findAll({
    where: filter,
    include:[],
    attributes: USER_LOGIN_FIELDS,
    order: [order],
    offset: offset || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    distinct: true
  });
  return {rows, count};
};

export const createUser = async (body, t) => {
  const {
    name,
    city,
    state,
    email,
    phone,
    type,
    date_joined,
    country,
    otp
  } = body;
  const userData = {
    name,
    city,
    state,
    email,
    phone,
    type,
    date_joined,
    country,
    verification_code:otp
  };
  return await userModel.build(userData).save({ transaction: t });
};

export const getUserWithIgnoreCase = async (key, value, attributes) => {
  console.log(key, value, attributes,"key, value, attributes,,,,")
  return userModel.findOne({
    attributes: attributes || USER_LOGIN_FIELDS,
    where: sequelize.where(
      sequelize.fn('lower', sequelize.col(key)),
      value
    )
  });
};

/**
 * This function update user's data
 * @property {object} userModel - user's object which is to be updated
 * @property {object} data - data which contains the user's to be updated field
 * @returns {object} user details object for success and error object for failure
 */
export const updateUser = async (userInfo, data, t) =>
  userInfo.update(data, { transaction: t });

export const getUsersEmailsId = (page, pageSize, attribute, filter) => {
  const offset = page * pageSize;
  return userModel.findAll({
    offset: offset || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    attributes: attribute || USER_EMAIL,
    raw: true
  }).map(t => t.email);
};

export const usersCount = async filter => userModel.count({ where: filter });

export const addWalletAmount = (userInfo, wallet) => userInfo.increment(wallet);

export const addWalletAmountById = (id, wallet, t) => userModel.increment(wallet, { where: { id } }, { transaction: t });

export const findOrCreateUser = async (filters, fields) => {
  // fields.password = await bcrypt.hash(fields.password, TEN);
  return userModel.findOrCreate({
    where: filters,
    defaults: fields
  });
};

export const updateUserByWhere = (update, where) =>
userModel.update(update, { where });

export const deleteUser = filter => userModel.destroy({ where: filter });
