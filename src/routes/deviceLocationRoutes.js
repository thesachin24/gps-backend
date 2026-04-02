import express from 'express';
import validate from 'express-joi-validator';
import { catchValidationErrors, authenticate } from '../middleware/index';
import {
  createDeviceLocation,
  deleteDeviceLocation,
  getDeviceLocationDetails,
  updateDeviceLocation
} from '../controller';
import { deviceLocation } from '../validations';

const deviceLocationRoutes = express.Router({ mergeParams: true });

deviceLocationRoutes.post(
  '/',
  authenticate,
  validate(deviceLocation.createDeviceLocation),
  catchValidationErrors,
  createDeviceLocation
);

deviceLocationRoutes.get(
  '/:id',
  authenticate,
  validate(deviceLocation.idOnly),
  catchValidationErrors,
  getDeviceLocationDetails
);

deviceLocationRoutes.put(
  '/:id',
  authenticate,
  validate(deviceLocation.updateDeviceLocation),
  catchValidationErrors,
  updateDeviceLocation
);

deviceLocationRoutes.delete(
  '/:id',
  authenticate,
  validate(deviceLocation.idOnly),
  catchValidationErrors,
  deleteDeviceLocation
);

export default deviceLocationRoutes;
