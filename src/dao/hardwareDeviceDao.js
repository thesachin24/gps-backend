import hardwareDeviceModel from '../models/hardwareDevice';

export const getHardwareDevice = (filters, attributes) =>
  hardwareDeviceModel.findOne({
    attributes,
    where: filters
  });

export const getHardwareDeviceById = filters =>
  hardwareDeviceModel.findOne({ where: filters });

export const createHardwareDevice = payload =>
  hardwareDeviceModel.build(payload).save();

export const updateHardwareDevice = (hardwareDeviceInfo, data, t) =>
  hardwareDeviceInfo.update(data, { transaction: t });

export const deleteHardwareDevice = where =>
  hardwareDeviceModel.destroy({
    where
  });
