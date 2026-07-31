import Sequelize from 'sequelize';
import {
  MESSAGE_CONSTANTS,
  NOT_FOUND,
  SERVER_ERROR,
  FORBIDDEN,
  CONFLICT
} from '../constants';
import {
  getGeofenceList,
  getGeofence,
  getGeofenceById,
  createGeofence,
  updateGeofence,
  deleteGeofence
} from '../dao/geofenceDao';
import { CustomError } from '../utils';
import { createAssetGeofenceMap, createDeviceGeofenceMap, deleteAssetGeofenceMap, deleteDeviceGeofenceMap, getAsset, getAssetGeofenceMap, getDevice, getDeviceGeofenceMap } from '../dao';

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

export const getAllGeofences = async payload => {
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
    const list = await getGeofenceList(filter, offset, limit, order);
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

export const getGeofenceDetail = async (id, user_id) => {
  const data = await getGeofenceById({ id, user_id });
  if (!data) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.GEOFENCE_NOT_FOUND);
  }
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data
  };
};

export const createGeofences = async (payload, user_id) => {
  payload.is_active = true

  if(!payload.user_id){
    payload.user_id = user_id
  }

  try {
    const created = await createGeofence(payload);
    return {
      message: MESSAGE_CONSTANTS.GEOFENCE_CREATE_SUCCESS,
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

export const updateGeofenceDetail = async (id, payload, user_id) => {
  const geofence = await getGeofence({ id });
  if (!geofence) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.GEOFENCE_NOT_FOUND);
  }
  if (user_id && geofence.user_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.GEOFENCE_NOT_OWNER);
  }


  if(!payload.user_id){
    payload.user_id = user_id
  }

  try {
    const updated = await updateGeofence(geofence, payload);
    return {
      message: MESSAGE_CONSTANTS.GEOFENCE_UPDATE_SUCCESS,
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

export const deleteGeofences = async (id, user_id) => {
  const geofence = await getGeofence({ id });
  if (!geofence) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.GEOFENCE_NOT_FOUND);
  }
  if (user_id && geofence.user_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ACCESS_DENIED);
  }

  try {
    await deleteGeofence({ id });
    return {
      message: MESSAGE_CONSTANTS.GEOFENCE_DELETE_SUCCESS
    };
  } catch (err) {
    throw new CustomError(
      SERVER_ERROR,
      MESSAGE_CONSTANTS.UNABLE_TO_DELETE_DATA,
      err.message
    );
  }
};

export const unassignAssetFromGeofenceService = async (id, asset_id, user_id) => {
  const geofence = await getGeofence({ id });
  if (!geofence) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.GEOFENCE_NOT_FOUND);
  }
  if (user_id && geofence.user_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.DEVICE_NOT_OWNER);
  }
  const asset = await getAsset({ id: asset_id }, ["user_id"]);
  if (!asset) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.ASSET_NOT_FOUND);
  }
  if (user_id && asset.user_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ASSET_NOT_OWNER);
  }
  const existingMap = await getAssetGeofenceMap({ asset_id, geofence_id: id });
  if (!existingMap) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.ASSET_NOT_MAPPED_TO_GEOFENCE);
  }
  await deleteAssetGeofenceMap({ asset_id, geofence_id: id });
  return {
    message: MESSAGE_CONSTANTS.ASSET_UNASSIGNED_FROM_GEOFENCE
  };
};

export const mapAssetToGeofenceService = async (id, asset_id, user_id) => {
  const geofence = await getGeofence({ id });
  if (!geofence) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.GEOFENCE_NOT_FOUND);
  }
  if (user_id && geofence.user_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.DEVICE_NOT_OWNER);
  }
  const asset = await getAsset({ id: asset_id }, ["user_id"]);
  if (!asset) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.ASSET_NOT_FOUND);
  }
  if (user_id && asset.user_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ASSET_NOT_OWNER);
  }
  //Check if the device is already mapped to an geofence
  const existingMap = await getAssetGeofenceMap({ asset_id });
  if (existingMap) {
    throw new CustomError(CONFLICT, MESSAGE_CONSTANTS.ASSET_ALREADY_MAPPED_TO_GEOFENCE);
  }
  const map = await createAssetGeofenceMap({ asset_id, geofence_id: id });
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data: map
  };
};