import logger from '../config/logger';
import {
  OK,
  CREATED,
  SERVER_ERROR,
  OFFSET,
  PAGE_LIMIT
} from '../constants';
import {
  getAllGeofences,
  getGeofenceDetail,
  createGeofences,
  updateGeofenceDetail,
  deleteGeofences,
  mapDeviceToGeofenceService,
  unassignDeviceFromGeofenceService,
  mapAssetToGeofenceService,
  unassignAssetFromGeofenceService
} from '../service';

export const getGeofenceList = async (req, res) => {
  let {
    query: { search, page, limit, sortByName },
    auth: { user_id }
  } = req;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;
  try {
    const filter = { user_id };
    const geofenceList = await getAllGeofences({
      search,
      offset: page,
      limit,
      sortByName,
      filter
    });
    return res.status(OK).json(geofenceList);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const getGeofenceDetails = async (req, res) => {
  const {
    auth: { user_id },
    params: { id }
  } = req;
  try {
    const detail = await getGeofenceDetail(id, user_id);
    return res.status(OK).json(detail);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const createGeofence = async (req, res) => {
  try {
    const {
      auth: { user_id },
      body
    } = req;
    const created = await createGeofences(body, user_id);
    return res.status(CREATED).json(created);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const updateGeofence = async (req, res) => {
  const {
    body,
    auth: { user_id },
    params: { id }
  } = req;
  try {
    const updated = await updateGeofenceDetail(id, body, user_id);
    return res.status(OK).json(updated);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const deleteGeofence = async (req, res) => {
  const {
    auth: { user_id },
    params: { id }
  } = req;
  try {
    const result = await deleteGeofences(id, user_id);
    return res.status(OK).json(result);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const mapAssetToGeofence = async (req, res) => {
  const {
    auth: { user_id },
    params: { id },
    body: { asset_id }
  } = req;
  try {
    const result = await mapAssetToGeofenceService(id, asset_id, user_id);
    return res.status(OK).json(result);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const unassignAssetFromGeofence = async (req, res) => {
  const {
    auth: { user_id },
    params: { id },
    body: { asset_id }
  } = req;
  try {
    const result = await unassignAssetFromGeofenceService(id, asset_id, user_id);
    return res.status(OK).json(result);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};