import { DEVICE_FIELD, OFFSET, PAGE_LIMIT } from '../constants';
import deviceModel from '../models/device';
import sequelize from '../models/index';

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
