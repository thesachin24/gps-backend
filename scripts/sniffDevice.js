#!/usr/bin/env node
/**
 * Raw packet sniffer — connects to your GPS TCP server and prints every byte
 * received, decoded as much as possible.
 *
 * Usage:
 *   node scripts/sniffDevice.js [IMEI]
 *
 * Example:
 *   node scripts/sniffDevice.js 357168337805031
 *
 * It also sends PARAM# and CHECK# commands after the device logs in,
 * so you can see what the device replies with after an SMS relay command.
 */

require('dotenv').config();
const net = require('net');

const TARGET_IMEI = process.argv[2] || null;
const HOST = process.env.GPS_TCP_HOST || '127.0.0.1';
const PORT = Number(process.env.GPS_TCP_PORT || 5023);

// ── GT06 helpers ──────────────────────────────────────────────────────────────

const PROTOCOL_NAMES = {
  0x01: 'LOGIN',
  0x10: 'GPS',
  0x11: 'LBS',
  0x12: 'GPS+LBS',
  0x13: 'HEARTBEAT',
  0x16: 'ALARM',
  0x17: 'CMD_RESPONSE',
  0x22: 'GPS+LBS_EXT',
  0x80: 'SERVER_CMD',
  0x94: 'INFO_TRANSMISSION'
};

const crc16Itu = bytes => {
  let crc = 0xffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >> 1) ^ 0x8408 : crc >> 1;
    }
  }
  return (~crc) & 0xffff;
};

const buildCmd = (command, serial = 1) => {
  const cmdBuf = Buffer.from(command, 'ascii');
  const flag = Buffer.from([0x00, 0x00, (serial >> 8) & 0xff, serial & 0xff]);
  const lenByte = 1 + 4 + 1 + cmdBuf.length + 2 + 2;
  const body = Buffer.concat([
    Buffer.from([lenByte, 0x80]),
    flag,
    Buffer.from([cmdBuf.length]),
    cmdBuf,
    Buffer.from([(serial >> 8) & 0xff, serial & 0xff])
  ]);
  const crc = crc16Itu(body);
  return Buffer.concat([Buffer.from([0x78, 0x78]), body, Buffer.from([(crc >> 8) & 0xff, crc & 0xff, 0x0d, 0x0a])]);
};

const decodeTerminalInfo = b => ({
  raw: `0x${b.toString(16).padStart(2, '0')} (${b.toString(2).padStart(8, '0')})`,
  armed_relay: !!(b & 0x01),
  ignition: !!(b & 0x02),
  charging: !!(b & 0x04),
  alarmCode: (b >> 3) & 0x07
});

const decodePacket = buf => {
  if (buf.length < 10) return { raw: buf.toString('hex'), note: 'too short' };
  const proto = buf[3];
  const name = PROTOCOL_NAMES[proto] || `UNKNOWN_0x${proto.toString(16)}`;
  const packetLen = buf[2]; // length field = protocol + info + serial(2) + crc(2)
  const infoLen = packetLen - 5;
  const infoStart = 4;
  const infoEnd = infoStart + infoLen;
  const info = buf.subarray(infoStart, infoEnd);
  const serial = buf.readUInt16BE(infoEnd);

  const decoded = { protocol: `0x${proto.toString(16).padStart(2, '0')} (${name})`, serial, infoHex: info.toString('hex') };

  if (proto === 0x13 && info.length >= 5) {
    decoded.heartbeat = {
      terminalInfo: decodeTerminalInfo(info[0]),
      voltageLevel: info[1],
      gsmSignal: info[2],
      alarmByte: info[3]
    };
  }

  if (proto === 0x16 && info.length >= 22) {
    const alarmStatus = info[21];
    const ALARM_NAMES = { 0x00: 'normal', 0x01: 'shock', 0x02: 'power_cut', 0x09: 'ARMED(relay_on)', 0x0a: 'DISARMED(relay_off)' };
    decoded.alarm = {
      terminalInfo: decodeTerminalInfo(info[18]),
      alarmStatus: `0x${alarmStatus.toString(16)} → ${ALARM_NAMES[alarmStatus] || 'unknown'}`,
      relay_on: alarmStatus === 0x09 ? true : alarmStatus === 0x0a ? false : null
    };
  }

  if (proto === 0x17 && info.length >= 5) {
    const contentLen = info[4];
    const content = info.length >= 5 + contentLen ? info.subarray(5, 5 + contentLen).toString('ascii') : '(truncated)';
    decoded.commandResponse = {
      serverFlag: info.subarray(0, 4).toString('hex'),
      content
    };
  }

  if (proto === 0x01 && info.length >= 8) {
    decoded.imei = info.subarray(0, 8).toString('hex').replace(/^0/, '');
  }

  return decoded;
};

