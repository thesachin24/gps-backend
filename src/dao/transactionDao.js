import { ORDERS_FIELD, OFFSET, PAGE_LIMIT, USER__BASIC } from '../constants';
import transactionModel from '../models/transaction';
import userModel from '../models/user';
import sequelize from '../models/index';

export const getTransactionList = (filter, page, pageSize, transaction = []) => {
  return transactionModel.findAndCountAll({
    attributes: ORDERS_FIELD,
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    raw: false,
    transaction: transaction.length && [transaction],
    include: {
      model: userModel,
      attributes: USER__BASIC,
    }
  });
};

export const getTransaction = (filters, attributes) =>
  transactionModel.findOne({
    attributes: attributes || ORDERS_FIELD,
    where: filters
  });


export const getTransactionById = filters =>
  transactionModel.findOne({
    attributes: ORDERS_FIELD,
    where: filters,
    include: {
      attributes: USER__BASIC,
      model: userModel,
      required: true
    }
  });

export const getTransactionInfoWithIgnoreCase = value =>
  transactionModel.findOne({
    where: sequelize.where(
      sequelize.fn('lower', sequelize.col('name')),
      value.toLowerCase()
    ),
    raw: true
  });

export const createTransaction = payload => transactionModel.build(payload).save();

export const updateTransaction = (transactionInfo, data, t) =>
  transactionInfo.update(data, { transaction: t });

export const deleteTransaction = id =>
  transactionModel.destroy({
    where: id
  });
