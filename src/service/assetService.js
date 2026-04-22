import Sequelize from 'sequelize';
import {
  MESSAGE_CONSTANTS,
  NOT_FOUND,
  SERVER_ERROR,
  FORBIDDEN,
  CONFLICT
} from '../constants';
import {
  getAssetList,
  getAsset,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset
} from '../dao/assetDao';
import { CustomError } from '../utils';
import { createDeviceAssetMap, deleteDeviceAssetMap, getDevice, getDeviceAssetMap } from '../dao';

const pickUpdatableFields = payload => {
  const allowed = [
    'type',
    'name',
    'registration_number',
    'make',
    'model',
    'color',
    'metadata'
  ];
  const out = {};
  allowed.forEach(key => {
    if (payload[key] !== undefined) {
      out[key] = payload[key];
    }
  });
  return out;
};

export const getAllAssets = async payload => {
  const { search, offset, limit, sortByName } = payload;
  let { filter } = payload;
  let order = ['id', 'desc'];

  if (search) {
    const searchText = { [Sequelize.Op.iLike]: `%${search}%` };
    filter = {
      ...filter,
      [Sequelize.Op.or]: [
        { name: searchText },
        { registration_number: searchText },
        { make: searchText },
        { model: searchText }
      ]
    };
  }

  if (sortByName) {
    order = ['name', sortByName];
  }

  try {
    const list = await getAssetList(filter, offset, limit, order);
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: {
        list: list.rows,
        totalPages: Math.ceil(list.count / limit),
        currentPage: offset,
        totalCount: list.count
      }
    };
  } catch (err) {
    throw new CustomError(SERVER_ERROR, err.message);
  }
};

export const getAssetDetail = async (id, user_id) => {
  const data = await getAssetById({ id, user_id });
  if (!data) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.ASSET_NOT_FOUND);
  }
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data
  };
};

export const createAssets = async (payload, user_id) => {
  const row = {
    user_id,
    type: payload.type,
    name: payload.name != null ? payload.name : null,
    registration_number: payload.registration_number != null ? payload.registration_number : null,
    make: payload.make != null ? payload.make : null,
    model: payload.model != null ? payload.model : null,
    color: payload.color != null ? payload.color : null,
    metadata: payload.metadata != null ? payload.metadata : null
  };

  try {
    const created = await createAsset(row);
    return {
      message: MESSAGE_CONSTANTS.ASSET_CREATE_SUCCESS,
      data: created
    };
  } catch (err) {
    throw new CustomError(
      SERVER_ERROR,
      MESSAGE_CONSTANTS.UNABLE_TO_SAVE_DATA,
      err.message
    );
  }
};

export const updateAssetDetail = async (id, payload, user_id) => {
  const asset = await getAsset({ id });
  if (!asset) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.ASSET_NOT_FOUND);
  }
  if (user_id && asset.user_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ACCESS_DENIED);
  }

  const updates = pickUpdatableFields(payload);
  if (!Object.keys(updates).length) {
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: asset
    };
  }

  try {
    const updated = await updateAsset(asset, updates);
    return {
      message: MESSAGE_CONSTANTS.ASSET_UPDATE_SUCCESS,
      data: updated
    };
  } catch (err) {
    throw new CustomError(
      SERVER_ERROR,
      MESSAGE_CONSTANTS.UNABLE_TO_UPDATE_DATA,
      err.message
    );
  }
};

export const deleteAssets = async (id, user_id) => {
  const asset = await getAsset({ id });
  if (!asset) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.ASSET_NOT_FOUND);
  }
  if (user_id && asset.user_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ACCESS_DENIED);
  }

  try {
    await deleteAsset({ id });
    return {
      message: MESSAGE_CONSTANTS.ASSET_DELETE_SUCCESS
    };
  } catch (err) {
    throw new CustomError(
      SERVER_ERROR,
      MESSAGE_CONSTANTS.UNABLE_TO_DELETE_DATA,
      err.message
    );
  }
};

export const unassignDeviceFromAssetService = async (id, device_id, user_id) => {
  const asset = await getAsset({ id });
  if (!asset) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.ASSET_NOT_FOUND);
  }
  if (user_id && asset.user_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.DEVICE_NOT_OWNER);
  }
  const device = await getDevice({ id: device_id }, ["owner_id"]);
  if (!device) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.DEVICE_NOT_FOUND);
  }
  if (user_id && device.owner_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.DEVICE_NOT_OWNER);
  }
  const existingMap = await getDeviceAssetMap({ device_id, asset_id: id });
  if (!existingMap) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.DEVICE_NOT_MAPPED_TO_ASSET);
  }
  await deleteDeviceAssetMap({ device_id, asset_id: id });
  return {
    message: MESSAGE_CONSTANTS.DEVICE_UNASSIGNED_FROM_ASSET
  };
};

export const mapDeviceToAssetService = async (id, device_id, user_id) => {
  const asset = await getAsset({ id });
  if (!asset) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.ASSET_NOT_FOUND);
  }
  if (user_id && asset.user_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.DEVICE_NOT_OWNER);
  }
  const device = await getDevice({ id: device_id }, ["owner_id"]);
  if (!device) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.DEVICE_NOT_FOUND);
  }
  if (user_id && device.owner_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.DEVICE_NOT_OWNER);
  }
  //Check if the device is already mapped to an asset
  const existingMap = await getDeviceAssetMap({ device_id });
  if (existingMap) {
    throw new CustomError(CONFLICT, MESSAGE_CONSTANTS.DEVICE_ALREADY_MAPPED_TO_ASSET);
  }
  const map = await createDeviceAssetMap({ device_id, asset_id: id });
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data: map
  };
};