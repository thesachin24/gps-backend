import { BANNERS_FIELD, HOLDER_FIELD, OFFSET, PAGE_LIMIT } from '../constants';
import simInventoryModel from '../models/simInventory';
import Holder from '../models/holder';
import sequelize from '../models/index';

export const getSimInventoryList = (filter, page, pageSize, order = []) => {
  return simInventoryModel.findAndCountAll({
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

export const getAllSimInventoryList = (filter) => {
  return simInventoryModel.findAndCountAll({
    attributes: BANNERS_FIELD,
    // offset: page * pageSize || OFFSET,
    // limit: pageSize || PAGE_LIMIT,
    where: filter,
    // raw: true,
    // order: order.length && [order],
  });
};


export const getSimInventory = (filters, attributes) =>
  simInventoryModel.findOne({
    attributes: attributes || BANNERS_FIELD,
    where: filters
  });

export const getSimInventoryById = filters =>
  simInventoryModel.findOne({ where: filters });

export const getSimInventoryInfoWithIgnoreCase = value =>
  simInventoryModel.findOne({
    where: sequelize.where(
      sequelize.fn('lower', sequelize.col('name')),
      value.toLowerCase()
    ),
    raw: true
  });
export const createSimInventory = payload => simInventoryModel.build(payload).save();

export const upsertSimInventoryBulk = async (data, t) => { 
  return simInventoryModel.bulkCreate(
    data, 
    { 
      transaction: t, 
      updateOnDuplicate: ["status"], 
      returning: true 
    }
  );
 };
export const updateSimInventory = (simInventoryInfo, data, t) =>
  simInventoryInfo.update(data, { transaction: t });

export const deleteSimInventory = (where) =>
  simInventoryModel.destroy({
    where
  });
