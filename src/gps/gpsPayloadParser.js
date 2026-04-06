const LAT_KEYS = ['lat', 'latitude', 'gps_latitude'];
const LNG_KEYS = ['lng', 'lon', 'long', 'longitude', 'gps_longitude'];

const toNumber = value => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const readUInt24BE = (buffer, offset) => {
  if (!buffer || buffer.length < offset + 3) {
    return null;
  }
  return (buffer[offset] << 16) | (buffer[offset + 1] << 8) | buffer[offset + 2];
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

const decodeBatteryLevel = level => {
  const map = {
    0: 'unknown',
    1: 'very_low',
    2: 'low',
    3: 'medium',
    4: 'high',
    5: 'very_high',
    6: 'full'
  };
  return map[level] || 'unknown';
};

const decodeGsmSignal = level => {
  const map = {
    0: 'none',
    1: 'very_weak',
    2: 'weak',
    3: 'good',
    4: 'strong'
  };
  return map[level] || 'unknown';
};

const decodeHeartbeatAlarm = code => {
  const map = {
    0: 'normal',
    1: 'shock',
    2: 'power_cut',
    3: 'low_battery',
    4: 'sos',
    5: 'reserved',
    6: 'geofence',
    7: 'removal_or_overspeed'
  };
  return map[code] || 'unknown';
};

const toHexByte = value => value.toString(16).padStart(2, '0');

const decodeInformationTypeName = infoType => {
  const map = {
    0x01: 'terminal_to_server_short_message',
    0x02: 'server_to_terminal_short_message_ack',
    0x03: 'obd_data',
    0x04: 'reserved',
    0x05: 'reserved',
    0x06: 'time_sync_or_status',
    0x07: 'reserved',
    0x08: 'network_assist_data',
    0x09: 'reserved',
    0x0a: 'lbs_or_network_report'
  };
  return map[infoType] || 'unknown_information_type';
};

const decodeInfoTransmissionPayload = (infoType, payloadBuffer) => {
  if (!payloadBuffer || !payloadBuffer.length) {
    return {
      payloadLength: 0
    };
  }

  const payloadHex = payloadBuffer.toString('hex');
  const payload = {
    payloadLength: payloadBuffer.length,
    payloadHex,
    payloadBytes: Array.from(payloadBuffer).map(toHexByte)
  };

  // Type 0x0A is commonly used by GT06 variants for network/LBS assist reports.
  // Many vendors encode repeated cell tower blocks in 9-byte groups.
  if (infoType === 0x0a && payloadBuffer.length % 9 === 0) {
    const records = [];
    for (let offset = 0; offset < payloadBuffer.length; offset += 9) {
      const mcc = payloadBuffer.readUInt16BE(offset);
      const mnc = payloadBuffer[offset + 2];
      const lac = payloadBuffer.readUInt16BE(offset + 3);
      const cellId = readUInt24BE(payloadBuffer, offset + 5);
      const rssi = payloadBuffer[offset + 8];
      records.push({
        index: records.length + 1,
        mcc,
        mnc,
        lac,
        cellId,
        cellIdHex: cellId !== null ? cellId.toString(16).padStart(6, '0') : null,
        signalStrength: rssi
      });
    }
    payload.decodedAs = 'cell_tower_records_9_bytes';
    payload.cellTowers = records;
  }

  return payload;
};

const decodeHeartbeatTerminalInfo = terminalInfo => {
  const alarmCode = (terminalInfo >> 3) & 0x07;
  return {
    raw: terminalInfo,
    bits: terminalInfo.toString(2).padStart(8, '0'),
    armed: (terminalInfo & 0x01) !== 0,
    ignitionOn: (terminalInfo & 0x02) !== 0,
    charging: (terminalInfo & 0x04) !== 0,
    alarmCode,
    alarmType: decodeHeartbeatAlarm(alarmCode)
  };
};
const decodeGt06InfoTransmission = infoBuffer => {
  if (!infoBuffer || !infoBuffer.length) {
    return null;
  }

  const infoType = infoBuffer[0];
  const terminalIdHex = infoBuffer.length >= 9 ? infoBuffer.subarray(1, 9).toString('hex') : null;
  const terminalId = terminalIdHex ? terminalIdHex.replace(/^0/, '') : null;
  const payloadBuffer = infoBuffer.length > 9 ? infoBuffer.subarray(9) : Buffer.alloc(0);
  const payloadHex = payloadBuffer.length ? payloadBuffer.toString('hex') : null;

  return {
    informationType: infoType,
    informationTypeHex: toHexByte(infoType),
    informationTypeName: decodeInformationTypeName(infoType),
    terminalId,
    payloadHex,
    payload: decodeInfoTransmissionPayload(infoType, payloadBuffer)
  };
};

const decodeCourseStatusFlags = courseStatus => ({
  raw: courseStatus,
  bits: courseStatus.toString(2).padStart(16, '0'),
  realTimeGps: (courseStatus & 0x2000) !== 0,
  gpsFixed: (courseStatus & 0x1000) !== 0,
  valid: (courseStatus & 0x1000) !== 0,
  hasIgnition: (courseStatus & 0x4000) !== 0,
  ignitionOn: (courseStatus & 0x8000) !== 0,
  isWest: (courseStatus & 0x0400) === 0,
  isSouth: (courseStatus & 0x0800) !== 0
});

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
  // const flags = decodeCourseStatusFlags(courseStatus);

  let latitude = rawLatitude / 1800000;
  let longitude = rawLongitude / 1800000;

  const { isWest, isSouth } = flags;
  if (isSouth) {
    latitude *= -1;
  }
  if (isWest) {
    longitude *= -1;
  }

  // LBS block (when available) starts after first 18 GPS bytes.
  const lbsOffset = 18;
  const hasLbs = infoBuffer.length >= lbsOffset + 8;
  const mcc = hasLbs ? infoBuffer.readUInt16BE(lbsOffset) : null;
  const mnc = hasLbs ? infoBuffer[lbsOffset + 2] : null;
  const lac = hasLbs ? infoBuffer.readUInt16BE(lbsOffset + 3) : null;
  const cellId = hasLbs ? readUInt24BE(infoBuffer, lbsOffset + 5) : null;

  return {
    timestamp,
    satellites,
    gpsInfoLength,
    rawLatitude,
    rawLongitude,
    courseStatus,
    courseStatusFlags: flags,
    hemisphere: {
      isSouth,
      isWest
    },
    latitude: Number(latitude.toFixed(6)),
    longitude: Number(longitude.toFixed(6)),
    speedKph: speed,
    speed,
    heading,
    lbs: hasLbs
      ? {
          mcc,
          mnc,
          lac,
          cellId,
          cellIdHex: cellId !== null ? cellId.toString(16).padStart(6, '0') : null
        }
      : null
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
  const crcStart = infoEnd + 2;
  const packetCrc = rawBuffer.readUInt16BE(crcStart);
  // CRC is calculated from length field through serial number for both 7878 and 7979 frames.
  const crcBody = rawBuffer.subarray(2, crcStart);
  const calculatedCrc = crc16Itu(crcBody);
  const lengthField = is7979 ? rawBuffer.subarray(2, 4) : rawBuffer.subarray(2, 3);
  const protocolField = rawBuffer.subarray(protocolIndex, protocolIndex + 1);
  const serialField = rawBuffer.subarray(infoEnd, infoEnd + 2);
  const crcField = rawBuffer.subarray(crcStart, crcStart + 2);
  const stopField = rawBuffer.subarray(rawBuffer.length - 2);
  const parsed = {
    type: 'gt06_packet',
    header: is7979 ? '7979' : '7878',
    protocolNo,
    protocol,
    packetLength,
    infoLength,
    infoHex: infoBuffer.toString('hex'),
    serialNo,
    crc: {
      packet: packetCrc,
      calculated: calculatedCrc,
      valid: packetCrc === calculatedCrc
    },
    rawHex: rawBuffer.toString('hex'),
    packet: {
      startHex: rawBuffer.subarray(0, is7979 ? 2 : 2).toString('hex'),
      lengthHex: lengthField.toString('hex'),
      protocolHex: protocolField.toString('hex'),
      infoHex: infoBuffer.toString('hex'),
      serialHex: serialField.toString('hex'),
      crcHex: crcField.toString('hex'),
      stopHex: stopField.toString('hex')
    }
  };

  if (protocolNo === 0x01 && infoBuffer.length >= 8) {
    const imeiHex = infoBuffer.subarray(0, 8).toString('hex');
    parsed.imei = imeiHex.replace(/^0/, '');
    // Some devices append terminal metadata in login packet.
    if (infoBuffer.length > 8) {
      parsed.loginInfoHex = infoBuffer.subarray(8).toString('hex');
    }
    parsed.ackHex = buildGt06AckHex(protocolNo, serialNo, header);
  } else if (protocolNo === 0x13) {
    // Heartbeat commonly carries terminal status bytes.
    if (infoBuffer.length >= 5) {
      const terminalInfo = infoBuffer[0];
      const voltageLevel = infoBuffer[1];
      const gsmSignalStrength = infoBuffer[2];
      const alarmByte = infoBuffer[3];
      const languageByte = infoBuffer[4];
      parsed.heartbeat = {
        messageKind: 'status_keepalive',
        terminalInfo,
        terminalInfoDecoded: decodeHeartbeatTerminalInfo(terminalInfo),
        voltageLevel,
        batteryLevel: decodeBatteryLevel(voltageLevel),
        gsmSignalStrength,
        gsmSignal: decodeGsmSignal(gsmSignalStrength),
        alarmLanguage: infoBuffer.readUInt16BE(3),
        alarmByte,
        languageByte
      };
    } else if (infoBuffer.length > 0) {
      parsed.heartbeatHex = infoBuffer.toString('hex');
    }
    parsed.ackHex = buildGt06AckHex(protocolNo, serialNo, header);
  } else if (protocolNo === 0x12) {
    const gps = decodeGt06GpsLbs(infoBuffer);
    if (gps) {
      parsed.latitude = gps.latitude;
      parsed.longitude = gps.longitude;
      parsed.speedKph = gps.speedKph;
      parsed.speed = gps.speed;
      parsed.heading = gps.heading;
      parsed.timestamp = gps.timestamp;
      parsed.satellites = gps.satellites;
      parsed.gpsInfoLength = gps.gpsInfoLength;
      parsed.rawLatitude = gps.rawLatitude;
      parsed.rawLongitude = gps.rawLongitude;
      parsed.courseStatus = gps.courseStatus;
      parsed.courseStatusFlags = gps.courseStatusFlags;
      parsed.hemisphere = gps.hemisphere;
      parsed.lbs = gps.lbs;
      parsed.type = 'gps_fix';
    }
  } else if (protocolNo === 0x94) {
    const information = decodeGt06InfoTransmission(infoBuffer);
    // parsed.information = {
    //   messageKind: 'device_information_report',
    //   ...(information || {})
    // };
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

