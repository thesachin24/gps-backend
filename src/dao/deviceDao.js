import { Sequelize } from 'sequelize';
import { DEVICE_FIELD, OFFSET, PAGE_LIMIT } from '../constants';
import deviceModel from '../models/device';
import sequelize from '../models/index';
import Telemetry from '../models/telemetry';

export const getDeviceList = (filter, page, pageSize, order = []) =>
  deviceModel.findAndCountAll({
    attributes: DEVICE_FIELD,
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    order: order.length ? [order] : [['id', 'DESC']]
  });

export const getDevice = (filters, attributes) =>
  deviceModel.findOne({
    attributes: attributes || DEVICE_FIELD,
    where: filters
  });

export const getDeviceById = filters =>
  deviceModel.findOne({
    attributes: DEVICE_FIELD,
    where: filters
  });

export const getDeviceByDeviceIdIgnoreCase = value =>
  deviceModel.findOne({
    where: sequelize.where(
      sequelize.fn('lower', sequelize.col('device_id')),
      String(value).toLowerCase()
    ),
    raw: true
  });

export const createDevice = payload =>
  deviceModel.build(payload).save();

export const updateDevice = (deviceInfo, data, t) =>
  deviceInfo.update(data, { transaction: t });

export const deleteDevice = where =>
  deviceModel.destroy({
    where
  });


export const getDeviceTripsByDeviceAndDateRange = (deviceId, from, to) => {
  const where = { device_id: deviceId };
  if (from || to) {
    where.recorded_at = {};
    if (from) where.recorded_at[Sequelize.Op.gte] = from;
    if (to) where.recorded_at[Sequelize.Op.lte] = to;
  }
  return Telemetry.findAll({
    where,
    order: [['recorded_at', 'ASC']]
  });
};