/**
 * In-process waiters so sendDeviceCommand can await the device reply
 * that arrives on the same TCP socket (parsed by tcpGpsListener).
 *
 * Devices may reply with:
 *   - 0x15 / 0x17 string command response (server_flag echo)
 *   - 0x16 / 0x24 relay_event (armed / disarmed) — common for RELAY
 */

const waiters = new Map();

const keyFor = (deviceId, serverFlag) =>
  `${String(deviceId)}:${String(serverFlag || '').toLowerCase()}`;

export const hasActiveWaiter = deviceId => {
  if (!deviceId) return false;
  const id = String(deviceId);
  for (const w of waiters.values()) {
    if (w.deviceId === id) return true;
  }
  return false;
};

/**
 * Register a waiter before writing the 0x80 command.
 * Resolves with { serverFlag, content, raw, source } or null on timeout.
 */
export const waitForCommandReply = (deviceId, serverFlag, timeoutMs = 12000) => {
  if (!deviceId) return Promise.resolve(null);

  const key = keyFor(deviceId, serverFlag);
  const existing = waiters.get(key);
  if (existing) {
    clearTimeout(existing.timer);
    existing.resolve(null);
    waiters.delete(key);
  }

  return new Promise(resolve => {
    const timer = setTimeout(() => {
      waiters.delete(key);
      resolve(null);
    }, timeoutMs);

    waiters.set(key, {
      resolve,
      timer,
      deviceId: String(deviceId),
      serverFlag: String(serverFlag || '').toLowerCase()
    });
  });
};

/**
 * Resolve a pending sendDeviceCommand waiter.
 * Matches by server_flag first, then any open waiter for the device.
 */
export const resolveCommandReply = (deviceId, commandResponse = {}) => {
  if (!deviceId) return false;

  const flag = String(commandResponse.serverFlag || '').toLowerCase();
  const key = keyFor(deviceId, flag);
  let entryKey = null;
  let waiter = null;

  if (flag && waiters.has(key)) {
    entryKey = key;
    waiter = waiters.get(key);
  } else {
    for (const [k, w] of waiters.entries()) {
      if (w.deviceId === String(deviceId)) {
        entryKey = k;
        waiter = w;
        break;
      }
    }
  }

  if (!waiter || !entryKey) return false;

  waiters.delete(entryKey);
  clearTimeout(waiter.timer);
  waiter.resolve({
    serverFlag: commandResponse.serverFlag || waiter.serverFlag || null,
    content: commandResponse.content || '',
    raw: commandResponse.raw || null,
    source: commandResponse.source || 'command_response'
  });
  return true;
};
