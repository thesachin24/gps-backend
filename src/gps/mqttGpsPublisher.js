import mqtt from 'mqtt';
import logger from '../config/logger';

const toBoolean = value => {
  if (value === undefined || value === null) {
    return false;
  }
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const getPublishQos = () =>
  Number(process.env.GPS_MQTT_PUBLISH_QOS || process.env.GPS_MQTT_QOS || 1);

class GpsMqttPublisher {
  constructor() {
    this.client = null;
    this.started = false;
    this.clientId = null;
  }

  start() {
    if (this.started) {
      return;
    }

    if (!toBoolean(process.env.GPS_MQTT_ENABLED)) {
      logger.info('GPS MQTT publisher is disabled. Set GPS_MQTT_ENABLED=true to enable.');
      return;
    }

    const brokerUrl = process.env.GPS_MQTT_URL || 'mqtt://localhost:1883';
    const options = {
      clientId: process.env.GPS_MQTT_PUBLISHER_CLIENT_ID || `gps-publisher-${Math.random().toString(16).slice(2, 10)}`,
      username: process.env.GPS_MQTT_USERNAME || undefined,
      password: process.env.GPS_MQTT_PASSWORD || undefined,
      clean: true,
      reconnectPeriod: Number(process.env.GPS_MQTT_RECONNECT_MS || 5000)
    };

    this.client = mqtt.connect(brokerUrl, options);
    this.clientId = options.clientId;
    this.started = true;

    this.client.on('connect', () => {
      logger.info(`GPS MQTT publisher connected: ${brokerUrl} (clientId=${this.clientId})`);
    });
    this.client.on('reconnect', () => {
      logger.info(`GPS MQTT publisher reconnecting... (clientId=${this.clientId})`);
    });
    this.client.on('error', err => {
      logger.error(`GPS MQTT publisher error (clientId=${this.clientId}): ${err.message}`);
    });
    this.client.on('close', () => {
      logger.info(`GPS MQTT publisher closed (clientId=${this.clientId})`);
    });
  }

  publish(topic, payload) {
    if (!this.client || !this.started) {
      logger.error('GPS MQTT publish skipped: publisher is not connected.');
      return false;
    }

    try {
      const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
      this.client.publish(topic, message, { qos: getPublishQos(), retain: false }, err => {
        if (err) {
          logger.error(`GPS MQTT publish failed (${topic}): ${err.message}`);
        }
      });
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
    this.clientId = null;
    logger.info('GPS MQTT publisher stopped.');
  }
}

const gpsMqttPublisher = new GpsMqttPublisher();

export const startGpsMqttPublisher = () => gpsMqttPublisher.start();
export const stopGpsMqttPublisher = () => gpsMqttPublisher.stop();
export const publishGpsToMqtt = (topic, payload) => gpsMqttPublisher.publish(topic, payload);
