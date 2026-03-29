import net from 'net';
import logger from '../config/logger';
import { parseGpsPayload } from './gpsPayloadParser';
import { publishGpsToMqtt } from './mqttGpsListener';

const toBoolean = value => {
  if (value === undefined || value === null) {
    return false;
  }
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const readDelimitedMessages = buffer => {
  const messages = [];
  let rest = Buffer.isBuffer(buffer) ? buffer : Buffer.from(String(buffer || ''), 'utf8');

  while (rest.length > 0) {
    if (rest.length >= 3 && rest[0] === 0x78 && rest[1] === 0x78) {
      const packetLength = rest[2] + 5;
      if (rest.length < packetLength) {
        break;
      }
      messages.push(rest.subarray(0, packetLength));
      rest = rest.subarray(packetLength);
      continue;
    }

    if (rest.length >= 4 && rest[0] === 0x79 && rest[1] === 0x79) {
      const packetLength = rest.readUInt16BE(2) + 6;
      if (rest.length < packetLength) {
        break;
      }
      messages.push(rest.subarray(0, packetLength));
      rest = rest.subarray(packetLength);
      continue;
    }

    const hashIndex = rest.indexOf(0x23); // '#'
    const newLineIndex = rest.indexOf(0x0a); // '\n'

    if (hashIndex === -1 && newLineIndex === -1) {
      break;
    }

    let delimiterIndex = -1;
    let includeHash = false;
    if (hashIndex !== -1 && (newLineIndex === -1 || hashIndex < newLineIndex)) {
      delimiterIndex = hashIndex;
      includeHash = true;
    } else {
      delimiterIndex = newLineIndex;
    }

    const message = includeHash
      ? rest.subarray(0, delimiterIndex + 1)
      : rest.subarray(0, delimiterIndex);

    if (message.length) {
      messages.push(message);
    }

    rest = rest.subarray(delimiterIndex + 1);
  }

  return { messages, rest };
};

const inferDeviceId = (parsed, rawMessage, socket) => {
  if (socket?._gpsDeviceId) {
    return socket._gpsDeviceId;
  }
  if (parsed?.imei) {
    return String(parsed.imei);
  }
  if (parsed?.data?.device_id) {
    return String(parsed.data.device_id);
  }
  if (parsed?.data?.imei) {
    return String(parsed.data.imei);
  }

  // Common tracker frames often include 15-digit IMEI.
  const imeiMatch = String(rawMessage).match(/\b\d{15}\b/);
  if (imeiMatch && imeiMatch[0]) {
    return imeiMatch[0];
  }

  const remoteAddress = (socket.remoteAddress || 'unknown').replace(/[:.]/g, '_');
  const remotePort = socket.remotePort || '0';
  return `tcp_${remoteAddress}_${remotePort}`;
};

const getBridgeTopic = deviceId => {
  const prefix = process.env.GPS_MQTT_BRIDGE_TOPIC_PREFIX || 'gps/bridge';
  return `${prefix}/${deviceId}/data`;
};

class GpsTcpListener {
  constructor() {
    this.server = null;
    this.started = false;
  }

  start() {
    if (this.started) {
      return;
    }

    if (!toBoolean(process.env.GPS_TCP_ENABLED)) {
      logger.info('GPS TCP listener is disabled. Set GPS_TCP_ENABLED=true to enable.');
      return;
    }

    const host = process.env.GPS_TCP_HOST || '0.0.0.0';
    const port = Number(process.env.GPS_TCP_PORT || 5023);

    this.server = net.createServer(socket => {
      const remote = `${socket.remoteAddress}:${socket.remotePort}`;
      socket._gpsBuffer = Buffer.alloc(0);

      logger.info(`GPS TCP client connected: ${remote}`);

      socket.on('data', chunk => {
        try {
          socket._gpsBuffer = Buffer.concat([socket._gpsBuffer || Buffer.alloc(0), chunk]);

          // Safety guard for malformed noisy streams.
          if (socket._gpsBuffer.length > 65535) {
            socket._gpsBuffer = socket._gpsBuffer.subarray(socket._gpsBuffer.length - 32768);
          }

          const { messages, rest } = readDelimitedMessages(socket._gpsBuffer);
          socket._gpsBuffer = rest;

          messages.forEach(rawMessage => {
            const parsed = parseGpsPayload(rawMessage);
            if (parsed?.imei) {
              socket._gpsDeviceId = String(parsed.imei);
            }
            const deviceId = inferDeviceId(parsed, rawMessage, socket);
            const rawPayload = Buffer.isBuffer(rawMessage)
              ? rawMessage.toString('hex')
              : String(rawMessage);
            const event = {
              transport: 'tcp',
              deviceId,
              remoteAddress: socket.remoteAddress || null,
              remotePort: socket.remotePort || null,
              receivedAt: new Date().toISOString(),
              raw: rawPayload,
              rawEncoding: Buffer.isBuffer(rawMessage) ? 'hex' : 'utf8',
              parsed
            };

            if (parsed.type === 'gps_fix') {
              logger.info(`GPS TCP FIX ${JSON.stringify(event)}`);
            } else {
              logger.info(`GPS TCP MSG ${JSON.stringify(event)}`);
            }

            const bridgeTopic = getBridgeTopic(deviceId);
            publishGpsToMqtt(bridgeTopic, event);

            if (parsed?.ackHex) {
              socket.write(Buffer.from(parsed.ackHex, 'hex'));
              logger.info(`GPS TCP ACK sent (${parsed.protocol || parsed.type}) to ${remote}`);
            }
          });
        } catch (err) {
          logger.error(`GPS TCP parse error: ${err.message}`);
        }
      });

      socket.on('error', err => {
        logger.error(`GPS TCP socket error (${remote}): ${err.message}`);
      });

      socket.on('close', () => {
        logger.info(`GPS TCP client disconnected: ${remote}`);
      });
    });

    this.server.on('error', err => {
      logger.error(`GPS TCP server error: ${err.message}`);
    });

    this.server.listen(port, host, () => {
      this.started = true;
      logger.info(`GPS TCP listening on ${host}:${port}`);
    });
  }

  stop() {
    if (!this.server) {
      return;
    }

    this.server.close(() => {
      logger.info('GPS TCP listener stopped.');
    });

    this.server = null;
    this.started = false;
  }
}

const gpsTcpListener = new GpsTcpListener();

export const startGpsTcpListener = () => gpsTcpListener.start();
export const stopGpsTcpListener = () => gpsTcpListener.stop();

