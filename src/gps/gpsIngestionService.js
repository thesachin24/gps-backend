import logger from '../config/logger';
import { createDeviceLocation } from '../dao/deviceLocationDao';
import { getHardwareDevice, updateHardwareDevice } from '../dao/hardwareDeviceDao';

const parseDateOrFallback = (value, fallback = null) => {
  if (!value) {
    return fallback;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const isValidFix = parsed =>
  parsed?.type === 'gps_fix' &&
  Number.isFinite(parsed.latitude) &&
  Number.isFinite(parsed.longitude);

const toFixedCoordinate = value => Number(Number(value).toFixed(6));

export const saveGpsLocation = async ({
  deviceId,
  payload,
  metadata
}) => {
  if (!deviceId || !isValidFix(payload)) {
    return null;
  }

  const hardwareDevice = await getHardwareDevice({ device_id: deviceId, is_active: true });
  if (!hardwareDevice?.user_id) {
    logger.info(`Skipping GPS persist, hardware device not mapped for ${deviceId}`);
    return null;
  }

  const recordedAt = parseDateOrFallback(payload.timestamp, new Date());
  const locationPayload = {
    user_id: hardwareDevice.user_id,
    device_id: deviceId,
    device_type: hardwareDevice.device_type || payload.device_type || 'gps_tracker',
    latitude: payload.latitude,
    longitude: payload.longitude,
    recorded_at: recordedAt,
    speed: payload.speed !== undefined ? payload.speed : null,
    heading: payload.heading !== undefined ? payload.heading : null,
    source: payload.source || 'gps'
  };

  try {
    // Create device locations
    const location = await createDeviceLocation(locationPayload);

    // Update hardware device
    await updateHardwareDevice(hardwareDevice, {
      latitude: toFixedCoordinate(payload.latitude),
      longitude: toFixedCoordinate(payload.longitude),
      last_recorded_at: recordedAt,
      updated_at: new Date(),
      metadata: metadata || {
        transport,
        parsed
      }
    });
    return location;
  } catch (error) {
    logger.error(`Failed to persist GPS location for ${deviceId}: ${error.message}`);
    return null;
  }
};
