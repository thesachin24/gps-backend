/**
 * In-process waiters so sendDeviceCommand can await the device's 0x17 reply
 * that arrives on the same TCP socket (parsed by tcpGpsListener).
 */

const waiters = new Map();

const keyFor = (deviceId, serverFlag) =>
  `${String(deviceId)}:${String(serverFlag || '').toLowerCase()}`;

/**
 * Register a waiter before writing the 0x80 command.
 * Resolves with { serverFlag, content, raw } or null on timeout.
 */
export const waitForCommandReply = (deviceId, serverFlag, timeoutMs = 8000) => {
  if (!deviceId) return Promise.resolve(null);

  const key = keyFor(deviceId, serverFlag);
  // Replace any previous waiter for same flag
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

    waiters.set(key, { resolve, timer, deviceId: String(deviceId) });
  });
};

/**
 * Called from tcpGpsListener when a 0x15/0x17 commandResponse is parsed.
 * @returns {boolean} true if a sendDeviceCommand waiter was waiting
 */
export const resolveCommandReply = (deviceId, commandResponse) => {
  if (!deviceId || !commandResponse) return false;

  const flag = String(commandResponse.serverFlag || '').toLowerCase();
  const key = keyFor(deviceId, flag);
  let waiter = waiters.get(key);

  // Fallback: latest waiter for this device (some firmwares echo wrong flag)
  if (!waiter) {
    for (const [k, w] of waiters.entries()) {
      if (w.deviceId === String(deviceId)) {
        waiter = w;
        waiters.delete(k);
        break;
      }
    }
  } else {
    waiters.delete(key);
  }

  if (!waiter) return false;

  clearTimeout(waiter.timer);
  waiter.resolve({
    serverFlag: commandResponse.serverFlag || null,
    content: commandResponse.content || '',
    raw: commandResponse.raw || null
  });
  return true;
};
