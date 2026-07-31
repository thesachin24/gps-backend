import express from 'express';
import validate from 'express-joi-validator';
import { catchValidationErrors, authenticate } from '../middleware/index';
import {
  createGeofence,
  deleteGeofence,
  getGeofenceDetails,
  getGeofenceList,
  mapAssetToGeofence,
  unassignAssetFromGeofence,
  updateGeofence
} from '../controller';
import { geofence } from '../validations';

const geofenceRoutes = express.Router({ mergeParams: true });

/**
 * @swagger
 * /geofences:
 *   get:
 *     description: List geofences for the authenticated user
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Geofence
 */
geofenceRoutes.get(
  '/',
  authenticate,
  validate(geofence.getGeofenceList),
  catchValidationErrors,
  getGeofenceList
);

/**
 * @swagger
 * /geofences:
 *   post:
 *     description: Create an geofence
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Geofence
 */
geofenceRoutes.post(
  '/',
  authenticate,
  validate(geofence.createGeofence),
  catchValidationErrors,
  createGeofence
);

/**
 * @swagger
 * /geofences/{id}:
 *   get:
 *     description: Get geofence by id
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Geofence
 */
geofenceRoutes.get(
  '/:id',
  authenticate,
  validate(geofence.idOnly),
  catchValidationErrors,
  getGeofenceDetails
);

/**
 * @swagger
 * /geofences/{id}:
 *   put:
 *     description: Update geofence
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Geofence
 */
geofenceRoutes.put(
  '/:id',
  authenticate,
  validate(geofence.updateGeofence),
  catchValidationErrors,
  updateGeofence
);

/**
 * @swagger
 * /geofences/{id}:
 *   delete:
 *     description: Delete geofence
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Geofence
 */
geofenceRoutes.delete(
  '/:id',
  authenticate,
  validate(geofence.idOnly),
  catchValidationErrors,
  deleteGeofence
);

/**
 * @swagger
 * /geofences/{id}/map-asset:
 *   post:
 *     description: Map a asset to an geofence
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Geofence
 */
geofenceRoutes.post(
  '/:id/map-asset',
  authenticate,
  validate(geofence.mapAssetToGeofence),
  catchValidationErrors,
  mapAssetToGeofence
);

/**
 * @swagger
 * /geofences/{id}/unassign-asset:
 *   post:
 *     description: Unassign a asset from an geofence
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Geofence
 */
geofenceRoutes.post(
  '/:id/unassign-asset',
  authenticate,
  validate(geofence.unassignAssetFromGeofence),
  catchValidationErrors,
  unassignAssetFromGeofence
);

export default geofenceRoutes;
