import logger from '../config/logger';
import { MESSAGE_CONSTANTS, NOT_FOUND, SERVER_ERROR, FORBIDDEN, UN_PROCESSABLE_ENTITY, OFFSET, PAGE_LIMIT, EVENT } from '../constants';
import {
  COMMAND_ALIASES,
  COMMAND_STATUS,
  RAW_COMMANDS,
  RELAY_ON_RESPONSES,
  RELAY_OFF_RESPONSES
} from '../constants/deviceCommand';
import { getDevice } from '../dao/deviceDao';
import { createDeviceCommand, getDeviceCommandList, updateDeviceCommand, getDeviceCommand, getLastAcknowledgedRelayCommand } from '../dao/deviceCommandDao';
import { buildGt06CommandPacket } from '../gps/gpsPayloadParser';
import { getSocket } from '../gps/socketRegistry';
import { waitForCommandReply } from '../gps/commandAckWaiter';
import { CustomError } from '../utils';
import { createDeviceState, createEvent, getDeviceAssetMap, getDeviceState, updateDeviceState } from '../dao';

// Auto-incrementing serial counter (wraps at 65535)
let _serialCounter = 0;
const nextSerial = () => {
  _serialCounter = (_serialCounter + 1) & 0xffff;
  return _serialCounter;
};

const withHash = ascii => {
  const value = String(ascii || '').trim();
  if (!value) return value;
  return value.endsWith('#') ? value : `${value}#`;
};

/**
 * Resolve API command / type-code to GT06 ASCII content (with trailing #).
 *
 * Accepts:
 *   RELAY_ON | relay_on | RELAY,1 | RELAY,1#  →  RELAY,1#
 *   RELAY_OFF | relay_off | RELAY,0 | RELAY,0# → RELAY,0#
 *
 * GT06 relay semantics:
 *   RELAY,1# → Activate relay → Engine CUT
 *   RELAY,0# → Deactivate relay → Engine RESTORED
 */