// ── Main sniffer ──────────────────────────────────────────────────────────────

let deviceImei = null;
let cmdSerial = 100;

const server = net.createServer(socket => {
  const remote = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`\n[+] Device connected from ${remote}`);
  let buf = Buffer.alloc(0);

  socket.on('data', chunk => {
    buf = Buffer.concat([buf, chunk]);
    console.log(`\n[RAW ←] ${chunk.toString('hex')}`);

    // Try to split GT06 packets
    while (buf.length >= 5) {
      if (buf[0] !== 0x78 || buf[1] !== 0x78) { buf = buf.subarray(1); continue; }
      const pktLen = buf[2] + 5;
      if (buf.length < pktLen) break;
      const pkt = buf.subarray(0, pktLen);
      buf = buf.subarray(pktLen);

      const decoded = decodePacket(pkt);
      console.log('[DECODED]', JSON.stringify(decoded, null, 2));

      // Store IMEI from login
      if (pkt[3] === 0x01) {
        deviceImei = decoded.imei;
        if (TARGET_IMEI && deviceImei !== TARGET_IMEI) {
          console.log(`[SKIP] IMEI ${deviceImei} does not match target ${TARGET_IMEI}`);
          return;
        }
        console.log(`[IMEI] ${deviceImei}`);

        // Send login ACK
        const serial = pkt.readUInt16BE(pktLen - 4);
        const ackBody = Buffer.from([0x05, 0x01, (serial >> 8) & 0xff, serial & 0xff]);
        const crc = crc16Itu(ackBody);
        const ack = Buffer.concat([Buffer.from([0x78, 0x78]), ackBody, Buffer.from([(crc >> 8) & 0xff, crc & 0xff, 0x0d, 0x0a])]);
        socket.write(ack);
        console.log(`[ACK →] ${ack.toString('hex')}`);

        // After 2 seconds send PARAM and CHECK to query current state
        setTimeout(() => {
          const paramCmd = buildCmd('PARAM', cmdSerial++);
          const checkCmd = buildCmd('CHECK', cmdSerial++);
          socket.write(paramCmd);
          console.log(`[CMD →] PARAM  ${paramCmd.toString('hex')}`);
          setTimeout(() => {
            socket.write(checkCmd);
            console.log(`[CMD →] CHECK  ${checkCmd.toString('hex')}`);
          }, 1000);
        }, 2000);
      }

      // ACK heartbeat and alarm
      if (pkt[3] === 0x13 || pkt[3] === 0x16) {
        const serial = pkt.readUInt16BE(pktLen - 4);
        const ackBody = Buffer.from([0x05, pkt[3], (serial >> 8) & 0xff, serial & 0xff]);
        const crc = crc16Itu(ackBody);
        const ack = Buffer.concat([Buffer.from([0x78, 0x78]), ackBody, Buffer.from([(crc >> 8) & 0xff, crc & 0xff, 0x0d, 0x0a])]);
        socket.write(ack);
        console.log(`[ACK →] ${ack.toString('hex')}`);
      }
    }
  });

  socket.on('error', err => console.error(`[ERR] ${err.message}`));
  socket.on('close', () => console.log(`[-] ${remote} disconnected`));
});

server.listen(PORT, HOST, () => {
  console.log(`\nGPS sniffer listening on ${HOST}:${PORT}`);
  console.log(TARGET_IMEI ? `Watching IMEI: ${TARGET_IMEI}` : 'Watching ALL devices');
  console.log('Send SMS "RELAY,1#" to the device SIM and watch the output below.\n');
});
