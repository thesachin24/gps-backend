import Sequelize from 'sequelize';
import { OFFSET, PAGE_LIMIT } from '../constants';
import DeviceLocation from '../models/deviceLocation';
import DeviceAssetMap from '../models/deviceAssetMap';

export const getDeviceAssetMapList = (filter, page, pageSize, order = []) => {
  return DeviceAssetMap.findAndCountAll({
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    order: order.length ? [order] : [['id', 'DESC']]
  });
};

export const getAllDeviceAssetMapList = (filter) => {
  return DeviceAssetMap.findAndCountAll({
    where: filter,
  });
};


export const getDeviceAssetMap = (filters, attributes) =>
  DeviceAssetMap.findOne({
    attributes,
    where: filters
  });

export const getDeviceAssetMapById = filters =>
  DeviceAssetMap.findOne({ where: filters });

export const createDeviceAssetMap = payload => DeviceAssetMap.build(payload).save();

export const updateDeviceAssetMap = (deviceAssetMapInfo, data, t) =>
  deviceAssetMapInfo.update(data, { transaction: t });

export const deleteDeviceAssetMap = (where) =>
  DeviceAssetMap.destroy({
    where
  });