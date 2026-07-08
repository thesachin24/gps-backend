import net from 'net';
import logger from '../config/logger';
import { parseGpsPayload } from './gpsPayloadParser';
import { publishGpsToMqtt } from './mqttGpsPublisher';
import { saveGpsLocation, saveHeartbeat, handleCommandResponse, handleRelayEvent, handleDeviceStatus, handleLbsReport } from './gpsIngestionService';
import { registerSocket, unregisterSocket } from './socketRegistry';
import { getDevice } from '../dao';
import axios from 'axios';

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

async function getLocationReverseGeocode(latitude, longitude) {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat: latitude,
          lon: longitude,
          format: "jsonv2",
          zoom: 18,
          addressdetails: 1,
          "accept-language": "en",
        },
        headers: {
          "User-Agent": "MyApp/1.0",
        },
      }
    );
    const data = response.data;
    console.log('LOCATION REVERSE GEOCODE:', data);
    return {
      location: data.address,
      address: data.display_name || null
    };
  } catch (error) {}
}

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

const getBridgeTopic = async (deviceId, channel) => {
  const device = await getDevice({ device_id: deviceId }, ['owner_id']);
  if (!device) {
    logger.error(`Device not found: ${deviceId}`);
    return `${process.env.NODE_ENV}/gps/v1/unknown/${deviceId}/${channel}`;
  }
  // <env>/<product>/<version>/<device_id>/<channel></channel>
  const TOPICS = {
    location: `${process.env.NODE_ENV}/gps/v1/${device.owner_id}/${deviceId}/location`,
    heartbeat: `${process.env.NODE_ENV}/gps/v1/${device.owner_id}/${deviceId}/heartbeat`,
    // info: `prod/gps/v1/${deviceId}/info`
  };
  // const prefix = process.env.GPS_MQTT_BRIDGE_TOPIC_PREFIX || 'gps/bridge';
  return TOPICS[channel];
  // const TOPIC = process.env.SIM_MQTT_TOPIC || process.env.GPS_SIM_TOPIC || `gps/${deviceId}/data`;
  // return `gps/delhi-sim-001/data`;
};

const buildBridgePayload = (deviceId, parsed, locationReverseGeocode) => ({
  device_id: deviceId,
  lat: parsed?.latitude ?? null,
  gps_fixed: parsed?.courseStatusFlags?.gpsFixed ?? null,
  lng: parsed?.longitude ?? null,
  address: locationReverseGeocode?.address ?? null,
  location: locationReverseGeocode?.location ?? null,
  speed: parsed?.speed ?? null,
  heading: parsed?.heading ?? null,
  last_location_at: parsed?.timestamp || new Date().toISOString(),
  source: parsed?.protocol || 'gps_lbs'
});

// {
//   "type":"gt06_packet",
//   "header":"7878",
//   "protocolNo":19,
//   "protocol":"heartbeat",
//   "packetLength":10,
//   "infoLength":5,
//   "infoHex":"44f0038002",
//   "serialNo":48,
//   "crc":{
//      "packet":22581,
//      "calculated":22581,
//      "valid":true
//   },
//   "rawHex":"78780a1344f0038002003058350d0a",
//   "packet":{
//      "startHex":"7878",
//      "lengthHex":"0a",
//      "protocolHex":"13",
//      "infoHex":"44f0038002",
//      "serialHex":"0030",
//      "crcHex":"5835",
//      "stopHex":"0d0a"
//   },
//   "heartbeat":{
//      "messageKind":"status_keepalive",
//      "terminalInfo":68,
//      "terminalInfoDecoded":{
//         "raw":68,
//         "bits":"01000100",
//         "armed":false,
//         "ignitionOn":false,
//         "charging":true,
//         "alarmCode":0,
//         "alarmType":"normal"
//      },
//      "voltageLevel":240,
//      "batteryLevel":"raw_adc_240 (~94%)",
//      "gsmSignalStrength":3,
//      "gsmSignal":"good",
//      "alarmLanguage":32770,
//      "alarmByte":128,
//      "languageByte":2
//   },
//   "ackHex":"787805130030c9fb0d0a"
// }
const buildHeartbeatPayload = (deviceId, parsed) => ({
  device_id: deviceId,
  ignition: parsed?.heartbeat?.terminalInfoDecoded?.ignitionOn || null,
  relay_status: parsed?.heartbeat?.terminalInfoDecoded?.armed || null,
  battery_level: parsed?.heartbeat?.batteryLevel || null,
  gsm_signal_strength: parsed?.heartbeat?.gsmSignalStrength || null,
  gsm_signal: parsed?.heartbeat?.gsmSignal || null,
  // alarm_language: parsed?.heartbeat?.alarmLanguage ?? null,
  // alarm_byte: parsed?.heartbeat?.alarmByte ?? null,  // not used
  // language_byte: parsed?.heartbeat?.languageByte ?? null,
  last_heartbeat_at: new Date().toISOString(),
  source: parsed?.protocol || 'heartbeat'
});

class GpsTcpListener {
  constructor() {
    this.server = null;
    this.started = false;
  }

