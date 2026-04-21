import logger from '../config/logger';
import {
  OK,
  CREATED,
  SERVER_ERROR,
  OFFSET,
  PAGE_LIMIT
} from '../constants';
import {
  getAllDevices,
  getDeviceDetail,
  createDevices,
  updateDeviceDetail,
  deleteDevices
} from '../service';

export const getDeviceList = async (req, res) => {
  let {
    query: { search, page, limit, sortByName },
    auth: { user_id }
  } = req;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;
  try {
    const filter = { owner_id: user_id, owner_type: 'USER' };
    const deviceList = await getAllDevices({
      search,
      offset: page,
      limit,
      sortByName,
      filter
    });
    return res.status(OK).json(deviceList);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const getDeviceDetails = async (req, res) => {
  const {
    auth: { user_id },
    params: { id }
  } = req;
  try {
    const detail = await getDeviceDetail(id, user_id);
    return res.status(OK).json(detail);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const createDevice = async (req, res) => {
  try {
    const {
      auth: { user_id },
      body
    } = req;
    const created = await createDevices(body, user_id, 'USER');
    return res.status(CREATED).json(created);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const updateDevice = async (req, res) => {
  const {
    body,
    auth: { user_id },
    params: { id }
  } = req;
  try {
    const updated = await updateDeviceDetail(id, body, user_id);
    return res.status(OK).json(updated);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const deleteDevice = async (req, res) => {
  const {
    auth: { user_id },
    params: { id }
  } = req;
  try {
    const result = await deleteDevices(id, user_id);
    return res.status(OK).json(result);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};
