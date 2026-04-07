import { HARDWARE_DEVICE_FIELD, OFFSET, PAGE_LIMIT } from '../constants';
import hardwareDeviceModel from '../models/hardwareDevice';
import sequelize from '../models/index';

export const getHardwareDeviceList = (filter, page, pageSize, order = []) =>
  hardwareDeviceModel.findAndCountAll({
    attributes: HARDWARE_DEVICE_FIELD,
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    order: order.length ? [order] : [['id', 'DESC']]
  });

export const getHardwareDevice = (filters, attributes) =>
  hardwareDeviceModel.findOne({
    attributes: attributes || HARDWARE_DEVICE_FIELD,
    where: filters
  });

export const getHardwareDeviceById = filters =>
  hardwareDeviceModel.findOne({
    attributes: HARDWARE_DEVICE_FIELD,
    where: filters
  });

export const getHardwareDeviceByDeviceIdIgnoreCase = value =>
  hardwareDeviceModel.findOne({
    where: sequelize.where(
      sequelize.fn('lower', sequelize.col('device_id')),
      String(value).toLowerCase()
    ),
    raw: true
  });

export const createHardwareDevice = payload =>
  hardwareDeviceModel.build(payload).save();

export const updateHardwareDevice = (hardwareDeviceInfo, data, t) =>
  hardwareDeviceInfo.update(data, { transaction: t });

export const deleteHardwareDevice = where =>
  hardwareDeviceModel.destroy({
    where
  });
