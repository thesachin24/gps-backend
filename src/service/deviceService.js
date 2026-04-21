import Sequelize from 'sequelize';
import {
  MESSAGE_CONSTANTS,
  NOT_FOUND,
  SERVER_ERROR,
  FORBIDDEN,
  CONFLICT,
  UN_PROCESSABLE_ENTITY
} from '../constants';
import {
  getDeviceList,
  getDevice,
  getDeviceById,
  getDeviceByDeviceIdIgnoreCase,
  createDevice,
  updateDevice,
  deleteDevice
} from '../dao/deviceDao';
import { CustomError } from '../utils';
import { createDeviceState } from '../dao';

const pickUpdatableFields = payload => {
  const allowed = [
    'device_id',
    'device_type',
    'firmware_version',
    'sim_number',
    'owner_id',
    'owner_type',
    'is_active'
  ];
  const out = {};
  allowed.forEach(key => {
    if (payload[key] !== undefined) {
      out[key] = payload[key];
    }
  });
  return out;
};

export const getAllDevices = async payload => {
  const { search, offset, limit, sortByName } = payload;
  let { filter } = payload;
  let order = ['id', 'desc'];

  if (search) {
    const searchText = { [Sequelize.Op.iLike]: `%${search}%` };
    filter = {
      ...filter,
      [Sequelize.Op.or]: [
        { name: searchText },
        { device_id: searchText },
        { device_type: searchText }
      ]
    };
  }

  if (sortByName) {
    order = ['name', sortByName];
  }

  try {
    const list = await getDeviceList(filter, offset, limit, order);
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

export const getDeviceDetail = async (id, user_id) => {
  const data = await getDeviceById({ id, user_id });
  if (!data) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data
  };
};

export const createDevices = async (payload, owner_id, owner_type) => {
  const deviceId = String(payload.device_id || '').trim();
  if (!deviceId) {
    throw new CustomError(UN_PROCESSABLE_ENTITY, 'device_id is required.');
  }

  const existing = await getDeviceByDeviceIdIgnoreCase(deviceId);
  if (existing) {
    throw new CustomError(CONFLICT, MESSAGE_CONSTANTS.DEVICE_ALREADY_EXISTS);
  }

  const row = {
    owner_id,
    owner_type,
    device_id: deviceId,
    device_type: payload.device_type || 'GPS_TRACKER',
    firmware_version: payload.firmware_version != null ? payload.firmware_version : null,
    sim_number: payload.sim_number != null ? payload.sim_number : null,
    name: payload.name != null ? payload.name : null,
    metadata: payload.metadata != null ? payload.metadata : null,
    is_active: payload.is_active !== undefined ? !!payload.is_active : true
  };

  try {
    const created = await createDevice(row);
    //Create device state
    await createDeviceState({ device_id: deviceId });

    return {
      message: MESSAGE_CONSTANTS.DEVICE_CREATE_SUCCESS,
      data: created
    };
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw new CustomError(CONFLICT, MESSAGE_CONSTANTS.DEVICE_ALREADY_EXISTS);
    }
    throw new CustomError(
      SERVER_ERROR,
      MESSAGE_CONSTANTS.UNABLE_TO_SAVE_DATA,
      err.message
    );
  }
};

export const updateDeviceDetail = async (id, payload, user_id) => {
  const device = await getDevice({ id });
  if (!device) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  if (user_id && device.user_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ACCESS_DENIED);
  }

  const updates = pickUpdatableFields(payload);
  if (updates.device_id !== undefined) {
    updates.device_id = String(updates.device_id).trim();
    const other = await getDeviceByDeviceIdIgnoreCase(updates.device_id);
    if (other && String(other.id) !== String(id)) {
      throw new CustomError(CONFLICT, MESSAGE_CONSTANTS.DEVICE_ALREADY_EXISTS);
    }
  }

  if (!Object.keys(updates).length) {
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: device
    };
  }

  try {
    const updated = await updateDevice(device, updates);
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: updated
    };
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw new CustomError(CONFLICT, MESSAGE_CONSTANTS.DEVICE_ALREADY_EXISTS);
    }
    throw new CustomError(
      SERVER_ERROR,
      MESSAGE_CONSTANTS.UNABLE_TO_UPDATE_DATA,
      err.message
    );
  }
};

export const deleteDevices = async (id, user_id) => {
  const device = await getDevice({ id });
  if (!device) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  if (user_id && device.user_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ACCESS_DENIED);
  }

  try {
    await deleteDevice({ id });
    return {
      message: MESSAGE_CONSTANTS.SUCCESS
    };
  } catch (err) {
    throw new CustomError(
      SERVER_ERROR,
      MESSAGE_CONSTANTS.UNABLE_TO_DELETE_DATA,
      err.message
    );
  }
};
