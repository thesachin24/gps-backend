import logger from '../config/logger';
import { createDeviceLocation } from '../dao/deviceLocationDao';
import { getDevice, updateDevice } from '../dao/deviceDao';
import { createDeviceState, createTelemetry, getDeviceState, updateDeviceState } from '../dao';
import { acknowledgeDeviceCommandByFlag, createDeviceCommand } from '../dao/deviceCommandDao';
import { RELAY_ON_RESPONSES, RELAY_OFF_RESPONSES } from '../constants/deviceCommand';
import { NOTIFY } from '../constants';
import { _notify } from '../utils';

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
    // console.log('HEARTBEAT DATA:----------->', heartbeatData);

    // Extract relay_status, ignition, and GPS tracking flags from terminalInfo bits
    const relayStatus = parsed.heartbeat?.terminalInfoDecoded?.armed ?? null;
    const ignitionOn = parsed.heartbeat?.terminalInfoDecoded?.ignitionOn ?? null;
    const batteryLevel = parsed.heartbeat?.batteryLevel ?? null;
    const gsmSignal = parsed.heartbeat?.gsmSignal ?? null;
    const gpsTracking = parsed.heartbeat?.terminalInfoDecoded?.gpsTracking ?? null;

    // Console to Terminal - Yellow Color Print
    console.log('\x1b[33m%s\x1b[0m', '--------------------------------------------------------------');
    console.log('\x1b[33m%s\x1b[0m', 'HEARTBEAT DATA Received Device:----------->', deviceId,);
    console.log('\x1b[33m%s\x1b[0m', 'Relay Status:------->', relayStatus);
    console.log('\x1b[33m%s\x1b[0m', 'Battery Level:------->', batteryLevel);
    console.log('\x1b[33m%s\x1b[0m', 'Ignition:------->', ignitionOn);
    console.log('\x1b[33m%s\x1b[0m', 'GSM Signal:------->', gsmSignal);
    console.log('\x1b[33m%s\x1b[0m', 'GPS Tracking:------->', gpsTracking);
    console.log('\x1b[33m%s\x1b[0m', 'HEARTBEAT DATA Received Device:----------->', deviceId,);
    console.log('\x1b[33m%s\x1b[0m', '--------------------------------------------------------------');
    // Console to Terminal - Yellow Color Print


    // gpsCourseValid from heartbeat is advisory only — overwritten by GPS packet data
    const gpsCourseValid = parsed.heartbeat?.terminalInfoDecoded?.gpsCourseValid ?? null;
    let deviceState = await getDeviceState({ device_id: device.id });
    if (!deviceState) {
      deviceState = await createDeviceState({ device_id: device.id });
    }
    await updateDeviceState(deviceState, {
      heartbeat: heartbeatData,
      relay_status: relayStatus,
      battery_level: batteryLevel,
      gsm_signal: gsmSignal,
      ignition: ignitionOn,
      gps_tracking: gpsTracking,
      // Only update gps_fixed from heartbeat if no GPS packet has set it yet
      ...(deviceState.gps_fixed === null && gpsCourseValid !== null ? { gps_fixed: gpsCourseValid } : {}),
      last_heartbeat_at: new Date(),
      updated_at: new Date()
    });
    logger.info(`Heartbeat persist success: deviceId=${deviceId} relay=${relayStatus} ignition=${ignitionOn} gpsTracking=${gpsTracking} gpsCourseValid=${gpsCourseValid}`);

    // Send push notification to the user
    // if(ignitionOn != deviceState.ignition) {
       //Notify User
    void _notify(NOTIFY.IGNITION_STATE_CHANGED, device.owner_id, {
      device_name: device.device_name,
      ignition_state: ignitionOn ? 'Started' : 'Stopped'
    });
    // }
    // Send push notification to the user

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
  metadata,
  locationReverseGeocode: { location, address }
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
    location: location || null,
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
      recorded_at: telemetryPayload.recorded_at,
      location: telemetryPayload.location
    })}`);

    // Create device locations
    // const location = await createDeviceLocation(locationPayload);
    const telemetryData = await createTelemetry(telemetryPayload);

    // Update hardware device
    let deviceState = await getDeviceState({ device_id: device.id });
    if (!deviceState) {
      deviceState = await createDeviceState({ device_id: device.id });
    }
    await updateDeviceState(deviceState, {
      latitude: toFixedCoordinate(parsed.latitude),
      longitude: toFixedCoordinate(parsed.longitude),
      speed: parsed.speed !== undefined ? parsed.speed : null,
      heading: parsed.heading !== undefined ? parsed.heading : null,
      ignition: parsed.ignition !== undefined ? parsed.ignition : null,
      gps_fixed: parsed.courseStatusFlags?.gpsFixed ?? parsed.gpsFixed ?? null,
      satellites: parsed.satellites !== undefined ? parsed.satellites : null,
      address: address || null,
      location: location || null,
      metadata: metadata || {
        transport,
        parsed
      },
      last_location_at: recordedAt,
      updated_at: new Date()
    });
    logger.info(`GPS persist success: deviceId=${deviceId} telemetryId=${telemetryData?.id || 'na'}`);
    return telemetryData;
  } catch (error) {
    logger.error(`Failed to persist GPS location for ${deviceId}: ${error.message} payload=${JSON.stringify(telemetryPayload)}`);
    return null;
  }
};

/**
 * Handle a GT06 alarm packet (protocol 0x16) that carries a relay arm/disarm event.
 * This fires when RELAY,1 or RELAY,0 was sent via SMS (not via TCP).
 * Updates device_state.relay_status and logs a synthetic entry in device_commands.
 */
export const handleRelayEvent = async ({ deviceId, parsed }) => {
  if (!deviceId || parsed?.relayOn === undefined || parsed?.relayOn === null) {
    return null;
  }

  const device = await getDevice({ device_id: deviceId, is_active: true });
  if (!device) {
    logger.info(`Relay event skipped: device not mapped for ${deviceId}`);
    return null;
  }

  try {
    let deviceState = await getDeviceState({ device_id: device.id });
    if (!deviceState) {
      deviceState = await createDeviceState({ device_id: device.id });
    }

    await updateDeviceState(deviceState, {
      relay_status: parsed.relayOn,
      last_heartbeat_at: new Date(),
      updated_at: new Date()
    });

    // Log a synthetic device_commands entry so the command history is complete
    await createDeviceCommand({
      device_id: device.id,
      device_string_id: deviceId,
      command: parsed.relayOn ? 'RELAY,1' : 'RELAY,0',
      status: 'acknowledged',
      server_flag: null,
      serial: null,
      response: parsed.alarm?.alarmName || (parsed.relayOn ? 'armed' : 'disarmed'),
      sent_at: new Date(),
      acked_at: new Date(),
      error: null
    });

    logger.info(`Relay event (SMS): deviceId=${deviceId} relay_on=${parsed.relayOn} alarm=${parsed.alarm?.alarmName}`);
    return parsed.relayOn;
  } catch (error) {
    logger.error(`Failed to handle relay event for ${deviceId}: ${error.message}`);
    return null;
  }
};

/**
 * Handle a GT06 command response (protocol 0x17).
 * Matches the response back to a pending `device_commands` row via server_flag.
 * Also detects relay state from the response content and updates device_state.
 */
export const handleCommandResponse = async ({ deviceId, parsed }) => {
  const { serverFlag, content } = parsed?.commandResponse || {};
  if (!deviceId || !serverFlag) {
    return null;
  }
  try {
    const record = await acknowledgeDeviceCommandByFlag(deviceId, serverFlag, content || '');
    if (record) {
      logger.info(`Command ack: deviceId=${deviceId} flag=${serverFlag} response="${content}"`);
    } else {
      logger.info(`Command ack: no pending command found for deviceId=${deviceId} flag=${serverFlag}`);
    }

    // Detect relay state from the response text and sync device_state
    if (content) {
      const lower = content.toLowerCase();
      const isRelayOn = RELAY_ON_RESPONSES.some(r => lower.includes(r));
      const isRelayOff = RELAY_OFF_RESPONSES.some(r => lower.includes(r));

      if (isRelayOn || isRelayOff) {
        const device = await getDevice({ device_id: deviceId, is_active: true });
        if (device) {
          let deviceState = await getDeviceState({ device_id: device.id });
          if (!deviceState) {
            deviceState = await createDeviceState({ device_id: device.id });
          }
          await updateDeviceState(deviceState, {
            relay_status: isRelayOn,
            updated_at: new Date()
          });
          logger.info(`Relay state updated from 0x17 response: deviceId=${deviceId} relay_on=${isRelayOn}`);
        }
      }
    }

    return record;
  } catch (error) {
    logger.error(`Failed to ack command for ${deviceId}: ${error.message}`);
    return null;
  }
};

/**
 * Handle the deviceStatus block from a 0x24 status-extended packet.
 * Updates relay_status, ignition, battery and signal in device_state.
 * Also creates a device_commands entry if the status confirms a relay change.
 */
export const handleDeviceStatus = async ({ deviceId, parsed }) => {
  const status = parsed?.deviceStatus;
  if (!deviceId || !status) return null;

  const device = await getDevice({ device_id: deviceId, is_active: true });
  if (!device) return null;

  try {
    let deviceState = await getDeviceState({ device_id: device.id });
    if (!deviceState) deviceState = await createDeviceState({ device_id: device.id });

    const updates = { updated_at: new Date() };

    if (status.relayOn !== null && status.relayOn !== undefined) {
      updates.relay_status = status.relayOn;
    }
    if (status.terminalInfoDecoded?.ignitionOn !== undefined) {
      updates.ignition = status.terminalInfoDecoded.ignitionOn;
    }

    await updateDeviceState(deviceState, updates);

    // If relay state is conclusive, log it in device_commands
    if (status.relayOn !== null && status.relayOn !== undefined) {
      await createDeviceCommand({
        device_id: device.id,
        device_string_id: deviceId,
        command: status.relayOn ? 'RELAY,1' : 'RELAY,0',
        status: 'acknowledged',
        server_flag: null,
        serial: null,
        response: `0x24_status: ${status.alarmName || 'unknown'}`,
        sent_at: new Date(),
        acked_at: new Date()
      });
    }

    logger.info(`0x24 status: deviceId=${deviceId} relay=${status.relayOn} ignition=${status.terminalInfoDecoded?.ignitionOn} alarm=${status.alarmName}`);
    return updates;
  } catch (error) {
    logger.error(`handleDeviceStatus failed for ${deviceId}: ${error.message}`);
    return null;
  }
};

/**
 * Handle a 0x94 / type 0x0A LBS report (cell tower data without GPS fix).
 * Stores the cell tower list in device_state.metadata for later geolocation lookup.
 */
export const handleLbsReport = async ({ deviceId, parsed }) => {
  const cellTowers = parsed?.cellTowers;
  if (!deviceId || !cellTowers?.length) return null;

  const device = await getDevice({ device_id: deviceId, is_active: true });
  if (!device) return null;

  try {
    let deviceState = await getDeviceState({ device_id: device.id });
    if (!deviceState) deviceState = await createDeviceState({ device_id: device.id });

    const validTowers = cellTowers.filter(t => t.plmnValid);
    await updateDeviceState(deviceState, {
      metadata: {
        ...(deviceState.metadata || {}),
        lbs: {
          cellTowers,
          validTowers,
          primaryCarrier: validTowers[0]?.carrier || null,
          reportedAt: new Date().toISOString()
        }
      },
      updated_at: new Date()
    });

    const summary = validTowers
      .map(t => `${t.carrier || `MCC${t.mcc}/MNC${t.mnc}`} LAC=${t.lac} CID=${t.cellId}`)
      .join(' | ');
    logger.info(`LBS report: deviceId=${deviceId} towers=${cellTowers.length} valid=${validTowers.length} ${summary}`);
    return cellTowers;
  } catch (error) {
    logger.error(`handleLbsReport failed for ${deviceId}: ${error.message}`);
    return null;
  }
};
