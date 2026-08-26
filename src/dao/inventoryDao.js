import { BANNERS_FIELD, HOLDER_FIELD, OFFSET, PAGE_LIMIT } from '../constants';
import inventoryModel from '../models/inventory';
import Holder from '../models/holder';
import sequelize from '../models/index';

export const getInventoryList = (filter, page, pageSize, order = []) => {
  return inventoryModel.findAndCountAll({
    attributes: BANNERS_FIELD,
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    order: order.length && [order],
    include: [{
      model: Holder,
      attributes: HOLDER_FIELD,
      required: true
    }]
  });
};

export const getAllInventoryList = (filter) => {
  return inventoryModel.findAndCountAll({
    attributes: BANNERS_FIELD,
    // offset: page * pageSize || OFFSET,
    // limit: pageSize || PAGE_LIMIT,
    where: filter,
    // raw: true,
    // order: order.length && [order],
  });
};


export const getInventory = (filters, attributes) =>
  inventoryModel.findOne({
    attributes: attributes || BANNERS_FIELD,
    where: filters
  });

export const getInventoryById = filters =>
  inventoryModel.findOne({ where: filters });

export const getInventoryInfoWithIgnoreCase = value =>
  inventoryModel.findOne({
    where: sequelize.where(
      sequelize.fn('lower', sequelize.col('name')),
      value.toLowerCase()
    ),
    raw: true
  });
export const createInventory = payload => inventoryModel.build(payload).save();

export const updateInventory = (inventoryInfo, data, t) =>
  inventoryInfo.update(data, { transaction: t });

export const deleteInventory = (where) =>
  inventoryModel.destroy({
    where
  });
