import logger from '../config/logger';
import { createDeviceLocation } from '../dao/deviceLocationDao';
import { getDevice, updateDevice } from '../dao/deviceDao';
import { createDeviceState, createTelemetry, getDeviceState, updateDeviceState } from '../dao';

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

export const saveHeartbeat = async ({ deviceId, parsed }) => {
  if (!deviceId || parsed?.protocol !== 'heartbeat' || !parsed?.heartbeat) {
    logger.info(`Heartbeat persist skipped: missing data deviceId=${deviceId || 'unknown'}`);
    return null;
  }

  const device = await getDevice({ device_id: deviceId, is_active: true });
  if (!device) {
    logger.info(`Skipping heartbeat persist, device not mapped for ${deviceId}`);
    return null;
  }

  try {
    const heartbeatData = {
      ...parsed.heartbeat,
      received_at: new Date().toISOString()
    };
    await updateDeviceState(device, {
      heartbeat: heartbeatData,
      updated_at: new Date()
    });
    logger.info(`Heartbeat persist success: deviceId=${deviceId}`);
    return heartbeatData;
  } catch (error) {
    logger.error(`Failed to persist heartbeat for ${deviceId}: ${error.message}`);
    return null;
  }
};

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

  const device = await getDevice({ device_id: deviceId, is_active: true });
  if (!device) {
    logger.info(`Skipping GPS persist, device not mapped for ${deviceId}`);
    return null;
  }

  const recordedAt = parseDateOrFallback(parsed.timestamp, new Date());
  const telemetryPayload = {
    user_id: device.user_id,
    device_id: deviceId,
    device_type: device.device_type || transport || 'gps_tracker',
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    recorded_at: recordedAt,
    speed: parsed.speed !== undefined ? parsed.speed : null,
    heading: parsed.heading !== undefined ? parsed.heading : null,
    ignition: parsed.ignition !== undefined ? parsed.ignition : null,
    source: source || parsed.source || parsed.protocol || 'gps'
  };

  try {
    logger.info(`GPS persist start: ${JSON.stringify({
      deviceId,
      user_id: telemetryPayload.user_id,
      transport: transport || null,
      source: telemetryPayload.source,
      latitude: telemetryPayload.latitude,
      longitude: telemetryPayload.longitude,
      recorded_at: telemetryPayload.recorded_at
    })}`);

    // Create device locations
    // const location = await createDeviceLocation(locationPayload);
    const telemetryData = await createTelemetry(telemetryPayload);

    // Update hardware device
    const deviceState = await getDeviceState({ device_id: device.id });
    if (!deviceState) {
      await createDeviceState({ device_id: device.id });
    }
    await updateDeviceState(deviceState, {
      latitude: toFixedCoordinate(parsed.latitude),
      longitude: toFixedCoordinate(parsed.longitude),
      speed: parsed.speed !== undefined ? parsed.speed : null,
      heading: parsed.heading !== undefined ? parsed.heading : null,
      ignition: parsed.ignition !== undefined ? parsed.ignition : null,
      metadata: metadata || {
        transport,
        parsed
      },
      last_recorded_at: recordedAt,
      updated_at: new Date()
    });
    logger.info(`GPS persist success: deviceId=${deviceId} telemetryId=${telemetryData?.id || 'na'}`);
    return telemetryData;
  } catch (error) {
    logger.error(`Failed to persist GPS location for ${deviceId}: ${error.message} payload=${JSON.stringify(telemetryPayload)}`);
    return null;
  }
};
