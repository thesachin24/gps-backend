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
  parsed,
  transport,
  source,
  metadata
}) => {
  if (!deviceId || !isValidFix(parsed)) {
    logger.info(`GPS persist skipped: invalid fix payload deviceId=${deviceId || 'unknown'} parsed=${JSON.stringify(parsed || {})}`);
    return null;
  }

  const hardwareDevice = await getHardwareDevice({ device_id: deviceId, is_active: true });
  if (!hardwareDevice?.user_id) {
    logger.info(`Skipping GPS persist, hardware device not mapped for ${deviceId}`);
    return null;
  }

  const recordedAt = parseDateOrFallback(parsed.timestamp, new Date());
  const locationPayload = {
    user_id: hardwareDevice.user_id,
    device_id: deviceId,
    device_type: hardwareDevice.device_type || transport || 'gps_tracker',
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    recorded_at: recordedAt,
    speed: parsed.speed !== undefined ? parsed.speed : null,
    heading: parsed.heading !== undefined ? parsed.heading : null,
    source: source || parsed.source || parsed.protocol || 'gps'
  };

  try {
    logger.info(`GPS persist start: ${JSON.stringify({
      deviceId,
      user_id: locationPayload.user_id,
      transport: transport || null,
      source: locationPayload.source,
      latitude: locationPayload.latitude,
      longitude: locationPayload.longitude,
      recorded_at: locationPayload.recorded_at
    })}`);

    // Create device locations
    const location = await createDeviceLocation(locationPayload);

    // Update hardware device
    await updateHardwareDevice(hardwareDevice, {
      latitude: toFixedCoordinate(parsed.latitude),
      longitude: toFixedCoordinate(parsed.longitude),
      last_recorded_at: recordedAt,
      updated_at: new Date(),
      metadata: metadata || {
        transport,
        parsed
      }
    });
    logger.info(`GPS persist success: deviceId=${deviceId} locationId=${location?.id || 'na'}`);
    return location;
  } catch (error) {
    logger.error(`Failed to persist GPS location for ${deviceId}: ${error.message} payload=${JSON.stringify(locationPayload)}`);
    return null;
  }
};
