import logger from '../config/logger';
import { OK, CREATED, SERVER_ERROR, OFFSET, PAGE_LIMIT } from '../constants';
import { sendDeviceCommand, listDeviceCommands, getDeviceCommandDetail } from '../service/deviceCommandService';
import { getDevice } from '../dao/deviceDao';
import { isDeviceOnline } from '../gps/socketRegistry';
import { MESSAGE_CONSTANTS, NOT_FOUND } from '../constants';

export const sendCommand = async (req, res) => {
  const {
    auth: { user_id },
    params: { id: deviceDbId },
    body: { command }
  } = req;
  try {
    const device = await getDevice({ id: deviceDbId, is_active: true });
    if (!device) {
      return res.status(NOT_FOUND).json({ message: MESSAGE_CONSTANTS.DEVICE_NOT_FOUND });
    }
    const result = await sendDeviceCommand({
      deviceDbId: Number(deviceDbId),
      deviceStringId: device.device_id,
      command,
      userId: user_id
    });
    return res.status(CREATED).json(result);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ message: err.message });
  }
};

export const getCommandList = async (req, res) => {
  const {
    params: { id: deviceDbId },
    query: { page, limit }
  } = req;
  try {
    const result = await listDeviceCommands({ deviceDbId: Number(deviceDbId), page, limit });
    return res.status(OK).json(result);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ message: err.message });
  }
};

export const getCommandDetail = async (req, res) => {
  const {
    params: { id: deviceDbId, commandId }
  } = req;
  try {
    const result = await getDeviceCommandDetail({ commandId, deviceDbId: Number(deviceDbId) });
    return res.status(OK).json(result);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ message: err.message });
  }
};

export const getDeviceOnlineStatus = async (req, res) => {
  const { params: { id: deviceDbId } } = req;
  try {
    const device = await getDevice({ id: deviceDbId, is_active: true });
    if (!device) {
      return res.status(NOT_FOUND).json({ message: MESSAGE_CONSTANTS.DEVICE_NOT_FOUND });
    }
    const online = isDeviceOnline(device.device_id);
    return res.status(OK).json({
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: { device_id: device.device_id, online }
    });
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ message: err.message });
  }
};
