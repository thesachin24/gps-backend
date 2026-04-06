#!/usr/bin/env node

require('dotenv').config();
const net = require('net');

const HOST = process.env.GPS_REPLAY_HOST || process.env.GPS_TCP_HOST || '127.0.0.1';
const PORT = Number(process.env.GPS_REPLAY_PORT || process.env.GPS_TCP_PORT || 5023);
const LOOP = ['1', 'true', 'yes', 'on'].includes(String(process.env.GPS_REPLAY_LOOP || '').toLowerCase());
const LOOP_INTERVAL_MS = Number(process.env.GPS_REPLAY_LOOP_MS || 15000);

// Captured sample packets from your real device logs.
const DEFAULT_PACKETS = [
  '78780d0103578033716785050001b5720d0a', // login
  '78780a13000104000200023bee0d0a', // heartbeat
  '78781f121a0406070e1bcc0313680f08450ba100141601940a007100f7ba001543470d0a', // gps_lbs
  '79790020940a035780337167850504041006541767058991102506541767054f00054e170d0a' // information_transmission
];

const parseHexList = value => {
  if (!value) {
    return DEFAULT_PACKETS;
  }
  return String(value)
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);
};

const PACKETS = parseHexList(process.env.GPS_REPLAY_PACKETS);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const sendSequence = async client => {
  for (const hex of PACKETS) {
    if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) {
      console.error(`[REPLAY] Skipping invalid hex packet: ${hex}`);
      continue;
    }
    const buffer = Buffer.from(hex, 'hex');
    client.write(buffer);
    console.log(`[REPLAY] Sent ${hex}`);
    await sleep(1200);
  }
};

const run = () => {
  const client = new net.Socket();

  client.on('connect', async () => {
    console.log(`[REPLAY] Connected to ${HOST}:${PORT}`);
    try {
      await sendSequence(client);
      if (!LOOP) {
        console.log('[REPLAY] Sequence complete. Closing.');
        client.end();
        return;
      }
      console.log(`[REPLAY] Loop mode ON. Replaying every ${LOOP_INTERVAL_MS}ms`);
      setInterval(async () => {
        try {
          await sendSequence(client);
        } catch (err) {
          console.error(`[REPLAY] Loop send error: ${err.message}`);
        }
      }, LOOP_INTERVAL_MS);
    } catch (err) {
      console.error(`[REPLAY] Send error: ${err.message}`);
      client.end();
    }
  });

  client.on('data', data => {
    console.log(`[REPLAY] ACK <- ${data.toString('hex')}`);
  });

  client.on('error', err => {
    console.error(`[REPLAY] Socket error: ${err.message}`);
  });

  client.on('close', () => {
    console.log('[REPLAY] Connection closed.');
    if (LOOP) {
      setTimeout(run, 2000);
    }
  });

  client.connect(PORT, HOST);
};

run();
