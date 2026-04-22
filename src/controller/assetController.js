import logger from '../config/logger';
import {
  OK,
  CREATED,
  SERVER_ERROR,
  OFFSET,
  PAGE_LIMIT
} from '../constants';
import {
  getAllAssets,
  getAssetDetail,
  createAssets,
  updateAssetDetail,
  deleteAssets,
  mapDeviceToAssetService,
  unassignDeviceFromAssetService
} from '../service';

export const getAssetList = async (req, res) => {
  let {
    query: { search, page, limit, sortByName },
    auth: { user_id }
  } = req;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;
  try {
    const filter = { user_id };
    const assetList = await getAllAssets({
      search,
      offset: page,
      limit,
      sortByName,
      filter
    });
    return res.status(OK).json(assetList);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const getAssetDetails = async (req, res) => {
  const {
    auth: { user_id },
    params: { id }
  } = req;
  try {
    const detail = await getAssetDetail(id, user_id);
    return res.status(OK).json(detail);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const createAsset = async (req, res) => {
  try {
    const {
      auth: { user_id },
      body
    } = req;
    const created = await createAssets(body, user_id);
    return res.status(CREATED).json(created);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const updateAsset = async (req, res) => {
  const {
    body,
    auth: { user_id },
    params: { id }
  } = req;
  try {
    const updated = await updateAssetDetail(id, body, user_id);
    return res.status(OK).json(updated);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const deleteAsset = async (req, res) => {
  const {
    auth: { user_id },
    params: { id }
  } = req;
  try {
    const result = await deleteAssets(id, user_id);
    return res.status(OK).json(result);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const mapDeviceToAsset = async (req, res) => {
  const {
    auth: { user_id },
    params: { id },
    body: { device_id }
  } = req;
  try {
    const result = await mapDeviceToAssetService(id, device_id, user_id);
    return res.status(OK).json(result);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const unassignDeviceFromAsset = async (req, res) => {
  const {
    auth: { user_id },
    params: { id },
    body: { device_id }
  } = req;
  try {
    const result = await unassignDeviceFromAssetService(id, device_id, user_id);
    return res.status(OK).json(result);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};