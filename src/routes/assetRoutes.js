import express from 'express';
import validate from 'express-joi-validator';
import { catchValidationErrors, authenticate } from '../middleware/index';
import {
  createAsset,
  deleteAsset,
  getAssetDetails,
  getAssetList,
  mapDeviceToAsset,
  unassignDeviceFromAsset,
  updateAsset
} from '../controller';
import { asset } from '../validations';

const assetRoutes = express.Router({ mergeParams: true });

/**
 * @swagger
 * /assets:
 *   get:
 *     description: List assets for the authenticated user
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Asset
 */
assetRoutes.get(
  '/',
  authenticate,
  validate(asset.getAssetList),
  catchValidationErrors,
  getAssetList
);

/**
 * @swagger
 * /assets:
 *   post:
 *     description: Create an asset
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Asset
 */
assetRoutes.post(
  '/',
  authenticate,
  validate(asset.createAsset),
  catchValidationErrors,
  createAsset
);

/**
 * @swagger
 * /assets/{id}:
 *   get:
 *     description: Get asset by id
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Asset
 */
assetRoutes.get(
  '/:id',
  authenticate,
  validate(asset.idOnly),
  catchValidationErrors,
  getAssetDetails
);

/**
 * @swagger
 * /assets/{id}:
 *   put:
 *     description: Update asset
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Asset
 */
assetRoutes.put(
  '/:id',
  authenticate,
  validate(asset.updateAsset),
  catchValidationErrors,
  updateAsset
);

/**
 * @swagger
 * /assets/{id}:
 *   delete:
 *     description: Delete asset
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Asset
 */
assetRoutes.delete(
  '/:id',
  authenticate,
  validate(asset.idOnly),
  catchValidationErrors,
  deleteAsset
);

/**
 * @swagger
 * /assets/{id}/map-device:
 *   post:
 *     description: Map a device to an asset
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Asset
 */
assetRoutes.post(
  '/:id/map-device',
  authenticate,
  validate(asset.mapDeviceToAsset),
  catchValidationErrors,
  mapDeviceToAsset
);

/**
 * @swagger
 * /assets/{id}/unassign-device:
 *   post:
 *     description: Unassign a device from an asset
 *     security:
 *       - Bearer: []
 *     tags:
 *       - Asset
 */
assetRoutes.post(
  '/:id/unassign-device',
  authenticate,
  validate(asset.unassignDeviceFromAsset),
  catchValidationErrors,
  unassignDeviceFromAsset
);

export default assetRoutes;
