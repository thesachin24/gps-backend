import logger from '../config/logger';
import { MESSAGE_CONSTANTS, NOT_FOUND, SERVER_ERROR, FORBIDDEN, UN_PROCESSABLE_ENTITY, OFFSET, PAGE_LIMIT } from '../constants';
import { COMMAND_ALIASES, COMMAND_STATUS } from '../constants/deviceCommand';
import { getDevice } from '../dao/deviceDao';
import { createDeviceCommand, getDeviceCommandList, updateDeviceCommand, getDeviceCommand, getLastAcknowledgedRelayCommand } from '../dao/deviceCommandDao';
import { buildGt06CommandPacket } from '../gps/gpsPayloadParser';
import { getSocket } from '../gps/socketRegistry';
import { CustomError } from '../utils';

// Auto-incrementing serial counter (wraps at 65535)
let _serialCounter = 0;
const nextSerial = () => {
  _serialCounter = (_serialCounter + 1) & 0xffff;
  return _serialCounter;
};

/**
 * Resolve a friendly command alias to the raw GT06 ASCII command string.
 *
 * GT06 relay semantics (standard engine-cut wiring):
 *   RELAY,1  →  Activate relay   →  Engine CUT      (scooter immobilised)
 *   RELAY,0  →  Deactivate relay  →  Engine RESTORED (scooter can move)
 */
const resolveCommand = command => {
  const aliasMap = {
    [COMMAND_ALIASES.RELAY_ON]:  'RELAY,1',  // cut engine
    [COMMAND_ALIASES.RELAY_OFF]: 'RELAY,0',  // restore engine
    relay1: 'RELAY,1',
    relay0: 'RELAY,0'
  };
  return aliasMap[String(command).toLowerCase()] || String(command).trim();
};

/**
 * Send a GT06 command to a device over its active TCP socket.
 *
 * Flow:
 *   1. Validate + resolve the command alias
 *   2. Look up the device (ownership check)
 *   3. Build the 0x80 GT06 binary packet
 *   4. Log the command as PENDING in device_commands
 *   5. Write the packet to the device's live TCP socket
 *   6. Mark the command SENT (or FAILED on error)
 *
 * The device will reply with a 0x17 ACK packet that handleCommandResponse
 * picks up and marks the record as ACKNOWLEDGED.
 */
export const sendDeviceCommand = async ({ deviceDbId, command, userId }) => {
  if (!deviceDbId || !command) {
    throw new CustomError(UN_PROCESSABLE_ENTITY, 'deviceId and command are required.');
  }

  const device = await getDevice({ id: deviceDbId, is_active: true });
  if (!device) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.DEVICE_NOT_FOUND);
  }
  if (userId && device.owner_id !== userId) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ACCESS_DENIED);
  }

  const deviceStringId = device.device_id;
  const resolvedCommand = resolveCommand(command);
  const serial = nextSerial();
  const sentAt = new Date();

  const { hex: packetHex, serverFlagHex } = buildGt06CommandPacket(resolvedCommand, serial);

  // Log as PENDING before touching the socket
  const record = await createDeviceCommand({
    device_id: device.id,
    device_string_id: deviceStringId,
    command: resolvedCommand,
    status: COMMAND_STATUS.PENDING,
    server_flag: serverFlagHex,
    serial
  });

  // Check that the device is online
  const socket = getSocket(deviceStringId);
  if (!socket || socket.destroyed || !socket.writable) {
    await updateDeviceCommand(record, {
      status: COMMAND_STATUS.FAILED,
      sent_at: sentAt,
      error: 'Device is offline.'
    });
    throw new CustomError(503, `Device ${deviceStringId} is currently offline.`);
  }

  // Write to the TCP socket (one-way; device ACKs separately via 0x17)
  try {
    await new Promise((resolve, reject) => {
      socket.write(Buffer.from(packetHex, 'hex'), err => (err ? reject(err) : resolve()));
    });

    await updateDeviceCommand(record, { status: COMMAND_STATUS.SENT, sent_at: sentAt });

    logger.info(`GT06 command sent → device=${deviceStringId} cmd=${resolvedCommand} serial=${serial} flag=${serverFlagHex}`);

    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: {
        id: record.id,
        device_id: device.id,
        device_string_id: deviceStringId,
        command: resolvedCommand,
        status: COMMAND_STATUS.SENT,
        serial,
        server_flag: serverFlagHex,
        sent_at: sentAt
      }
    };
  } catch (err) {
    await updateDeviceCommand(record, { status: COMMAND_STATUS.FAILED, sent_at: sentAt, error: err.message });
    throw new CustomError(SERVER_ERROR, `Failed to send command: ${err.message}`);
  }
};

export const listDeviceCommands = async ({ deviceDbId, page, limit }) => {
  const p = +page || OFFSET;
  const l = +limit || PAGE_LIMIT;
  try {
    const list = await getDeviceCommandList({ device_id: deviceDbId }, p, l);
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: {
        list: list.rows,
        totalPages: Math.ceil(list.count / l),
        currentPage: p,
        totalCount: list.count
      }
    };
  } catch (err) {
    throw new CustomError(SERVER_ERROR, err.message);
  }
};

/**
 * Called when your app sends a RELAY command via SMS (not TCP).
 * Logs the intent immediately so GET /relay-status reflects it before
 * any 0x16 alarm or 0x24 status packet arrives from the device.
 */
export const logSmsRelay = async ({ deviceDbId, deviceStringId, relayOn, note, userId }) => {
  if (typeof relayOn !== 'boolean') {
    throw new CustomError(UN_PROCESSABLE_ENTITY, 'relay_on must be a boolean (true = cut engine, false = restore).');
  }

  const device = await getDevice({ id: deviceDbId, is_active: true });
  if (!device) throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.DEVICE_NOT_FOUND);
  if (userId && device.owner_id !== userId) throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ACCESS_DENIED);

  const command = relayOn ? 'RELAY,1' : 'RELAY,0';
  const record = await createDeviceCommand({
    device_id: deviceDbId,
    device_string_id: deviceStringId || device.device_id,
    command,
    status: COMMAND_STATUS.SENT,
    server_flag: null,
    serial: null,
    response: note || 'sent_via_sms',
    sent_at: new Date()
  });

  logger.info(`SMS relay logged: device=${deviceStringId} relay_on=${relayOn}`);

  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data: { id: record.id, command, relay_on: relayOn, status: COMMAND_STATUS.SENT, note: note || null }
  };
};

export const getDeviceCommandDetail = async ({ commandId, deviceDbId }) => {
  const record = await getDeviceCommand({ id: commandId, device_id: deviceDbId });
  if (!record) throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  return { message: MESSAGE_CONSTANTS.SUCCESS, data: record };
};

/**
 * Returns the relay state based on the last *acknowledged* RELAY command.
 * This is more reliable than the heartbeat terminalInfo armed-bit because
 * many GT06 clones do not reflect the relay output in heartbeats.
 *
 * relay_on: true  → last acked command was RELAY,1 (engine cut)
 * relay_on: false → last acked command was RELAY,0 (engine restored)
 * relay_on: null  → no acknowledged relay command on record yet
 */
export const getRelayStatus = async ({ deviceDbId, deviceStringId }) => {
  const record = await getLastAcknowledgedRelayCommand(deviceStringId);
  const relayOn = record ? record.command === 'RELAY,1' : null;
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data: {
      relay_on: relayOn,
      source: record ? 'last_acked_command' : 'no_data',
      command: record?.command ?? null,
      acked_at: record?.acked_at ?? null,
      response: record?.response ?? null
    }
  };
};