const resolveCommand = command => {
  const raw = String(command || '').trim();
  if (!raw) return '';

  const normalized = raw.replace(/#$/, '').trim();
  const upper = normalized.toUpperCase();
  const lower = normalized.toLowerCase();

  const typeCodeMap = {
    RELAY_ON: RAW_COMMANDS.RELAY_ON,
    RELAY_OFF: RAW_COMMANDS.RELAY_OFF,
    RELAY1: RAW_COMMANDS.RELAY_ON,
    RELAY0: RAW_COMMANDS.RELAY_OFF,
    'RELAY,1': RAW_COMMANDS.RELAY_ON,
    'RELAY,0': RAW_COMMANDS.RELAY_OFF,
    CHECK: RAW_COMMANDS.CHECK,
    PARAM: RAW_COMMANDS.PARAM,
    STATUS: RAW_COMMANDS.STATUS,
    WHERE: RAW_COMMANDS.WHERE,
    RESET: RAW_COMMANDS.RESET,
    TIME: RAW_COMMANDS.TIME_SYNC,
    TIME_SYNC: RAW_COMMANDS.TIME_SYNC,
    ALERT_ON: RAW_COMMANDS.ALERT_ON,
    ALERT_OFF: RAW_COMMANDS.ALERT_OFF,
    [COMMAND_ALIASES.RELAY_ON.toUpperCase()]: RAW_COMMANDS.RELAY_ON,
    [COMMAND_ALIASES.RELAY_OFF.toUpperCase()]: RAW_COMMANDS.RELAY_OFF,
    [COMMAND_ALIASES.STATUS.toUpperCase()]: RAW_COMMANDS.STATUS,
    [COMMAND_ALIASES.PARAM.toUpperCase()]: RAW_COMMANDS.PARAM
  };

  if (typeCodeMap[upper]) return typeCodeMap[upper];
  if (typeCodeMap[lower.toUpperCase()]) return typeCodeMap[lower.toUpperCase()];

  // Pass-through custom ASCII (ensure trailing # for GT06)
  return withHash(normalized);
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
export const sendDeviceCommand = async ({ id, command, userId }) => {
  if (!id || !command) {
    throw new CustomError(UN_PROCESSABLE_ENTITY, 'deviceId and command are required.');
  }

  const device = await getDevice({ id, is_active: true });
  if (!device) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.DEVICE_NOT_FOUND);
  }
  if (userId && device.owner_id !== userId) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ACCESS_DENIED);
  }

  const deviceStringId = device.device_id;
  const resolvedCommand = resolveCommand(command);
  if (!resolvedCommand) {
    throw new CustomError(UN_PROCESSABLE_ENTITY, 'Invalid command. Use type codes like RELAY_ON / RELAY_OFF.');
  }

  const serial = nextSerial() || 1;
  const sentAt = new Date();
  const { buffer: packetBuffer, hex: packetHex, serverFlagHex } = buildGt06CommandPacket(
    resolvedCommand,
    serial
  );

  // Log as PENDING before touching the socket
  const record = await createDeviceCommand({
    device_id: id,
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

  const socketRemote = `${socket.remoteAddress || '?'}:${socket.remotePort || '?'}`;

  // Register ACK waiter BEFORE write so a fast 0x17 on the same socket is not missed.
  // tcpGpsListener parses the reply and resolves this waiter (ack handled here only).
  const replyPromise = waitForCommandReply(deviceStringId, serverFlagHex, 8000);

  try {
    await new Promise((resolve, reject) => {
      socket.write(packetBuffer, err => (err ? reject(err) : resolve()));
    });

    await updateDeviceCommand(record, { status: COMMAND_STATUS.SENT, sent_at: sentAt });

    logger.info(
      `GT06 command SENT on socket → device=${deviceStringId} remote=${socketRemote} ` +
        `cmd=${resolvedCommand} serial=${serial} flag=${serverFlagHex} hex=${packetHex}`
    );

    // Await device 0x17 reply from the same TCP socket (via commandAckWaiter)
    const reply = await replyPromise;
    const ackedAt = new Date();

    if (!reply) {
      logger.warn(
        `GT06 command NO REPLY → id=${record.id} device=${deviceStringId} flag=${serverFlagHex} (still status=sent)`
      );
      return {
        message: MESSAGE_CONSTANTS.SUCCESS,
        data: {
          id: record.id,
          device_id: id,
          device_string_id: deviceStringId,
          command: resolvedCommand,
          status: COMMAND_STATUS.SENT,
          response: null,
          acked_at: null,
          replied_on_same_socket: false,
          serial,
          server_flag: serverFlagHex,
          packet_hex: packetHex,
          socket_remote: socketRemote,
          sent_at: sentAt
        }
      };
    }

    const responseText = reply.content || reply.raw || '';
    await updateDeviceCommand(record, {
      status: COMMAND_STATUS.ACKNOWLEDGED,
      response: responseText,
      acked_at: ackedAt
    });

    // Apply relay + event only after real device ACK (from this send path)
    const isRelayOnCmd = resolvedCommand === RAW_COMMANDS.RELAY_ON;
    const isRelayOffCmd = resolvedCommand === RAW_COMMANDS.RELAY_OFF;
    const lower = String(responseText).toLowerCase();
    const responseSaysOn = RELAY_ON_RESPONSES.some(r => lower.includes(r));
    const responseSaysOff = RELAY_OFF_RESPONSES.some(r => lower.includes(r));
    const relayStatus =
      responseSaysOn ? true : responseSaysOff ? false : isRelayOnCmd ? true : isRelayOffCmd ? false : null;

    if (relayStatus !== null) {
      let deviceState = await getDeviceState({ device_id: id });
      if (!deviceState) {
        deviceState = await createDeviceState({ device_id: id });
      }
      await updateDeviceState(deviceState, {
        relay_status: relayStatus,
        updated_at: ackedAt
      });

      const deviceAssetMap = await getDeviceAssetMap({ device_id: id }, ['asset_id']);
      const assetId = deviceAssetMap?.asset_id || null;
      if (assetId) {
        await createEvent({
          user_id: device.owner_id,
          device_id: id,
          asset_id: assetId,
          type: relayStatus ? EVENT.RELAY_ON : EVENT.RELAY_OFF,
          latitude: deviceState.latitude,
          longitude: deviceState.longitude,
          metadata: {
            source: 'command_ack',
            command: resolvedCommand,
            response: responseText
          },
          event_at: ackedAt
        });
      }
    }

    logger.info(
      `GT06 command ACKED here → id=${record.id} device=${deviceStringId} ` +
        `response="${responseText}"`
    );

    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: {
        id: record.id,
        device_id: id,
        device_string_id: deviceStringId,
        command: resolvedCommand,
        status: COMMAND_STATUS.ACKNOWLEDGED,
        response: responseText,
        acked_at: ackedAt,
        replied_on_same_socket: true,
        serial,
        server_flag: serverFlagHex,
        packet_hex: packetHex,
        socket_remote: socketRemote,
        sent_at: sentAt
      }
    };
  } catch (err) {
    await updateDeviceCommand(record, { status: COMMAND_STATUS.FAILED, sent_at: sentAt, error: err.message });
    throw new CustomError(SERVER_ERROR, `Failed to send command: ${err.message}`);
  }
};

