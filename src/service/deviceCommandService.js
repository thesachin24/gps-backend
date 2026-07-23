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
 * Resolve friendly alias (e.g. "relay_on") to the raw GT06 ASCII command string.
 */
const resolveCommand = command => {
  const aliasMap = {
    [COMMAND_ALIASES.RELAY_ON]: 'RELAY,1',
    [COMMAND_ALIASES.RELAY_OFF]: 'RELAY,0',
    relay1: 'RELAY,1',
    relay0: 'RELAY,0'
  };
  return aliasMap[String(command).toLowerCase()] || String(command).trim();
};

// export const sendDeviceCommand = async ({ deviceDbId, deviceStringId, command, userId }) => {
//   if (!deviceStringId || !command) {
//     throw new CustomError(UN_PROCESSABLE_ENTITY, 'deviceStringId and command are required.');
//   }

//   const resolvedCommand = resolveCommand(command);
//   console.log('command', command);
//   console.log('resolvedCommand', resolvedCommand);

//   // Look up device in DB for ownership checks
//   const device = await getDevice({ id: deviceDbId, is_active: true });
//   if (!device) {
//     throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.DEVICE_NOT_FOUND);
//   }
//   if (userId && device.owner_id !== userId) {
//     throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ACCESS_DENIED);
//   }

//   const serial = nextSerial();
//   const { hex: packetHex, serverFlagHex } = buildGt06CommandPacket(resolvedCommand, serial);
//   console.log('packetHex', packetHex);
//   console.log('serverFlagHex', serverFlagHex);
//   // Create command log first (status = pending)
//   const record = await createDeviceCommand({
//     device_id: deviceDbId,
//     device_string_id: deviceStringId,
//     command: resolvedCommand,
//     status: COMMAND_STATUS.PENDING,
//     server_flag: serverFlagHex,
//     serial
//   });

//   // Try to dispatch over active TCP socket
//   const socket = getSocket(deviceStringId);
//   if (!socket) {
//     await updateDeviceCommand(record, {
//       status: COMMAND_STATUS.FAILED,
//       error: 'Device is offline. No active TCP connection.',
//       sent_at: new Date()
//     });
//     throw new CustomError(503, `Device ${deviceStringId} is currently offline.`);
//   }

//   try {
//     await new Promise((resolve, reject) => {
//       socket.write(Buffer.from(packetHex, 'hex'), err => (err ? reject(err) : resolve()));
//     });
//     await updateDeviceCommand(record, {
//       status: COMMAND_STATUS.SENT,
//       sent_at: new Date()
//     });
//     logger.info(`Command sent to ${deviceStringId}: ${resolvedCommand} (serial=${serial}, flag=${serverFlagHex})`);
//   } catch (err) {
//     await updateDeviceCommand(record, {
//       status: COMMAND_STATUS.FAILED,
//       error: err.message,
//       sent_at: new Date()
//     });
//     throw new CustomError(SERVER_ERROR, `Failed to send command: ${err.message}`);
//   }

//   return {
//     message: MESSAGE_CONSTANTS.SUCCESS,
//     data: {
//       id: record.id,
//       command: resolvedCommand,
//       status: 'sent',
//       server_flag: serverFlagHex,
//       serial,
//       sent_at: record.sent_at || new Date()
//     }
//   };
// };


export const sendDeviceCommand = async ({ deviceDbId, command, userId }) => {
  if (!deviceDbId || !command) {
    throw new CustomError(
      UN_PROCESSABLE_ENTITY,
      'deviceId and command are required.'
    );
  }

  // Get device
  const device = await getDevice({
    id: deviceDbId,
    is_active: true
  });

  if (!device) {
    throw new CustomError(
      NOT_FOUND,
      MESSAGE_CONSTANTS.DEVICE_NOT_FOUND
    );
  }

  // Ownership check
  if (userId && device.owner_id !== userId) {
    throw new CustomError(
      FORBIDDEN,
      MESSAGE_CONSTANTS.ACCESS_DENIED
    );
  }

  // Always use device identifier from DB
  const deviceStringId = device.device_id;

  // Resolve GT06 command
  const resolvedCommand = resolveCommand(command);

  const serial = nextSerial();
  const sentAt = new Date();

  const {
    hex: packetHex,
    serverFlagHex
  } = buildGt06CommandPacket(resolvedCommand, serial);

  // Create pending command
  const record = await createDeviceCommand({
    device_id: device.id,
    device_string_id: deviceStringId,
    command: resolvedCommand,
    status: COMMAND_STATUS.PENDING,
    server_flag: serverFlagHex,
    serial
  });

  // Get active socket
  const socket = getSocket(deviceStringId);

  if (!socket || socket.destroyed || !socket.writable) {
    await updateDeviceCommand(record, {
      status: COMMAND_STATUS.FAILED,
      sent_at: sentAt,
      error: 'Device is offline.'
    });

    throw new CustomError(
      503,
      `Device ${deviceStringId} is currently offline.`
    );
  }

  try {
    await new Promise((resolve, reject) => {
      socket.write(
        Buffer.from(packetHex, 'hex'),
        err => (err ? reject(err) : resolve())
      );
    });

    await updateDeviceCommand(record, {
      status: COMMAND_STATUS.SENT,
      sent_at: sentAt
    });

    logger.info(
      `GT06 command sent. device=${deviceStringId}, command=${resolvedCommand}, serial=${serial}`
    );

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
    await updateDeviceCommand(record, {
      status: COMMAND_STATUS.FAILED,
      sent_at: sentAt,
      error: err.message
    });

    throw new CustomError(
      SERVER_ERROR,
      `Failed to send command: ${err.message}`
    );
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
 * Called when your app sends RELAY via SMS.
 * Logs the intent immediately (status = sent) and records the relay state
 * in device_state so GET /relay-status reflects it before the 0x16 alarm arrives.
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
    device_string_id: deviceStringId,
    command,
    status: COMMAND_STATUS.SENT,
    server_flag: null,
    serial: null,
    response: note || 'sent_via_sms',
    sent_at: new Date()
  });

  logger.info(`SMS relay logged: deviceId=${deviceStringId} relay_on=${relayOn}`);

  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data: {
      id: record.id,
      command,
      relay_on: relayOn,
      status: COMMAND_STATUS.SENT,
      note: note || null
    }
  };
};

export const getDeviceCommandDetail = async ({ commandId, deviceDbId }) => {
  const record = await getDeviceCommand({ id: commandId, device_id: deviceDbId });
  if (!record) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  return { message: MESSAGE_CONSTANTS.SUCCESS, data: record };
};

/**
 * Derive the relay state from the last acknowledged RELAY command.
 * More reliable than reading the heartbeat terminalInfo `armed` bit because
 * most GT06 devices don't reflect the relay output state in heartbeats.
 *
 * Returns:
 *   { relay_on: true }  — last acked command was RELAY,1
 *   { relay_on: false } — last acked command was RELAY,0
 *   { relay_on: null }  — no acknowledged relay command on record
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
