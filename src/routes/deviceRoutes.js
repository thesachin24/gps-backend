import express from 'express';
import validate from 'express-joi-validator';
import { catchValidationErrors, authenticate } from '../middleware/index';
import {
  createDevice,
  deleteDevice,
  getAllDeviceLocationList,
  getDeviceDetails,
  getDeviceList,
  getDeviceTrips,
  updateDevice
} from '../controller';
import { device } from '../validations';

const deviceRoutes = express.Router({ mergeParams: true });

/**
 * @swagger
 * /devices:
 *   get:
 *     description: List devices for the authenticated user
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Device
 */
deviceRoutes.get(
  '/',
  authenticate,
  validate(device.getDeviceList),
  catchValidationErrors,
  getDeviceList
);

/**
 * @swagger
 * /devices:
 *   post:
 *     description: Register a device
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Device
 */
deviceRoutes.post(
  '/',
  authenticate,
  validate(device.createDevice),
  catchValidationErrors,
  createDevice
);

/**
 * @swagger
 * /devices/{id}:
 *   get:
 *     description: Get device by id
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Device
 */
deviceRoutes.get(
  '/:id',
  authenticate,
  validate(device.idOnly),
  catchValidationErrors,
  getDeviceDetails
);

/**
 * @swagger
 * /devices/{id}/locations:
 *   get:
 *     description: Get device locations by id
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Device
 */
deviceRoutes.get(
  '/:id/locations',
  authenticate,
  validate(device.getDeviceLocations),
  catchValidationErrors,
  getAllDeviceLocationList
);

/**
 * @swagger
 * /devices/{id}/trips:
 *   get:
 *     description: Get device trips by id
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Device
 */
deviceRoutes.get(
  '/:id/trips',
  authenticate,
  validate(device.getDeviceTrips),
  catchValidationErrors,
  getDeviceTrips
);

/**
 * @swagger
 * /devices/{id}:
 *   put:
 *     description: Update device
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Device
 */
deviceRoutes.put(
  '/:id',
  authenticate,
  validate(device.updateDevice),
  catchValidationErrors,
  updateDevice
);

/**
 * @swagger
 * /devices/{id}:
 *   delete:
 *     description: Delete device
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Device
 */
deviceRoutes.delete(
  '/:id',
  authenticate,
  validate(device.idOnly),
  catchValidationErrors,
  deleteDevice
);

export default deviceRoutes;
