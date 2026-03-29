const LAT_KEYS = ['lat', 'latitude', 'gps_latitude'];
const LNG_KEYS = ['lng', 'lon', 'long', 'longitude', 'gps_longitude'];

const toNumber = value => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const toDecimalFromNmea = (value, hemisphere, isLatitude) => {
  if (!value || !hemisphere) {
    return null;
  }

  const raw = String(value).trim();
  const degLength = isLatitude ? 2 : 3;
  if (raw.length <= degLength) {
    return null;
  }

  const degrees = Number(raw.slice(0, degLength));
  const minutes = Number(raw.slice(degLength));
  if (!Number.isFinite(degrees) || !Number.isFinite(minutes)) {
    return null;
  }

  let decimal = degrees + minutes / 60;
  if (['S', 'W'].includes(String(hemisphere).toUpperCase())) {
    decimal *= -1;
  }
  return decimal;
};

const parseJsonPayload = raw => {
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') {
      return null;
    }

    let latitude = null;
    let longitude = null;
    for (const key of LAT_KEYS) {
      if (key in data) {
        latitude = toNumber(data[key]);
        if (latitude !== null) {
          break;
        }
      }
    }
    for (const key of LNG_KEYS) {
      if (key in data) {
        longitude = toNumber(data[key]);
        if (longitude !== null) {
          break;
        }
      }
    }

    return {
      type: latitude !== null && longitude !== null ? 'gps_fix' : 'json',
      latitude,
      longitude,
      speed: toNumber(data.speed),
      heading: toNumber(data.heading),
      timestamp: data.timestamp || data.time || null,
      data
    };
  } catch (_err) {
    return null;
  }
};

const parseGprmcPayload = raw => {
  const line = raw.split('\n').find(item => item.startsWith('$GPRMC'));
  if (!line) {
    return null;
  }

  const parts = line.trim().split(',');
  if (parts.length < 10) {
    return null;
  }

  const latitude = toDecimalFromNmea(parts[3], parts[4], true);
  const longitude = toDecimalFromNmea(parts[5], parts[6], false);
  const speedKnots = toNumber(parts[7]);
  const speedKmph = speedKnots === null ? null : Number((speedKnots * 1.852).toFixed(2));
  const heading = toNumber(parts[8]);

  return {
    type: 'gps_fix',
    protocol: 'nmea_gprmc',
    latitude,
    longitude,
    speed: speedKmph,
    heading,
    timestamp: `${parts[9] || ''}${parts[1] || ''}`,
    raw: line
  };
};

const parseConfigCommandPayload = raw => {
  const segments = raw
    .split('#')
    .map(item => item.trim())
    .filter(Boolean);

  if (!segments.length) {
    return null;
  }

  const commands = segments
    .map(segment => segment.split(',').map(item => item.trim()))
    .filter(tokens => tokens.length > 0)
    .map(tokens => ({
      command: tokens[0],
      args: tokens.slice(1)
    }));

  if (!commands.length) {
    return null;
  }

  return {
    type: 'device_command',
    commands
  };
};

const crc16Itu = bytes => {
  let crc = 0xffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i];
    for (let j = 0; j < 8; j += 1) {
      if (crc & 1) {
        crc = (crc >> 1) ^ 0x8408;
      } else {
        crc >>= 1;
      }
    }
  }
  crc = ~crc;
  crc &= 0xffff;
  return crc;
};

const toProtocolName = protocolNo => {
  const names = {
    0x01: 'login',
    0x10: 'gps',
    0x11: 'lbs',
    0x12: 'gps_lbs',
    0x13: 'heartbeat',
    0x16: 'alarm',
    0x17: 'command_response',
    0x22: 'gps_lbs_extended',
    0x80: 'server_response',
    0x94: 'information_transmission'
  };
  return names[protocolNo] || `protocol_${protocolNo}`;
};

const decodeGt06DateTime = bytes => {
  if (!bytes || bytes.length < 6) {
    return null;
  }
  const year = 2000 + bytes[0];
  const month = bytes[1];
  const day = bytes[2];
  const hour = bytes[3];
  const minute = bytes[4];
  const second = bytes[5];
  const iso = new Date(Date.UTC(year, month - 1, day, hour, minute, second)).toISOString();
  return iso;
};

