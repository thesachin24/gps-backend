/**
 * In-memory registry that maps a device string ID (IMEI) to the active TCP socket.
 * This lets any part of the backend push a command to a connected device without
 * having to hold a reference to the socket itself.
 */

const registry = new Map();

export const registerSocket = (deviceId, socket) => {
  if (!deviceId || !socket) return;
  registry.set(String(deviceId), socket);
};

export const unregisterSocket = deviceId => {
  if (!deviceId) return;
  registry.delete(String(deviceId));
};

export const getSocket = deviceId => {
  if (!deviceId) return null;
  const socket = registry.get(String(deviceId));
  if (!socket || socket.destroyed) {
    registry.delete(String(deviceId));
    return null;
  }
  return socket;
};

export const isDeviceOnline = deviceId => getSocket(deviceId) !== null;

export const getOnlineDeviceIds = () => Array.from(registry.keys()).filter(id => isDeviceOnline(id));
