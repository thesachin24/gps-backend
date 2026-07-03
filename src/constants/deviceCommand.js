/**
 * GT06 / GPS device command constants.
 * Use these values in the POST /devices/:id/commands body `command` field,
 * or pass the RAW_COMMANDS values directly.
 */

/** Human-friendly aliases resolved by deviceCommandService before dispatch */
export const COMMAND_ALIASES = Object.freeze({
  RELAY_ON: 'relay_on',
  RELAY_OFF: 'relay_off'
});

/**
 * Raw GT06 ASCII commands sent over TCP.
 * These are the actual strings written into the GT06 command packet.
 */
export const RAW_COMMANDS = Object.freeze({
  // Relay / immobilizer
  RELAY_ON: 'RELAY,1',
  RELAY_OFF: 'RELAY,0',

  // Server time sync request
  TIME_SYNC: 'TIME',

  // Request current location
  WHERE: 'WHERE',

  // Reset device
  RESET: 'RESET',

  // Enable / disable SMS alerts
  ALERT_ON: 'ALERT,1',
  ALERT_OFF: 'ALERT,0',

  // Speed limit alert (km/h, 0 = disabled)
  SPEED_LIMIT: speed => `SPEED,${speed}`,

  // APN configuration
  APN: (apn, user = '', pass = '') => `APN,${apn},${user},${pass}`,

  // Server IP/port configuration
  SERVER: (ip, port) => `SERVER,0,${ip},${port},0`
});

/** Lifecycle statuses stored in the device_commands table */
export const COMMAND_STATUS = Object.freeze({
  PENDING: 'pending',
  SENT: 'sent',
  ACKNOWLEDGED: 'acknowledged',
  FAILED: 'failed'
});
