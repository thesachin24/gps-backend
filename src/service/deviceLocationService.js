import Sequelize from 'sequelize';
import { MESSAGE_CONSTANTS, NOT_FOUND, SERVER_ERROR, OFFSET, PAGE_LIMIT } from '../constants';
import { CustomError } from '../utils';
import {
  createDeviceLocation,
  getDeviceLocationList,
  deleteDeviceLocation,
  getDeviceLocation,
  getDeviceLocationById,
  updateDeviceLocation,
  getDeviceLocationsByDeviceAndDateRange
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

const EARTH_RADIUS_KM = 6371;
const DEFAULT_STOP_THRESHOLD_MINUTES = 15;

const toRadians = deg => (deg * Math.PI) / 180;

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDuration = ms => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds || !parts.length) parts.push(`${seconds}s`);
  return parts.join(' ');
};

const buildTrip = (points, index) => {
  const first = points[0];
  const last = points[points.length - 1];

  let totalDistanceKm = 0;
  for (let i = 1; i < points.length; i++) {
    totalDistanceKm += haversineDistance(
      Number(points[i - 1].latitude),
      Number(points[i - 1].longitude),
      Number(points[i].latitude),
      Number(points[i].longitude)
    );
  }

  const startTime = new Date(first.recorded_at);
  const endTime = new Date(last.recorded_at);
  const durationMs = endTime - startTime;
  const durationHours = durationMs / 3600000;

  return {
    trip_number: index + 1,
    start_time: startTime,
    end_time: endTime,
    duration_ms: durationMs,
    duration: formatDuration(durationMs),
    start_location: { latitude: Number(first.latitude), longitude: Number(first.longitude) },
    end_location: { latitude: Number(last.latitude), longitude: Number(last.longitude) },
    distance_km: Math.round(totalDistanceKm * 100) / 100,
    avg_speed_kmh: durationHours > 0
      ? Math.round((totalDistanceKm / durationHours) * 100) / 100
      : 0,
    point_count: points.length,
    locations: points
  };
};

export const getDeviceTrips = async payload => {
  const { device_id, from, to, stop_duration } = payload;
  const stopThresholdMs =
    (Number(stop_duration) || DEFAULT_STOP_THRESHOLD_MINUTES) * 60 * 1000;

  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  const locations = await getDeviceLocationsByDeviceAndDateRange(device_id, fromDate, toDate);

  if (!locations || !locations.length) {
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: { trips: [], total_trips: 0, total_distance_km: 0, total_duration: '0s' }
    };
  }

  const trips = [];
  let currentTripPoints = [locations[0]];

  for (let i = 1; i < locations.length; i++) {
    const prevTime = new Date(locations[i - 1].recorded_at).getTime();
    const currTime = new Date(locations[i].recorded_at).getTime();
    const gap = currTime - prevTime;

    if (gap > stopThresholdMs) {
      trips.push(buildTrip(currentTripPoints, trips.length));
      currentTripPoints = [locations[i]];
    } else {
      currentTripPoints.push(locations[i]);
    }
  }

  if (currentTripPoints.length) {
    trips.push(buildTrip(currentTripPoints, trips.length));
  }

  const totalDistanceKm = trips.reduce((sum, t) => sum + t.distance_km, 0);
  const totalDurationMs = trips.reduce((sum, t) => sum + t.duration_ms, 0);

  trips.reverse();
  trips.forEach((t, i) => { t.trip_number = i + 1; });

  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data: {
      trips,
      total_trips: trips.length,
      total_distance_km: Math.round(totalDistanceKm * 100) / 100,
      total_duration: formatDuration(totalDurationMs)
    }
  };
};
