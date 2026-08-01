/**
 * Waiters so sendDeviceCommand can await the device 0x15/0x21 reply
 * parsed by tcpGpsListener on the same TCP socket.
 */

const waiters = new Map();

const keyFor = (deviceId, serverFlag) =>
  `${String(deviceId)}:${String(serverFlag || '').toLowerCase()}`;

export const waitForCommandReply = (deviceId, serverFlag, timeoutMs = 15000) => {
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
    raw: commandResponse.raw || null
  });
  return true;
};
