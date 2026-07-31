import Sequelize from 'sequelize';
import { OFFSET, PAGE_LIMIT } from '../constants';
import DeviceLocation from '../models/deviceLocation';
import AssetGeofenceMap from '../models/assetGeofenceMap';

export const getAssetGeofenceMapList = (filter, page, pageSize, order = []) => {
  return AssetGeofenceMap.findAndCountAll({
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    order: order.length ? [order] : [['id', 'DESC']]
  });
};

export const getAllAssetGeofenceMapList = (filter) => {
  return AssetGeofenceMap.findAndCountAll({
    where: filter,
  });
};


export const getAssetGeofenceMap = (filters, attributes) =>
  AssetGeofenceMap.findOne({
    attributes,
    where: filters
  });

export const getAssetGeofenceMapById = filters =>
  AssetGeofenceMap.findOne({ where: filters });

export const createAssetGeofenceMap = payload => AssetGeofenceMap.build(payload).save();

export const updateAssetGeofenceMap = (assetGeofenceMapInfo, data, t) =>
  assetGeofenceMapInfo.update(data, { transaction: t });

export const deleteAssetGeofenceMap = (where) =>
  AssetGeofenceMap.destroy({
    where
  });