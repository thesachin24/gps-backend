#!/usr/bin/env node

require('dotenv').config();
const mqtt = require('mqtt');

// Reuse app MQTT config by default; only topic can be overridden.
const BROKER_URL = process.env.GPS_MQTT_URL || process.env.SIM_MQTT_URL || 'mqtt://127.0.0.1:1883';
const DEVICE_ID = process.env.SIM_DEVICE_ID || 'delhi-sim-001';
// const TOPIC = process.env.SIM_MQTT_TOPIC || process.env.GPS_SIM_TOPIC || `gps/${DEVICE_ID}/data`;
const TOPIC = `${process.env.NODE_ENV}/gps/v1/${DEVICE_ID}/location`;
const INTERVAL_MS = Number(process.env.SIM_PUBLISH_INTERVAL_MS || 5000);
const QOS = Number(process.env.SIM_MQTT_QOS || 1);
const USERNAME = process.env.GPS_MQTT_USERNAME || process.env.SIM_MQTT_USERNAME || undefined;
const PASSWORD = process.env.GPS_MQTT_PASSWORD || process.env.SIM_MQTT_PASSWORD || undefined;

// A small loop across Delhi landmarks.
// const DELHI_ROUTE = [
//   { lat: 28.6139, lng: 77.2090 },
//   { lat: 28.6150, lng: 77.2080 },
//   { lat: 28.6165, lng: 77.2070 },
//   { lat: 28.6180, lng: 77.2065 },
//   { lat: 28.6195, lng: 77.2075 },
//   { lat: 28.6210, lng: 77.2090 },
//   { lat: 28.6225, lng: 77.2110 },
//   { lat: 28.6240, lng: 77.2130 },
//   { lat: 28.6260, lng: 77.2150 },
//   { lat: 28.6280, lng: 77.2170 },
//   { lat: 28.6300, lng: 77.2190 },
//   { lat: 28.6320, lng: 77.2210 },
//   { lat: 28.6340, lng: 77.2230 },
//   { lat: 28.6360, lng: 77.2255 },
//   { lat: 28.6380, lng: 77.2280 },
//   { lat: 28.6400, lng: 77.2305 },
//   { lat: 28.6420, lng: 77.2330 },
//   { lat: 28.6440, lng: 77.2355 },
//   { lat: 28.6460, lng: 77.2380 },
//   { lat: 28.6480, lng: 77.2405 },

//   { lat: 28.6450, lng: 77.2450 },
//   { lat: 28.6420, lng: 77.2480 },
//   { lat: 28.6390, lng: 77.2510 },
//   { lat: 28.6360, lng: 77.2540 },
//   { lat: 28.6330, lng: 77.2570 },
//   { lat: 28.6300, lng: 77.2600 },
//   { lat: 28.6270, lng: 77.2580 },
//   { lat: 28.6240, lng: 77.2560 },
//   { lat: 28.6210, lng: 77.2540 },
//   { lat: 28.6180, lng: 77.2520 },
//   { lat: 28.6150, lng: 77.2500 },
//   { lat: 28.6120, lng: 77.2480 },
//   { lat: 28.6090, lng: 77.2460 },
//   { lat: 28.6060, lng: 77.2440 },
//   { lat: 28.6030, lng: 77.2420 },
//   { lat: 28.6000, lng: 77.2400 },
//   { lat: 28.5980, lng: 77.2370 },
//   { lat: 28.5960, lng: 77.2340 },
//   { lat: 28.5940, lng: 77.2310 },
//   { lat: 28.5920, lng: 77.2280 },

//   { lat: 28.5900, lng: 77.2250 },
//   { lat: 28.5880, lng: 77.2220 },
//   { lat: 28.5860, lng: 77.2190 },
//   { lat: 28.5840, lng: 77.2160 },
//   { lat: 28.5820, lng: 77.2130 },
//   { lat: 28.5800, lng: 77.2100 },
//   { lat: 28.5780, lng: 77.2070 },
//   { lat: 28.5760, lng: 77.2040 },
//   { lat: 28.5740, lng: 77.2010 },
//   { lat: 28.5720, lng: 77.1980 },
//   { lat: 28.5700, lng: 77.1950 },
//   { lat: 28.5680, lng: 77.1920 },
//   { lat: 28.5660, lng: 77.1890 },
//   { lat: 28.5640, lng: 77.1860 },
//   { lat: 28.5620, lng: 77.1830 },
//   { lat: 28.5600, lng: 77.1800 },
//   { lat: 28.5625, lng: 77.1780 },
//   { lat: 28.5650, lng: 77.1760 },
//   { lat: 28.5675, lng: 77.1740 },
//   { lat: 28.5700, lng: 77.1720 },

