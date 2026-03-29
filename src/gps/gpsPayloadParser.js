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
    0x12: 'gps_lbs',
    0x13: 'heartbeat',
    0x16: 'alarm',
    0x22: 'gps_lbs_extended'
  };
  return names[protocolNo] || `protocol_${protocolNo}`;
};

const buildGt06AckHex = (protocolNo, serialNo) => {
  const serialHi = (serialNo >> 8) & 0xff;
  const serialLo = serialNo & 0xff;
  const body = Buffer.from([0x05, protocolNo, serialHi, serialLo]);
  const crc = crc16Itu(body);
  const crcHi = (crc >> 8) & 0xff;
  const crcLo = crc & 0xff;
  return Buffer.from([0x78, 0x78, ...body, crcHi, crcLo, 0x0d, 0x0a]).toString('hex');
};

const parseGt06Payload = rawBuffer => {
  if (!Buffer.isBuffer(rawBuffer) || rawBuffer.length < 10) {
    return null;
  }
  if (rawBuffer[0] !== 0x78 || rawBuffer[1] !== 0x78) {
    return null;
  }
  if (rawBuffer[rawBuffer.length - 2] !== 0x0d || rawBuffer[rawBuffer.length - 1] !== 0x0a) {
    return null;
  }

  const length = rawBuffer[2];
  if (rawBuffer.length !== length + 5) {
    return null;
  }

  const protocolNo = rawBuffer[3];
  const protocol = toProtocolName(protocolNo);
  const serialNo = rawBuffer.readUInt16BE(rawBuffer.length - 6);
  const parsed = {
    type: 'gt06_packet',
    protocolNo,
    protocol,
    serialNo,
    rawHex: rawBuffer.toString('hex')
  };

  if (protocolNo === 0x01 && rawBuffer.length >= 18) {
    const imeiHex = rawBuffer.subarray(4, 12).toString('hex');
    parsed.imei = imeiHex.replace(/^0/, '');
    parsed.ackHex = buildGt06AckHex(protocolNo, serialNo);
  } else if (protocolNo === 0x13) {
    parsed.ackHex = buildGt06AckHex(protocolNo, serialNo);
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

