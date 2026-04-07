import logger from '../config/logger';
import {
  OK,
  CREATED,
  SERVER_ERROR,
  OFFSET,
  PAGE_LIMIT
} from '../constants';
import {
  getAllHardwareDevices,
  getHardwareDeviceDetail,
  createHardwareDevices,
  updateHardwareDeviceDetail,
  deleteHardwareDevices
} from '../service/hardwareDeviceService';

export const getHardwareDeviceList = async (req, res) => {
  let {
    query: { search, page, limit, sortByName },
    auth: { user_id }
  } = req;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;
  try {
    const filter = { user_id };
    const hardwareDeviceList = await getAllHardwareDevices({
      search,
      offset: page,
      limit,
      sortByName,
      filter
    });
    return res.status(OK).json(hardwareDeviceList);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const getHardwareDeviceDetails = async (req, res) => {
  const {
    auth: { user_id },
    params: { id }
  } = req;
  try {
    const detail = await getHardwareDeviceDetail(id, user_id);
    return res.status(OK).json(detail);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const createHardwareDevice = async (req, res) => {
  try {
    const {
      auth: { user_id },
      body
    } = req;
    const created = await createHardwareDevices(body, user_id);
    return res.status(CREATED).json(created);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const updateHardwareDevice = async (req, res) => {
  const {
    body,
    auth: { user_id },
    params: { id }
  } = req;
  try {
    const updated = await updateHardwareDeviceDetail(id, body, user_id);
    return res.status(OK).json(updated);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const deleteHardwareDevice = async (req, res) => {
  const {
    auth: { user_id },
    params: { id }
  } = req;
  try {
    const result = await deleteHardwareDevices(id, user_id);
    return res.status(OK).json(result);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};
