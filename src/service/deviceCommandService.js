import logger from '../config/logger';
import { MESSAGE_CONSTANTS, NOT_FOUND, SERVER_ERROR, FORBIDDEN, UN_PROCESSABLE_ENTITY, OFFSET, PAGE_LIMIT } from '../constants';
import { COMMAND_ALIASES, COMMAND_STATUS } from '../constants/deviceCommand';
import { getDevice } from '../dao/deviceDao';
import { createDeviceCommand, getDeviceCommandList, updateDeviceCommand, getDeviceCommand } from '../dao/deviceCommandDao';
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

export const sendDeviceCommand = async ({ deviceDbId, deviceStringId, command, userId }) => {
  if (!deviceStringId || !command) {
    throw new CustomError(UN_PROCESSABLE_ENTITY, 'deviceStringId and command are required.');
  }

  const resolvedCommand = resolveCommand(command);

  // Look up device in DB for ownership checks
  const device = await getDevice({ id: deviceDbId, is_active: true });
  if (!device) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.DEVICE_NOT_FOUND);
  }
  if (userId && device.owner_id !== userId) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ACCESS_DENIED);
  }

  const serial = nextSerial();
  const { hex: packetHex, serverFlagHex } = buildGt06CommandPacket(resolvedCommand, serial);

  // Create command log first (status = pending)
  const record = await createDeviceCommand({
    device_id: deviceDbId,
    device_string_id: deviceStringId,
    command: resolvedCommand,
    status: COMMAND_STATUS.PENDING,
    server_flag: serverFlagHex,
    serial
  });

  // Try to dispatch over active TCP socket
  const socket = getSocket(deviceStringId);
  if (!socket) {
    await updateDeviceCommand(record, {
      status: COMMAND_STATUS.FAILED,
      error: 'Device is offline. No active TCP connection.',
      sent_at: new Date()
    });
    throw new CustomError(503, `Device ${deviceStringId} is currently offline.`);
  }

  try {
    await new Promise((resolve, reject) => {
      socket.write(Buffer.from(packetHex, 'hex'), err => (err ? reject(err) : resolve()));
    });
    await updateDeviceCommand(record, {
      status: COMMAND_STATUS.SENT,
      sent_at: new Date()
    });
    logger.info(`Command sent to ${deviceStringId}: ${resolvedCommand} (serial=${serial}, flag=${serverFlagHex})`);
  } catch (err) {
    await updateDeviceCommand(record, {
      status: COMMAND_STATUS.FAILED,
      error: err.message,
      sent_at: new Date()
    });
    throw new CustomError(SERVER_ERROR, `Failed to send command: ${err.message}`);
  }

  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data: {
      id: record.id,
      command: resolvedCommand,
      status: 'sent',
      server_flag: serverFlagHex,
      serial,
      sent_at: record.sent_at || new Date()
    }
  };
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

export const getDeviceCommandDetail = async ({ commandId, deviceDbId }) => {
  const record = await getDeviceCommand({ id: commandId, device_id: deviceDbId });
  if (!record) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  return { message: MESSAGE_CONSTANTS.SUCCESS, data: record };
};
