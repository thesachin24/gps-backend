import { BANNERS_FIELD, HOLDER_FIELD, OFFSET, PAGE_LIMIT } from '../constants';
import deviceInventoryModel from '../models/deviceInventory';
import Holder from '../models/holder';
import sequelize from '../models/index';

export const getDeviceInventoryList = (filter, page, pageSize, order = []) => {
  return deviceInventoryModel.findAndCountAll({
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

export const getAllDeviceInventoryList = (filter) => {
  return deviceInventoryModel.findAndCountAll({
    attributes: BANNERS_FIELD,
    // offset: page * pageSize || OFFSET,
    // limit: pageSize || PAGE_LIMIT,
    where: filter,
    // raw: true,
    // order: order.length && [order],
  });
};


export const getDeviceInventory = (filters, attributes) =>
  deviceInventoryModel.findOne({
    attributes: attributes || BANNERS_FIELD,
    where: filters
  });

export const getDeviceInventoryById = filters =>
  deviceInventoryModel.findOne({ where: filters });

export const getDeviceInventoryInfoWithIgnoreCase = value =>
  deviceInventoryModel.findOne({
    where: sequelize.where(
      sequelize.fn('lower', sequelize.col('name')),
      value.toLowerCase()
    ),
    raw: true
  });
export const createDeviceInventory = payload => deviceInventoryModel.build(payload).save();

export const updateDeviceInventory = (deviceInventoryInfo, data, t) =>
  deviceInventoryInfo.update(data, { transaction: t });

export const deleteDeviceInventory = (where) =>
  deviceInventoryModel.destroy({
    where
  });
