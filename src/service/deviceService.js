import Sequelize from 'sequelize';
import {
  MESSAGE_CONSTANTS,
  NOT_FOUND,
  SERVER_ERROR,
  FORBIDDEN,
  CONFLICT,
  UN_PROCESSABLE_ENTITY,
  OFFSET,
  PAGE_LIMIT,
  INVENTORY_STATUS
} from '../constants';
import {
  getDeviceList,
  getDevice,
  getDeviceById,
  getDeviceByDeviceIdIgnoreCase,
  createDevice,
  updateDevice,
  deleteDevice,
  getDeviceSummary
} from '../dao/deviceDao';
import { CustomError } from '../utils';
import { createDeviceState, deleteDeviceAssetMap, deleteDeviceState, getDeviceLocationList, getDeviceInventory, getTelemetryList, updateDeviceInventory } from '../dao';

const pickUpdatableFields = payload => {
  const allowed = [
    'device_id',
    'device_name',
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
        { device_name: searchText },
        { device_id: searchText },
        // { device_type: searchText }
      ]
    };
  }

  if (sortByName) {
    order = ['device_name', sortByName];
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

export const getDeviceDetail = async (id, owner_id) => {
  const data = await getDeviceById({ id, owner_id });
  if (!data) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data
  };
};

export const createDevices = async (payload, owner_id, owner_type) => {
  const qr_uuid = String(payload.qr_uuid || '').trim();
  if (!qr_uuid) {
    throw new CustomError(UN_PROCESSABLE_ENTITY, 'device_id is required.');
  }

  const deviceInventory = await getDeviceInventory({ qr_uuid });
  if (!deviceInventory) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }

  const { device_id, device_type, sim_number, name  } = deviceInventory;
  const existing = await getDeviceByDeviceIdIgnoreCase(device_id);
  if (existing) {
    throw new CustomError(CONFLICT, MESSAGE_CONSTANTS.DEVICE_ALREADY_EXISTS);
  }

  const row = {
    owner_id,
    owner_type,
    device_id,
    device_name: payload.device_name != null ? payload.device_name : null,
    device_type: device_type || 'GPS_TRACKER',
    sim_number,
    is_active: true
  };

  try {
    const created = await createDevice(row);
    //Create device state
    await createDeviceState({ device_id: created.id });

    //Update inventory status to IN_USE
    await updateDeviceInventory(deviceInventory, { status: INVENTORY_STATUS.ACTIVATED });
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
  if (user_id && device.owner_id !== user_id) {
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
  if (user_id && device.owner_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ACCESS_DENIED);
  }

  try {
    // Delete device state
    await deleteDeviceState({ device_id: id });
    // Delete device asset map
    await deleteDeviceAssetMap({ device_id: id });
    // Delete device
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


export const getAllDeviceLocationListData = async payload => {
  let { id, page, limit, sortByRecordedAt, search } = payload;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;

  let filter = {};
  if (payload.user_id) {
    filter.owner_id = Number(payload.user_id);
  }
  if (id) {
    filter.device_id = id;
  }
  if (payload.device_type) {
    filter.device_type = String(payload.device_type).trim();
  }
  if (payload.source) {
    filter.source = String(payload.source).trim();
  }
  if (payload.from || payload.to) {
    filter.recorded_at = {};
    if (payload.from) filter.recorded_at[Sequelize.Op.gte] = new Date(payload.from);
    if (payload.to) filter.recorded_at[Sequelize.Op.lte] = new Date(payload.to);
  }
  if (search) {
    const searchText = { [Sequelize.Op.iLike]: `%${search}%` };
    filter = {
      ...filter,
      [Sequelize.Op.or]: [
        { device_id: searchText },
        { device_type: searchText },
        { source: searchText }
      ]
    };
  }

  let order = ['recorded_at', 'desc'];
  if (sortByRecordedAt) {
    order = ['recorded_at', sortByRecordedAt];
  }

  try {
    const list = await getTelemetryList(filter, page, limit, order);
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: {
        list: list.rows,
        totalPages: Math.ceil(list.count / limit),
        currentPage: page,
        totalCount: list.count
      }
    };
  } catch (err) {
    throw new CustomError(SERVER_ERROR, err.message);
  }
};

export const getDeviceSummaryData = async ({ id, from, to, owner_id }) => {
  const data = await getDeviceSummary({ id, from, to, owner_id });
  if (!data) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data
  };
};