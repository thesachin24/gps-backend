import Sequelize from 'sequelize';
import { MESSAGE_CONSTANTS, NOT_FOUND, SERVER_ERROR, OFFSET, PAGE_LIMIT } from '../constants';
import { CustomError } from '../utils';
import {
  createDeviceLocation,
  getDeviceLocationList,
  deleteDeviceLocation,
  getDeviceLocation,
  getDeviceLocationById,
  updateDeviceLocation
} from '../dao/deviceLocationDao';

const parseDateOrFallback = (value, fallback = null) => {
  if (!value) {
    return fallback;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const sanitizeCoordinates = ({ latitude, longitude }) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new CustomError(422, 'Latitude must be a valid number between -90 and 90.');
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new CustomError(422, 'Longitude must be a valid number between -180 and 180.');
  }
  return {
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lng.toFixed(6))
  };
};

const normalizePayload = payload => {
  const coordinates = sanitizeCoordinates(payload);
  const recordedAt = parseDateOrFallback(payload.recorded_at);
  if (!recordedAt) {
    throw new CustomError(422, 'recorded_at must be a valid timestamp.');
  }

  return {
    user_id: payload.user_id !== undefined && payload.user_id !== null ? Number(payload.user_id) : null,
    device_id: String(payload.device_id || '').trim(),
    device_type: String(payload.device_type || '').trim(),
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    recorded_at: recordedAt,
    accuracy: payload.accuracy !== undefined ? payload.accuracy : null,
    speed: payload.speed !== undefined ? payload.speed : null,
    heading: payload.heading !== undefined ? payload.heading : null,
    altitude: payload.altitude !== undefined ? payload.altitude : null,
    source: payload.source ? String(payload.source).trim() : null
  };
};

export const getAllDeviceLocationList = async payload => {
  let { page, limit, sortByRecordedAt, search } = payload;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;

  let filter = {};
  if (payload.user_id) {
    filter.user_id = Number(payload.user_id);
  }
  if (payload.device_id) {
    filter.device_id = String(payload.device_id).trim();
  }
  if (payload.device_type) {
    filter.device_type = String(payload.device_type).trim();
  }
  if (payload.source) {
    filter.source = String(payload.source).trim();
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
    const list = await getDeviceLocationList(filter, page, limit, order);
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

export const getDeviceLocationDetail = async id => {
  const data = await getDeviceLocationById({ id });
  if (!data) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data
  };
};

export const createDeviceLocations = async payload => {
  try {
    const normalized = normalizePayload(payload);
    if (!normalized.user_id || !normalized.device_id || !normalized.device_type) {
      throw new CustomError(422, 'user_id, device_id and device_type are required.');
    }
    const data = await createDeviceLocation(normalized);
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data
    };
  } catch (err) {
    throw new CustomError(
      err.status || SERVER_ERROR,
      err.message || MESSAGE_CONSTANTS.UNABLE_TO_SAVE_DATA,
      err.errors
    );
  }
};

export const updateDeviceLocationDetail = async (id, payload) => {
  const current = await getDeviceLocation({ id });
  if (!current) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }

  const merged = normalizePayload({
    ...current.toJSON(),
    ...payload
  });
  const updated = await updateDeviceLocation(current, merged);

  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data: updated
  };
};

export const deleteDeviceLocations = async id => {
  const deletedCount = await deleteDeviceLocation({ id });
  if (!deletedCount) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  return {
    message: MESSAGE_CONSTANTS.SUCCESS
  };
};