// export const listDeviceCommands = async ({ deviceDbId, page, limit }) => {
//   const p = +page || OFFSET;
//   const l = +limit || PAGE_LIMIT;
//   try {
//     const list = await getDeviceCommandList({ device_id: deviceDbId }, p, l);
//     return {
//       message: MESSAGE_CONSTANTS.SUCCESS,
//       data: {
//         list: list.rows,
//         totalPages: Math.ceil(list.count / l),
//         currentPage: p,
//         totalCount: list.count
//       }
//     };
//   } catch (err) {
//     throw new CustomError(SERVER_ERROR, err.message);
//   }
// };

// /**
//  * Called when your app sends a RELAY command via SMS (not TCP).
//  * Logs the intent immediately so GET /relay-status reflects it before
//  * any 0x16 alarm or 0x24 status packet arrives from the device.
//  */
// export const logSmsRelay = async ({ deviceDbId, deviceStringId, relayOn, note, userId }) => {
//   if (typeof relayOn !== 'boolean') {
//     throw new CustomError(UN_PROCESSABLE_ENTITY, 'relay_on must be a boolean (true = cut engine, false = restore).');
//   }

//   const device = await getDevice({ id: deviceDbId, is_active: true });
//   if (!device) throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.DEVICE_NOT_FOUND);
//   if (userId && device.owner_id !== userId) throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ACCESS_DENIED);

//   const command = relayOn ? RAW_COMMANDS.RELAY_ON : RAW_COMMANDS.RELAY_OFF;
//   const record = await createDeviceCommand({
//     device_id: deviceDbId,
//     device_string_id: deviceStringId || device.device_id,
//     command,
//     status: COMMAND_STATUS.SENT,
//     server_flag: null,
//     serial: null,
//     response: note || 'sent_via_sms',
//     sent_at: new Date()
//   });

//   logger.info(`SMS relay logged: device=${deviceStringId} relay_on=${relayOn}`);

//   return {
//     message: MESSAGE_CONSTANTS.SUCCESS,
//     data: { id: record.id, command, relay_on: relayOn, status: COMMAND_STATUS.SENT, note: note || null }
//   };
// };

// export const getDeviceCommandDetail = async ({ commandId, deviceDbId }) => {
//   const record = await getDeviceCommand({ id: commandId, device_id: deviceDbId });
//   if (!record) throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
//   return { message: MESSAGE_CONSTANTS.SUCCESS, data: record };
// };

// /**
//  * Returns the relay state based on the last *acknowledged* RELAY command.
//  * This is more reliable than the heartbeat terminalInfo armed-bit because
//  * many GT06 clones do not reflect the relay output in heartbeats.
//  *
//  * relay_on: true  → last acked command was RELAY,1 (engine cut)
//  * relay_on: false → last acked command was RELAY,0 (engine restored)
//  * relay_on: null  → no acknowledged relay command on record yet
//  */
// export const getRelayStatus = async ({ deviceDbId, deviceStringId }) => {
//   const record = await getLastAcknowledgedRelayCommand(deviceStringId);
//   const cmd = String(record?.command || '').replace(/#$/, '');
//   const relayOn = record ? cmd === 'RELAY,1' : null;
//   return {
//     message: MESSAGE_CONSTANTS.SUCCESS,
//     data: {
//       relay_on: relayOn,
//       source: record ? 'last_acked_command' : 'no_data',
//       command: record?.command ?? null,
//       acked_at: record?.acked_at ?? null,
//       response: record?.response ?? null
//     }
//   };
// };
