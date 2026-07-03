/**
 * GT06 / GPS device command constants.
 * Use these values in the POST /devices/:id/commands body `command` field,
 * or pass the RAW_COMMANDS values directly.
 */

/** Human-friendly aliases resolved by deviceCommandService before dispatch */
export const COMMAND_ALIASES = Object.freeze({
  RELAY_ON: 'relay_on',
  RELAY_OFF: 'relay_off',
  STATUS: 'status',
  PARAM: 'param'
});

/**
 * Raw GT06 ASCII commands sent over TCP.
 * These are the actual strings written into the GT06 command packet.
 */
export const RAW_COMMANDS = Object.freeze({
  // Relay / immobilizer
  RELAY_ON: 'RELAY,1',
  RELAY_OFF: 'RELAY,0',

  // Query current device status (returns terminalInfo + relay state on many devices)
  CHECK: 'CHECK',
  PARAM: 'PARAM',

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

/**
 * Command response strings that indicate relay is ON (engine cut).
 * Different firmware versions return slightly different strings.
 */
export const RELAY_ON_RESPONSES = Object.freeze([
  'relay,1',
  'relay on',
  'relay open',
  'armed',
  'cut off',
  'acc off',
  'oil cut'
]);

/**
 * Command response strings that indicate relay is OFF (engine restored).
 */
export const RELAY_OFF_RESPONSES = Object.freeze([
  'relay,0',
  'relay off',
  'relay close',
  'disarmed',
  'resume',
  'acc on',
  'oil resume'
]);
