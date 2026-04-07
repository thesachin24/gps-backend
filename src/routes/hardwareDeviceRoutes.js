import express from 'express';
import validate from 'express-joi-validator';
import { catchValidationErrors, authenticate } from '../middleware/index';
import {
  createHardwareDevice,
  deleteHardwareDevice,
  getHardwareDeviceDetails,
  getHardwareDeviceList,
  updateHardwareDevice
} from '../controller';
import { hardwareDevice } from '../validations';

const hardwareDeviceRoutes = express.Router({ mergeParams: true });

/**
 * @swagger
 * /hardware-devices:
 *   get:
 *     description: List hardware devices for the authenticated user
 *     security:
 *       - Bearer: []
 *     tags:
 *       - HardwareDevice
 */
hardwareDeviceRoutes.get(
  '/',
  authenticate,
  validate(hardwareDevice.getHardwareDeviceList),
  catchValidationErrors,
  getHardwareDeviceList
);

/**
 * @swagger
 * /hardware-devices:
 *   post:
 *     description: Register a hardware device
 *     security:
 *       - Bearer: []
 *     tags:
 *       - HardwareDevice
 */
hardwareDeviceRoutes.post(
  '/',
  authenticate,
  validate(hardwareDevice.createHardwareDevice),
  catchValidationErrors,
  createHardwareDevice
);

/**
 * @swagger
 * /hardware-devices/{id}:
 *   get:
 *     description: Get hardware device by id
 *     security:
 *       - Bearer: []
 *     tags:
 *       - HardwareDevice
 */
hardwareDeviceRoutes.get(
  '/:id',
  authenticate,
  validate(hardwareDevice.idOnly),
  catchValidationErrors,
  getHardwareDeviceDetails
);

/**
 * @swagger
 * /hardware-devices/{id}:
 *   put:
 *     description: Update hardware device
 *     security:
 *       - Bearer: []
 *     tags:
 *       - HardwareDevice
 */
hardwareDeviceRoutes.put(
  '/:id',
  authenticate,
  validate(hardwareDevice.updateHardwareDevice),
  catchValidationErrors,
  updateHardwareDevice
);

/**
 * @swagger
 * /hardware-devices/{id}:
 *   delete:
 *     description: Delete hardware device
 *     security:
 *       - Bearer: []
 *     tags:
 *       - HardwareDevice
 */
hardwareDeviceRoutes.delete(
  '/:id',
  authenticate,
  validate(hardwareDevice.idOnly),
  catchValidationErrors,
  deleteHardwareDevice
);

export default hardwareDeviceRoutes;
