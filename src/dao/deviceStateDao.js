import Sequelize from 'sequelize';
import { OFFSET, PAGE_LIMIT } from '../constants';
import DeviceState from '../models/deviceState';

export const getdeviceStateList = (filter, page, pageSize, order = []) => {
  return DeviceState.findAndCountAll({
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    order: order.length ? [order] : [['id', 'DESC']]
  });
};

export const getAllDeviceStateList = (filter) => {
  return DeviceState.findAndCountAll({
    where: filter,
  });
};


export const getDeviceState = (filters, attributes) =>
  DeviceState.findOne({
    attributes,
    where: filters
  });

export const getDeviceStateById = filters =>
  DeviceState.findOne({ where: filters });

export const createDeviceState = payload => DeviceState.build(payload).save();

export const updateDeviceState = (deviceStateInfo, data, t) =>
  deviceStateInfo.update(data, { transaction: t });

export const deleteDeviceState = (where) =>
  DeviceState.destroy({
    where
  });

export const getDeviceStatesByDeviceAndDateRange = (deviceId, from, to) => {
  const where = { device_id: deviceId };
  if (from || to) {
    where.recorded_at = {};
    if (from) where.recorded_at[Sequelize.Op.gte] = from;
    if (to) where.recorded_at[Sequelize.Op.lte] = to;
  }
  return DeviceState.findAll({
    where,
    order: [['recorded_at', 'ASC']]
  });
};
