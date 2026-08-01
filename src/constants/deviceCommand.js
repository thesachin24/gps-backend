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
 * Raw GT06 ASCII commands written into the 0x80 packet.
 * Trailing `#` is required (SMS-compatible command content).
 */
export const RAW_COMMANDS = Object.freeze({
  // ET06 V1.8 §6.4 / §6.5 — reply protocol 0x15 e.g. "DYD=Success!"
  // Appendix online examples use password form DYD,000000#
  RELAY_ON: 'DYD,000000#',
  RELAY_OFF: 'HFYD,000000#',
  DYD: 'DYD,000000#',
  HFYD: 'HFYD,000000#',
  DYD_NOPASS: 'DYD#',
  HFYD_NOPASS: 'HFYD#',
  // Older GT06 clones (Traccar default)
  RELAY_ON_ALT: 'Relay,1#',
  RELAY_OFF_ALT: 'Relay,0#',

  // Query current device status (returns terminalInfo + relay state on many devices)
  CHECK: 'CHECK#',
  PARAM: 'PARAM#',
  STATUS: 'CHECK#',

  // Server time sync request
  TIME_SYNC: 'TIME#',

  // Request current location
  WHERE: 'WHERE#',

  // Reset device
  RESET: 'RESET#',

  // Enable / disable SMS alerts
  ALERT_ON: 'ALERT,1#',
  ALERT_OFF: 'ALERT,0#',

  // Speed limit alert (km/h, 0 = disabled)
  SPEED_LIMIT: speed => `SPEED,${speed}#`,

  // APN configuration
  APN: (apn, user = '', pass = '') => `APN,${apn},${user},${pass}#`,

  // Server IP/port configuration
  SERVER: (ip, port) => `SERVER,0,${ip},${port},0#`
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
  'dyd=success',
  'dyd=Success',
  'cut off the fuel supply',
  'fuel supply cut',
  'relay,1',
  'relay on',
  'relay open',
  'armed',
  'cut off',
  'acc off',
  'oil cut',
  'dy1'
]);

/**
 * Command response strings that indicate relay is OFF (engine restored).
 */
export const RELAY_OFF_RESPONSES = Object.freeze([
  'hfyd=success',
  'hfyd=Success',
  'restore fuel supply',
  'restore fuel',
  'relay,0',
  'relay off',
  'relay close',
  'disarmed',
  'restore',
  'resume',
  'acc on',
  'oil resume',
  'dy0'
]);
