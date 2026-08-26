import { COUPONS_FIELD, OFFSET, PAGE_LIMIT } from '../constants';
import holderModel from '../models/holder';
import sequelize from '../models/index';

export const getHolderList = (filter, page, pageSize, order = []) => {
  return holderModel.findAndCountAll({
    attributes: COUPONS_FIELD,
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    raw: true,
    order: order.length && [order]
  });
};

export const getHolder = (filters, attributes) =>
  holderModel.findOne({
    attributes: attributes || COUPONS_FIELD,
    where: filters
  });

export const getHolderById = filters =>
  holderModel.findOne({ where: filters });

export const getHolderInfoWithIgnoreCase = value =>
  holderModel.findOne({
    where: sequelize.where(
      sequelize.fn('lower', sequelize.col('name')),
      value.toLowerCase()
    ),
    raw: true
  });
export const createHolder = payload => holderModel.build(payload).save();

export const updateHolder = (holderInfo, data, t) =>
  holderInfo.update(data, { transaction: t });

export const deleteHolder = id =>
  holderModel.destroy({
    where: id
  });