const decodeGt06GpsLbs = infoBuffer => {
  if (!infoBuffer || infoBuffer.length < 12) {
    return null;
  }

  const timestamp = decodeGt06DateTime(infoBuffer.subarray(0, 6));
  const gpsInfoSat = infoBuffer[6];
  const gpsInfoLength = (gpsInfoSat & 0xf0) >> 4;
  const satellites = gpsInfoSat & 0x0f;
  const rawLatitude = infoBuffer.readUInt32BE(7);
  const rawLongitude = infoBuffer.readUInt32BE(11);
  const speed = infoBuffer[15];
  const courseStatus = infoBuffer.readUInt16BE(16);
  const heading = courseStatus & 0x03ff;

  let latitude = rawLatitude / 1800000;
  let longitude = rawLongitude / 1800000;

  // GT06 course/status flags:
  // bit10 set => West, bit11 clear => South.
  const isWest = (courseStatus & 0x0400) !== 0;
  const isSouth = (courseStatus & 0x0800) === 0;
  if (isSouth) {
    latitude *= -1;
  }
  if (isWest) {
    longitude *= -1;
  }

  return {
    timestamp,
    satellites,
    gpsInfoLength,
    latitude: Number(latitude.toFixed(6)),
    longitude: Number(longitude.toFixed(6)),
    speed,
    heading
  };
};

const buildGt06AckHex = (protocolNo, serialNo, header = 0x7878) => {
  const serialHi = (serialNo >> 8) & 0xff;
  const serialLo = serialNo & 0xff;
  const body = Buffer.from([0x05, protocolNo, serialHi, serialLo]); // length + protocol + serial
  const crc = crc16Itu(body);
  const crcHi = (crc >> 8) & 0xff;
  const crcLo = crc & 0xff;
  const startBytes = header === 0x7979 ? [0x79, 0x79, 0x00] : [0x78, 0x78];
  return Buffer.from([...startBytes, ...body, crcHi, crcLo, 0x0d, 0x0a]).toString('hex');
};

const parseGt06Payload = rawBuffer => {
  if (!Buffer.isBuffer(rawBuffer) || rawBuffer.length < 10) {
    return null;
  }

  const is7878 = rawBuffer[0] === 0x78 && rawBuffer[1] === 0x78;
  const is7979 = rawBuffer[0] === 0x79 && rawBuffer[1] === 0x79;
  if (!is7878 && !is7979) {
    return null;
  }
  if (rawBuffer[rawBuffer.length - 2] !== 0x0d || rawBuffer[rawBuffer.length - 1] !== 0x0a) {
    return null;
  }

  const header = is7979 ? 0x7979 : 0x7878;
  const lengthBytes = is7979 ? 2 : 1;
  const expectedLength = is7979 ? rawBuffer.readUInt16BE(2) + 6 : rawBuffer[2] + 5;
  if (rawBuffer.length !== expectedLength) {
    return null;
  }

  const protocolIndex = 2 + lengthBytes;
  const protocolNo = rawBuffer[protocolIndex];
  const protocol = toProtocolName(protocolNo);
  const packetLength = is7979 ? rawBuffer.readUInt16BE(2) : rawBuffer[2];
  const infoLength = packetLength - 5; // packet = protocol(1) + info + serial(2) + crc(2)
  const infoStart = protocolIndex + 1;
  const infoEnd = infoStart + infoLength;
  const infoBuffer = rawBuffer.subarray(infoStart, infoEnd);
  const serialNo = rawBuffer.readUInt16BE(infoEnd);
  const parsed = {
    type: 'gt06_packet',
    header: is7979 ? '7979' : '7878',
    protocolNo,
    protocol,
    serialNo,
    rawHex: rawBuffer.toString('hex')
  };

  if (protocolNo === 0x01 && infoBuffer.length >= 8) {
    const imeiHex = infoBuffer.subarray(0, 8).toString('hex');
    parsed.imei = imeiHex.replace(/^0/, '');
    parsed.ackHex = buildGt06AckHex(protocolNo, serialNo, header);
  } else if (protocolNo === 0x13) {
    parsed.ackHex = buildGt06AckHex(protocolNo, serialNo, header);
  } else if (protocolNo === 0x12) {
    const gps = decodeGt06GpsLbs(infoBuffer);
    if (gps) {
      parsed.latitude = gps.latitude;
      parsed.longitude = gps.longitude;
      parsed.speed = gps.speed;
      parsed.heading = gps.heading;
      parsed.timestamp = gps.timestamp;
      parsed.satellites = gps.satellites;
      parsed.type = 'gps_fix';
    }
  }

  return parsed;
};

export const parseGpsPayload = payload => {
  if (Buffer.isBuffer(payload)) {
    const gt06 = parseGt06Payload(payload);
    if (gt06) {
      return gt06;
    }
    return {
      type: 'binary',
      rawHex: payload.toString('hex')
    };
  }

  const raw = String(payload || '').trim();
  if (!raw) {
    return {
      type: 'unknown',
      raw
    };
  }

  const gprmc = parseGprmcPayload(raw);
  if (gprmc) {
    return gprmc;
  }

  const jsonPayload = parseJsonPayload(raw);
  if (jsonPayload) {
    return jsonPayload;
  }

  if (raw.includes('#') && raw.includes(',')) {
    const commandPayload = parseConfigCommandPayload(raw);
    if (commandPayload) {
      return commandPayload;
    }
  }

  return {
    type: 'raw_text',
    raw
  };
};

