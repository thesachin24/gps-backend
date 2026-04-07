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
  getHardwareDeviceList,
  getHardwareDevice,
  getHardwareDeviceById,
  getHardwareDeviceByDeviceIdIgnoreCase,
  createHardwareDevice,
  updateHardwareDevice,
  deleteHardwareDevice
} from '../dao/hardwareDeviceDao';
import { CustomError } from '../utils';

const pickUpdatableFields = payload => {
  const allowed = [
    'device_id',
    'device_type',
    'name',
    'metadata',
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

export const getAllHardwareDevices = async payload => {
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
    const list = await getHardwareDeviceList(filter, offset, limit, order);
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

export const getHardwareDeviceDetail = async (id, user_id) => {
  const data = await getHardwareDeviceById({ id, user_id });
  if (!data) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data
  };
};

export const createHardwareDevices = async (payload, user_id) => {
  const deviceId = String(payload.device_id || '').trim();
  if (!deviceId) {
    throw new CustomError(UN_PROCESSABLE_ENTITY, 'device_id is required.');
  }

  const existing = await getHardwareDeviceByDeviceIdIgnoreCase(deviceId);
  if (existing) {
    throw new CustomError(CONFLICT, MESSAGE_CONSTANTS.HARDWARE_DEVICE_ALREADY_EXISTS);
  }

  const row = {
    user_id,
    device_id: deviceId,
    device_type: payload.device_type || 'GPS_TRACKER',
    name: payload.name != null ? payload.name : null,
    metadata: payload.metadata != null ? payload.metadata : null,
    is_active: payload.is_active !== undefined ? !!payload.is_active : true
  };

  try {
    const created = await createHardwareDevice(row);
    return {
      message: MESSAGE_CONSTANTS.HARDWARE_DEVICE_CREATE_SUCCESS,
      data: created
    };
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw new CustomError(CONFLICT, MESSAGE_CONSTANTS.HARDWARE_DEVICE_ALREADY_EXISTS);
    }
    throw new CustomError(
      SERVER_ERROR,
      MESSAGE_CONSTANTS.UNABLE_TO_SAVE_DATA,
      err.message
    );
  }
};

export const updateHardwareDeviceDetail = async (id, payload, user_id) => {
  const device = await getHardwareDevice({ id });
  if (!device) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  if (user_id && device.user_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ACCESS_DENIED);
  }

  const updates = pickUpdatableFields(payload);
  if (updates.device_id !== undefined) {
    updates.device_id = String(updates.device_id).trim();
    const other = await getHardwareDeviceByDeviceIdIgnoreCase(updates.device_id);
    if (other && String(other.id) !== String(id)) {
      throw new CustomError(CONFLICT, MESSAGE_CONSTANTS.HARDWARE_DEVICE_ALREADY_EXISTS);
    }
  }

  if (!Object.keys(updates).length) {
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: device
    };
  }

  try {
    const updated = await updateHardwareDevice(device, updates);
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: updated
    };
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw new CustomError(CONFLICT, MESSAGE_CONSTANTS.HARDWARE_DEVICE_ALREADY_EXISTS);
    }
    throw new CustomError(
      SERVER_ERROR,
      MESSAGE_CONSTANTS.UNABLE_TO_UPDATE_DATA,
      err.message
    );
  }
};

export const deleteHardwareDevices = async (id, user_id) => {
  const device = await getHardwareDevice({ id });
  if (!device) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  if (user_id && device.user_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ACCESS_DENIED);
  }

  try {
    await deleteHardwareDevice({ id });
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
