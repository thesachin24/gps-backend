import Sequelize from 'sequelize';
import { OFFSET, PAGE_LIMIT } from '../constants';
import DeviceLocation from '../models/deviceLocation';

export const getDeviceLocationList = (filter, page, pageSize, order = []) => {
  return DeviceLocation.findAndCountAll({
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    order: order.length ? [order] : [['id', 'DESC']]
  });
};

export const getAllDeviceLocationList = (filter) => {
  return DeviceLocation.findAndCountAll({
    where: filter,
  });
};


export const getDeviceLocation = (filters, attributes) =>
  DeviceLocation.findOne({
    attributes,
    where: filters
  });

export const getDeviceLocationById = filters =>
  DeviceLocation.findOne({ where: filters });
export const createDeviceLocation = payload => DeviceLocation.build(payload).save();

export const updateDeviceLocation = (deviceLocationInfo, data, t) =>
  deviceLocationInfo.update(data, { transaction: t });

export const deleteDeviceLocation = (where) =>
  DeviceLocation.destroy({
    where
  });

export const getDeviceLocationsByDeviceAndDateRange = (deviceId, from, to) => {
  const where = { device_id: deviceId };
  if (from || to) {
    where.recorded_at = {};
    if (from) where.recorded_at[Sequelize.Op.gte] = from;
    if (to) where.recorded_at[Sequelize.Op.lte] = to;
  }
  return DeviceLocation.findAll({
    where,
    order: [['recorded_at', 'DESC']]
  });
};
