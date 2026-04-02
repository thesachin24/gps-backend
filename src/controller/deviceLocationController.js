import logger from '../config/logger';
import { OK, CREATED, SERVER_ERROR } from '../constants';
import {
  createDeviceLocations,
  deleteDeviceLocations,
  getDeviceLocationDetail,
  updateDeviceLocationDetail
} from '../service/deviceLocationService';

export const createDeviceLocation = async (req, res) => {
  const { body } = req;
  try {
    const response = await createDeviceLocations(body);
    return res.status(CREATED).json(response);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const getDeviceLocationDetails = async (req, res) => {
  const { params: { id } } = req;
  try {
    const response = await getDeviceLocationDetail(id);
    return res.status(OK).json(response);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const updateDeviceLocation = async (req, res) => {
  const { params: { id }, body } = req;
  try {
    const response = await updateDeviceLocationDetail(id, body);
    return res.status(OK).json(response);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const deleteDeviceLocation = async (req, res) => {
  const { params: { id } } = req;
  try {
    const response = await deleteDeviceLocations(id);
    return res.status(OK).json(response);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};
