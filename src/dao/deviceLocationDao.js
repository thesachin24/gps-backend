import { OFFSET, PAGE_LIMIT } from '../constants';
import DeviceLocation from '../models/deviceLocation';
import sequelize from '../models/index';

export const getDeviceLocationList = (filter, page, pageSize, order = []) => {
  return DeviceLocation.findAndCountAll({
    attributes: DEVICE_LOCATIONS_FIELD,
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where,
    order: order.length && [order]
  });
};

export const getAllDeviceLocationList = (filter) => {
  return DeviceLocation.findAndCountAll({
    attributes,
    where,
  });
};


export const getDeviceLocation = (filters, attributes) =>
  DeviceLocation.findOne({
    attributes: attributes || BANNERS_FIELD,
    where: filters
  });

export const getDeviceLocationById = filters =>
  DeviceLocation.findOne({ where: filters });

export const getDeviceLocationInfoWithIgnoreCase = value =>
  DeviceLocation.findOne({
    where: sequelize.where(
      sequelize.fn('lower', sequelize.col('name')),
      value.toLowerCase()
    ),
    raw: true
  });
export const createDeviceLocation = payload => DeviceLocation.build(payload).save();

export const updateDeviceLocation = (deviceLocationInfo, data, t) =>
  deviceLocationInfo.update(data, { transaction: t });

export const deleteDeviceLocation = (where) =>
  DeviceLocation.destroy({
    where
  });