  async handleParsedMessage(socket, remote, rawMessage) {
    const parsed = parseGpsPayload(rawMessage);
    if (parsed?.imei) {
      socket._gpsDeviceId = String(parsed.imei);
    }

    const deviceId = inferDeviceId(parsed, rawMessage, socket);

    // Register socket the first time we know the device ID
    if (deviceId && !deviceId.startsWith('tcp_')) {
      registerSocket(deviceId, socket);
    }

    const rawPayload = Buffer.isBuffer(rawMessage) ? rawMessage.toString('hex') : String(rawMessage);
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

    //Format JSON
    // logger.info(`GPS TCP ${parsed.type === 'gps_fix' ? 'FIX' : 'MSG'} ${JSON.stringify(event, null, 2)}`);

    if (parsed?.protocol === 'gps_lbs' || parsed?.protocol === 'gps_lbs_extended' || parsed?.protocol === 'gps_lbs_status') {

      // Get Location Reverse Geocode
      const { location, address } = await getLocationReverseGeocode(parsed?.latitude, parsed?.longitude);
      // console.log('LOCATION REVERSE GEOCODE:', location, address);
      // Publish GPS location to MQTT bridge
      const payload = buildBridgePayload(deviceId, parsed, { location, address });
      const topic = await getBridgeTopic(deviceId, 'location');
      publishGpsToMqtt(topic, payload);
      
      // Console to Terminal - Pink Color Print
      console.log('\x1b[35m%s\x1b[0m', '--------------------------------------------------------------');
      console.log('\x1b[34m%s\s1b[0m', 'LOCATION DATA Received Device:----------->', deviceId);
      console.log('\x1b[35m%s\x1b[0m', 'Latitude:----------->', parsed?.latitude);
      console.log('\x1b[35m%s\x1b[0m', 'Longitude:----------->', parsed?.longitude);
      console.log('\x1b[35m%s\x1b[0m', 'Speed:----------->', parsed?.speed);
      console.log('\x1b[35m%s\x1b[0m', 'Heading:----------->', parsed?.heading);
      console.log('\x1b[35m%s\x1b[0m', 'Address:----------->', address);
      console.log('\x1b[35m%s\x1b[0m', 'Location:----------->', location);
      console.log('\x1b[35m%s\x1b[0m', 'LOCATION DATA Received Device:----------->', deviceId,);
      console.log('\x1b[35m%s\x1b[0m', '--------------------------------------------------------------');
      // Console to Terminal - Pink Color Print

      // Save GPS location to database
      await saveGpsLocation({
        deviceId,
        parsed,
        transport: 'tcp',
        source: parsed?.protocol === 'gps_lbs' ? 'gps_lbs' : 'gps_lbs_extended',
        metadata: parsed,
        locationReverseGeocode: { location, address }
      });
    }

    // console.log('PARSED:----------->', parsed);
    if (parsed?.protocol === 'heartbeat') {
      // console.log('HEARTBEAT RECEIVED:', parsed);
      void saveHeartbeat({ deviceId, parsed });
      const payload = buildHeartbeatPayload(deviceId, parsed);
      const topic = await getBridgeTopic(deviceId, 'heartbeat');
      publishGpsToMqtt(topic, payload);
    }

    if (parsed?.commandResponse) {
      void handleCommandResponse({ deviceId, parsed });
    }

    if (parsed?.type === 'relay_event') {
      void handleRelayEvent({ deviceId, parsed });
    }

    if (parsed?.deviceStatus) {
      void handleDeviceStatus({ deviceId, parsed });
    }

    if (parsed?.type === 'lbs_report') {
      void handleLbsReport({ deviceId, parsed });
    }

    if (parsed?.ackHex) {
      socket.write(Buffer.from(parsed.ackHex, 'hex'));
      // logger.info(`GPS TCP ACK sent (${parsed.protocol || parsed.type}) to ${remote}`);
    }
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
          const hex = chunk.toString('hex');

          // console.log('RAW HEX:', hex);
        
          // Login packet
          if (hex.startsWith('7878') && hex.substr(6, 2) === '01') {
            console.log('LOGIN PACKET RECEIVED');
        
            // Serial number (2 bytes before CRC)
            const serial = hex.substring(hex.length - 12, hex.length - 8);
        
            // console.log('Serial:', serial);
        
            // Temporary ACK
            const ack = Buffer.from(
              `78780501${serial}d9dc0d0a`,
              'hex'
            );
        
            socket.write(ack);
        
            // console.log('LOGIN ACK SENT:', ack.toString('hex'));
          }
          socket._gpsBuffer = Buffer.concat([socket._gpsBuffer || Buffer.alloc(0), chunk]);

          // Safety guard for malformed noisy streams.
          if (socket._gpsBuffer.length > 65535) {
            socket._gpsBuffer = socket._gpsBuffer.subarray(socket._gpsBuffer.length - 32768);
          }

          const { messages, rest } = readDelimitedMessages(socket._gpsBuffer);
          socket._gpsBuffer = rest;

          messages.forEach(rawMessage => {
            this.handleParsedMessage(socket, remote, rawMessage);
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
        if (socket._gpsDeviceId) {
          unregisterSocket(socket._gpsDeviceId);
        }
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