//   { lat: 28.5750, lng: 77.1700 },
//   { lat: 28.5800, lng: 77.1680 },
//   { lat: 28.5850, lng: 77.1670 },
//   { lat: 28.5900, lng: 77.1680 },
//   { lat: 28.5950, lng: 77.1700 },
//   { lat: 28.6000, lng: 77.1720 },
//   { lat: 28.6050, lng: 77.1750 },
//   { lat: 28.6080, lng: 77.1780 },
//   { lat: 28.6100, lng: 77.1820 },
//   { lat: 28.6120, lng: 77.1860 },
//   { lat: 28.6140, lng: 77.1900 },
//   { lat: 28.6160, lng: 77.1940 },
//   { lat: 28.6175, lng: 77.1980 },
//   { lat: 28.6185, lng: 77.2020 },
//   { lat: 28.6175, lng: 77.2055 },
//   { lat: 28.6155, lng: 77.2075 },
//   { lat: 28.6139, lng: 77.2090 }
// ];

const DELHI_ROUTE = [
  { lat: 28.628548, lng: 77.216541, speed: 20, heading: 35 },
  { lat: 28.629630, lng: 77.217332, speed: 25, heading: 32 },
  { lat: 28.630261, lng: 77.217723, speed: 30, heading: 28 },
  { lat: 28.630933, lng: 77.217268, speed: 28, heading: 330 },
  { lat: 28.631999, lng: 77.216517, speed: 32, heading: 325 },
  { lat: 28.632853, lng: 77.216384, speed: 35, heading: 355 },
  { lat: 28.633121, lng: 77.214510, speed: 40, heading: 270 },
  { lat: 28.633211, lng: 77.212793, speed: 45, heading: 265 },
  { lat: 28.633355, lng: 77.210918, speed: 50, heading: 265 },
  { lat: 28.633476, lng: 77.208939, speed: 48, heading: 265 },
  { lat: 28.633529, lng: 77.208460, speed: 35, heading: 260 },
  { lat: 28.634218, lng: 77.209026, speed: 25, heading: 40 },
  { lat: 28.635063, lng: 77.209648, speed: 22, heading: 38 },
  { lat: 28.635841, lng: 77.210223, speed: 20, heading: 36 },
  { lat: 28.636606, lng: 77.210789, speed: 18, heading: 35 },
  { lat: 28.637147, lng: 77.211207, speed: 15, heading: 35 },
  { lat: 28.637645, lng: 77.211591, speed: 15, heading: 35 },
  { lat: 28.637099, lng: 77.212524, speed: 12, heading: 210 },
  { lat: 28.636602, lng: 77.213387, speed: 12, heading: 210 },
  { lat: 28.636074, lng: 77.214264, speed: 14, heading: 210 },
  { lat: 28.635440, lng: 77.215327, speed: 16, heading: 210 },
  { lat: 28.635009, lng: 77.216019, speed: 18, heading: 210 },
  { lat: 28.634393, lng: 77.217137, speed: 20, heading: 210 },
  { lat: 28.635181, lng: 77.217864, speed: 18, heading: 45 },
  { lat: 28.635652, lng: 77.218987, speed: 16, heading: 110 },
  { lat: 28.635748, lng: 77.219860, speed: 14, heading: 95 },
];
const toRadians = deg => (deg * Math.PI) / 180;
const toDegrees = rad => (rad * 180) / Math.PI;

const getHeading = (from, to) => {
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const dLng = toRadians(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
};

let routeIndex = 0;

const client = mqtt.connect(BROKER_URL, {
  clientId: `${DEVICE_ID}-sim-${Math.random().toString(16).slice(2, 8)}`,
  username: USERNAME,
  password: PASSWORD,
  reconnectPeriod: 3000
});

const publishLocation = () => {
  const point = DELHI_ROUTE[routeIndex];
  const nextPoint = DELHI_ROUTE[(routeIndex + 1) % DELHI_ROUTE.length];
  const heading = point.heading !== undefined ? point.heading : Number(getHeading(point, nextPoint).toFixed(2));
  const speed = point.speed !== undefined ? point.speed : 25;

  const payload = {
    device_id: DEVICE_ID,
    lat: point.lat,
    lng: point.lng,
    speed,
    heading,
    timestamp: new Date().toISOString(),
    source: 'delhi-simulator'
  };

  client.publish(TOPIC, JSON.stringify(payload), { qos: QOS, retain: false }, err => {
    if (err) {
      console.error('[SIM] Publish failed:', err.message);
      return;
    }
    console.log(`[SIM] Published to ${TOPIC}:`, payload);
  });

  routeIndex = (routeIndex + 1) % DELHI_ROUTE.length;
};

let timer = null;

client.on('connect', () => {
  console.log(`[SIM] Connected to ${BROKER_URL}`);
  console.log(`[SIM] Device: ${DEVICE_ID}, Topic: ${TOPIC}, Interval: ${INTERVAL_MS}ms`);
  publishLocation();
  timer = setInterval(publishLocation, INTERVAL_MS);
});

client.on('reconnect', () => console.log('[SIM] Reconnecting to broker...'));
client.on('error', err => console.error('[SIM] MQTT error:', err.message));
client.on('offline', () => console.log('[SIM] MQTT offline'));

const shutdown = () => {
  if (timer) {
    clearInterval(timer);
  }
  client.end(true, () => {
    console.log('[SIM] Simulator stopped.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

