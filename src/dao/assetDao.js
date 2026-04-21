import { ASSET_FIELD, OFFSET, PAGE_LIMIT } from '../constants';
import assetModel from '../models/asset';

export const getAssetList = (filter, page, pageSize, order = []) =>
  assetModel.findAndCountAll({
    attributes: ASSET_FIELD,
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    order: order.length ? [order] : [['id', 'DESC']]
  });

export const getAsset = (filters, attributes) =>
  assetModel.findOne({
    attributes: attributes || ASSET_FIELD,
    where: filters
  });

export const getAssetById = filters =>
  assetModel.findOne({
    attributes: ASSET_FIELD,
    where: filters
  });

export const createAsset = payload =>
  assetModel.build(payload).save();

export const updateAsset = (assetInfo, data, t) =>
  assetInfo.update(data, { transaction: t });

export const deleteAsset = where =>
  assetModel.destroy({ where });
