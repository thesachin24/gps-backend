import mqtt from 'mqtt';
import logger from '../config/logger';
import { parseGpsPayload } from './gpsPayloadParser';

const DEFAULT_TOPICS = ['gps/+/data'];

const toBoolean = value => {
  if (value === undefined || value === null) {
    return false;
  }
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const getTopics = () => {
  const envTopics = process.env.GPS_MQTT_TOPICS;
  if (!envTopics) {
    return DEFAULT_TOPICS;
  }
  return envTopics
    .split(',')
    .map(topic => topic.trim())
    .filter(Boolean);
};

class GpsMqttListener {
  constructor() {
    this.client = null;
    this.started = false;
    this.topics = getTopics();
  }

  start() {
    if (this.started) {
      return;
    }

    if (!toBoolean(process.env.GPS_MQTT_ENABLED)) {
      logger.info('GPS MQTT listener is disabled. Set GPS_MQTT_ENABLED=true to enable.');
      return;
    }

    const brokerUrl = process.env.GPS_MQTT_URL || 'mqtt://localhost:1883';
    const options = {
      clientId: process.env.GPS_MQTT_CLIENT_ID || `gps-backend-${Math.random().toString(16).slice(2, 10)}`,
      username: process.env.GPS_MQTT_USERNAME || undefined,
      password: process.env.GPS_MQTT_PASSWORD || undefined,
      clean: true,
      reconnectPeriod: Number(process.env.GPS_MQTT_RECONNECT_MS || 5000)
    };

    this.client = mqtt.connect(brokerUrl, options);
    this.started = true;

    this.client.on('connect', () => {
      logger.info(`GPS MQTT connected: ${brokerUrl}`);
      this.topics.forEach(topic => {
        this.client.subscribe(topic, { qos: Number(process.env.GPS_MQTT_QOS || 1) }, err => {
          if (err) {
            logger.error(`GPS MQTT subscribe failed for ${topic}: ${err.message}`);
            return;
          }
          logger.info(`GPS MQTT subscribed: ${topic}`);
        });
      });
    });

    this.client.on('reconnect', () => {
      logger.info('GPS MQTT reconnecting...');
    });

    this.client.on('error', err => {
      logger.error(`GPS MQTT error: ${err.message}`);
    });

    this.client.on('message', (topic, messageBuffer) => {
      const rawMessage = messageBuffer.toString('utf-8').trim();
      if (!rawMessage) {
        return;
      }

      const parsed = parseGpsPayload(rawMessage);
      const deviceId = topic.split('/')[1] || null;
      const event = {
        topic,
        deviceId,
        receivedAt: new Date().toISOString(),
        raw: rawMessage,
        parsed
      };

      // Keep log compact but structured enough for ingestion and debugging.
      if (parsed.type === 'gps_fix') {
        logger.info(`GPS FIX ${JSON.stringify(event)}`);
      } else {
        logger.info(`GPS MSG ${JSON.stringify(event)}`);
      }
    });
  }

  publish(topic, payload) {
    if (!this.client || !this.started) {
      logger.error('GPS MQTT publish skipped: client is not connected.');
      return false;
    }

    try {
      const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
      this.client.publish(
        topic,
        message,
        { qos: Number(process.env.GPS_MQTT_PUBLISH_QOS || process.env.GPS_MQTT_QOS || 1), retain: false },
        err => {
          if (err) {
            logger.error(`GPS MQTT publish failed (${topic}): ${err.message}`);
            return;
          }
          logger.info(`GPS MQTT published: ${topic}`);
        }
      );
      return true;
    } catch (err) {
      logger.error(`GPS MQTT publish serialization failed: ${err.message}`);
      return false;
    }
  }

  stop() {
    if (!this.client) {
      return;
    }

    this.client.end(true);
    this.client = null;
    this.started = false;
    logger.info('GPS MQTT listener stopped.');
  }

}

const gpsMqttListener = new GpsMqttListener();

export const startGpsMqttListener = () => gpsMqttListener.start();
export const stopGpsMqttListener = () => gpsMqttListener.stop();
export const publishGpsToMqtt = (topic, payload) => gpsMqttListener.publish(topic, payload);

