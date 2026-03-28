import express from 'express';
const bannerRoutes = express.Router({ mergeParams: true });
import validate from 'express-joi-validator';

import { catchValidationErrors, authenticate } from '../middleware/index';
import { banner } from '../validations/index';
import {
  createBanner,
  createBannerMedia,
  deleteBanner,
  getBannerDetails,
  getBannerList,
  updateBanner,
  updateBannerMedia
} from '../controller';

/**
 * @swagger
 * /banners:
 *   get:
 *     description: Get Banner List
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Banner
 *     parameters:
 *       - name: category_id
 *         description: Category ID.
 *         in: query
 *         type: string
 *       - name: search
 *         description: text to search.
 *         in: query
 *         type: string
 *       - name: page
 *         description: page index number.
 *         in: query
 *         type: number
 *       - name: limit
 *         description: page offset.
 *         in: query
 *         type: number
 *       - name: search
 *         description: Keyword search.
 *         in: query
 *         type: string
 *       - name: sortByName
 *         description: Sort data by Banner name (asc, desc).
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Banners list
 */
bannerRoutes.get(
  '/',
  authenticate,
  validate(banner.getBannerList),
  catchValidationErrors,
  getBannerList
);


/**
 * @swagger
 * /banners/{id}:
 *   get:
 *     description: Get Banners Details by id
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Banner
 *     parameters:
 *       - name: id
 *         description: Banner ID
 *         required: true
 *         in: path
 *         type: number
 *     responses:
 *       200:
 *         description: Successful operation
 */
 bannerRoutes.get(
  '/:id',
  authenticate,
  validate(banner.idOnly),
  catchValidationErrors,
  getBannerDetails
);


/**
 * @swagger
 * /banners:
 *   post:
 *     description: Create Banner
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Banner
 *     parameters:
 *       - name: rating
 *         description: Rating.
 *         in: formData
 *         required: true
 *         type: number
 *       - name: banner
 *         description: Enter Banner.
 *         in: formData
 *         type: string
 *     responses:
 *       201:
 *         description: Banner Details
 */
bannerRoutes.post(
  '/',
  authenticate,
  validate(banner.createBanner),
  catchValidationErrors,
  createBanner
);


/**
 * @swagger
 * /banners/{id}:
 *   put:
 *     description: Update Banner Details
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Banner
 *     parameters:
 *       - name: rating
 *         description: Rating.
 *         in: formData
 *         required: true
 *         type: number
 *       - name: banner
 *         description: Enter Banner.
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: Banner Details
 */
bannerRoutes.put(
  '/:id',
  authenticate,
  validate(banner.updateBanner),
  catchValidationErrors,
  updateBanner
);


/**
 * @swagger
 * /banners/upload/{id}:
 *   put:
 *     description: Update Banner Picture
 *     summary: Update Banner Picture
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Banner
*     parameters:
 *       - name: file_name
 *         description: File Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: cover_image
 *         description: Banner Image
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Dashboard
 */
bannerRoutes.put(
  '/upload/:id',
  validate(banner.updateMedia),
  catchValidationErrors,
  authenticate,
  updateBannerMedia
);


// From App
/**
 * @swagger
 * /banners/upload/{business_id}:
 *   post:
 *     description: Create Banner Picture
 *     summary: Create Banner Picture
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Banner
*     parameters:
 *       - name: file_name
 *         description: File Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: cover_image
 *         description: Banner Image
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Dashboard
 */
bannerRoutes.post(
  '/upload',
  validate(banner.createBannerMedia),
  catchValidationErrors,
  authenticate,
  createBannerMedia
);


/**
 * @swagger
 * /banners/{id}:
 *   delete:
 *     description: Delete Banner Details
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Banner
 *     parameters:
 *       - name: id
 *         description: Banner ID.
 *         in: path
 *         required: true
 *         type: number
 *     responses:
 *       204:
 *         description: Delete Banner Details
 */
bannerRoutes.delete(
  '/:id',
  authenticate,
  validate(banner.idOnly),
  catchValidationErrors,
  deleteBanner
);

export default bannerRoutes;
