import express from 'express';
const adminRoutes = express.Router({ mergeParams: true });
import validate from 'express-joi-validator';

import { catchValidationErrors, authenticateAdmin } from '../middleware/index';
import { admin } from '../validations/index';
import { createAdAdmin, createBannerAdmin, createCategoryAdmin, createOptionAdmin, createSubCategoryAdmin, deleteAdAdmin, deleteBannerAdmin, deleteBusinessAdmin, deleteCategoryAdmin, deleteSubCategoryAdmin, deleteUserAdmin, getAdsListAdmin, getAvaailedBusinessListAdmin, getBannersListAdmin, getBusinessListAdmin, getCategoryListAdmin, getDashboardAdmin, getMatrimonialListAdmin, getOptionsListAdmin, getSubCategoryListAdmin, getUsersListAdmin, updateAdAdmin, updateBannerAdmin, updateBusinessAdmin, updateCategoryAdmin, updateImageAdmin, updateMatrimonialAdmin, updateMediaAdmin, updateOptionAdmin, updateSubCategoryAdmin, updateUserAdmin } from '../controller';



/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     description: Get Admin dashboard
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Admin Users
 *     responses:
 *       200:
 *         description: Leads list
 */
adminRoutes.get(
  '/dashboard',
  authenticateAdmin,
  catchValidationErrors,
  getDashboardAdmin
);


/**
 * @swagger
 * /admin/users:
 *   get:
 *     description: Get Users List
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Admin Users
 *     parameters:
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
 *       - name: status
 *         description: Status (NEW | REJECTED | APPROVED | MAX_QUOTES).
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Leads list
 */
adminRoutes.get(
  '/users',
  authenticateAdmin,
  validate(admin.getUsersList),
  catchValidationErrors,
  getUsersListAdmin
);



/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     description: Update User
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Admin Users
 *     parameters:
 *       - name: rating
 *         description: Rating.
 *         in: formData
 *         required: true
 *         type: number
 *       - name: User
 *         description: Enter User.
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: User Details
 */
adminRoutes.put(
  '/users/:id',
  authenticateAdmin,
  validate(admin.updateUser),
  catchValidationErrors,
  updateUserAdmin
);



/**
 * @swagger
 * /admin/businesses:
 *   get:
 *     description: Get Business List
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Admin Business
 *     parameters:
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
 *       - name: status
 *         description: Status (NEW | REJECTED | APPROVED | MAX_QUOTES).
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Leads list
 */
adminRoutes.get(
  '/businesses',
  authenticateAdmin,
  validate(admin.getBusinessList),
  catchValidationErrors,
  getBusinessListAdmin
);


/**
 * @swagger
 * /admin/businesses/availed:
 *   get:
 *     description: Get Availed Business List
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Admin Business
 *     parameters:
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
 *       - name: status
 *         description: Status (NEW | REJECTED | APPROVED | MAX_QUOTES).
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Leads list
 */
adminRoutes.get(
  '/businesses/availed',
  authenticateAdmin,
  validate(admin.getAvaailedBusinessList),
  catchValidationErrors,
  getAvaailedBusinessListAdmin
);



/**
 * @swagger
 * /admin/businesses/{id}:
 *   put:
 *     description: Update User
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Admin Business
 *     parameters:
 *       - name: rating
 *         description: Rating.
 *         in: formData
 *         required: true
 *         type: number
 *       - name: User
 *         description: Enter User.
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: User Details
 */
adminRoutes.put(
  '/businesses/:id',
  authenticateAdmin,
  validate(admin.updateBusiness),
  catchValidationErrors,
  updateBusinessAdmin
);



/**
 * @swagger
 * /admin/matrimonials:
 *   get:
 *     description: Get Matrimonials List
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Admin Matrimonials
 *     parameters:
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
 *       - name: status
 *         description: Status (NEW | REJECTED | APPROVED | MAX_QUOTES).
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Leads list
 */
adminRoutes.get(
  '/matrimonials',
  authenticateAdmin,
  validate(admin.getMatrimonialsList),
  catchValidationErrors,
  getMatrimonialListAdmin
);



/**
 * @swagger
 * /admin/matrimonials/{id}:
 *   put:
 *     description: Update Matrimonial
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Admin Matrimonials
 *     parameters:
 *       - name: rating
 *         description: Rating.
 *         in: formData
 *         required: true
 *         type: number
 *       - name: Matrimonial
 *         description: Enter Matrimonial.
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: Matrimonial Details
 */
adminRoutes.put(
  '/matrimonials/:id',
  authenticateAdmin,
  validate(admin.updateMatrimonial),
  catchValidationErrors,
  updateMatrimonialAdmin
);




/**
 * @swagger
 * /admin/banners:
 *   post:
 *     description: Create Banners
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Admin Ads
 *     responses:
 *       200:
 *         description: Create Banners
 */
adminRoutes.post(
  '/banners',
  authenticateAdmin,
  catchValidationErrors,
  createBannerAdmin
);

/**
 * @swagger
 * /admin/banners:
 *   get:
 *     description: Get Banners List
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Admin Banners
 *     parameters:
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
 *       - name: status
 *         description: Status (NEW | REJECTED | APPROVED | MAX_QUOTES).
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Leads list
 */
adminRoutes.get(
  '/banners',
  authenticateAdmin,
  validate(admin.getBannerList),
  catchValidationErrors,
  getBannersListAdmin
);



/**
 * @swagger
 * /admin/banners/{id}:
 *   put:
 *     description: Update Banner
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Admin Banners
 *     parameters:
 *       - name: rating
 *         description: Rating.
 *         in: formData
 *         required: true
 *         type: number
 *       - name: Banner
 *         description: Enter Banner.
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: Banner Details
 */
adminRoutes.put(
  '/banners/:id',
  authenticateAdmin,
  validate(admin.updateBanner),
  catchValidationErrors,
  updateBannerAdmin
);


/**
 * @swagger
 * /admin/banners/{id}:
 *   delete:
 *     description: Delete Banner
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Admin Banners
 *     parameters:
 *       - name: rating
 *         description: Rating.
 *         in: formData
 *         required: true
 *         type: number
 *       - name: Banner
 *         description: Enter Banner.
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: Banner Details
 */
adminRoutes.delete(
  '/banners/:id',
  authenticateAdmin,
  validate(admin.idOnly),
  catchValidationErrors,
  deleteBannerAdmin
);


/**
 * @swagger
 * /admin/categories:
 *   get:
 *     description: Get Categories List
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Admin Categories
 *     parameters:
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
 *       - name: status
 *         description: Status (NEW | REJECTED | APPROVED | MAX_QUOTES).
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Leads list
 */
adminRoutes.get(
  '/categories',
  authenticateAdmin,
  validate(admin.getCategoryList),
  catchValidationErrors,
  getCategoryListAdmin
);



/**
 * @swagger
 * /admin/categories/{id}:
 *   post:
 *     description: Create Category
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Admin Categories
 *     parameters:
 *       - name: rating
 *         description: Rating.
 *         in: formData
 *         required: true
 *         type: number
 *       - name: Category
 *         description: Enter Matrimonial.
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: Category Details
 */
adminRoutes.post(
  '/categories',
  authenticateAdmin,
  validate(admin.createCategory),
  catchValidationErrors,
  createCategoryAdmin
);

/**
 * @swagger
 * /admin/categories/{id}:
 *   put:
 *     description: Update Matrimonial
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Admin Categories
 *     parameters:
 *       - name: rating
 *         description: Rating.
 *         in: formData
 *         required: true
 *         type: number
 *       - name: Matrimonial
 *         description: Enter Matrimonial.
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: Matrimonial Details
 */
adminRoutes.put(
  '/categories/:id',
  authenticateAdmin,
  validate(admin.updateCategory),
  catchValidationErrors,
  updateCategoryAdmin
);



/**
 * @swagger
 * /admin/sub-categories:
 *   get:
 *     description: Get Sub Categories List
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Admin Categories
 *     parameters:
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
 *       - name: status
 *         description: Status (NEW | REJECTED | APPROVED | MAX_QUOTES).
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Leads list
 */
adminRoutes.get(
  '/sub-categories',
  authenticateAdmin,
  validate(admin.getSubCategoryList),
  catchValidationErrors,
  getSubCategoryListAdmin
);



/**
 * @swagger
 * /admin/sub-categories:
 *   post:
 *     description: Create Sub Category
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Admin Categories
 *     parameters:
 *       - name: rating
 *         description: Rating.
 *         in: formData
 *         required: true
 *         type: number
 *       - name: Matrimonial
 *         description: Enter Matrimonial.
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: Matrimonial Details
 */
adminRoutes.post(
  '/sub-categories',
  authenticateAdmin,
  validate(admin.createSubCategory),
  catchValidationErrors,
  createSubCategoryAdmin
);

/**
 * @swagger
 * /admin/sub-categories/{id}:
 *   put:
 *     description: Update Matrimonial
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Admin Categories
 *     parameters:
 *       - name: rating
 *         description: Rating.
 *         in: formData
 *         required: true
 *         type: number
 *       - name: Matrimonial
 *         description: Enter Matrimonial.
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: Matrimonial Details
 */
adminRoutes.put(
  '/sub-categories/:id',
  authenticateAdmin,
  validate(admin.updateSubCategory),
  catchValidationErrors,
  updateSubCategoryAdmin
);



/**
 * @swagger
 * /admin/upload/{id}:
 *   put:
 *     description: Update Images
 *     summary: Update Images
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Admin
*     parameters:
 *       - name: file_name
 *         description: File Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: profile_image
 *         description: Images
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Dashboard
 */
adminRoutes.put(
  '/upload/:id',
  authenticateAdmin,
  validate(admin.updateMedia),
  catchValidationErrors,
  updateMediaAdmin
);



/**
 * @swagger
 * /admin/dashboard:
 *   post:
 *     description: Create Ad
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Admin Ads
 *     responses:
 *       200:
 *         description: Create Ads
 */
adminRoutes.post(
  '/ads',
  authenticateAdmin,
  catchValidationErrors,
  createAdAdmin
);


/**
 * @swagger
 * /admin/ads:
 *   get:
 *     description: Get Banners List
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Admin Ads
 *     parameters:
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
 *       - name: status
 *         description: Status (NEW | REJECTED | APPROVED | MAX_QUOTES).
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Leads list
 */
adminRoutes.get(
  '/ads',
  authenticateAdmin,
  validate(admin.getAdList),
  catchValidationErrors,
  getAdsListAdmin
);



/**
 * @swagger
 * /admin/ads/{id}:
 *   put:
 *     description: Update Ad
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Admin Ads
 *     parameters:
 *       - name: rating
 *         description: Rating.
 *         in: formData
 *         required: true
 *         type: number
 *       - name: Ad
 *         description: Enter Ad.
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: Ad Details
 */
adminRoutes.put(
  '/ads/:id',
  authenticateAdmin,
  validate(admin.updateAd),
  catchValidationErrors,
  updateAdAdmin
);


/**
 * @swagger
 * /admin/ads/{id}:
 *   delete:
 *     description: Delete Ad
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Admin Ads
 *     parameters:
 *       - name: rating
 *         description: Rating.
 *         in: formData
 *         required: true
 *         type: number
 *       - name: Banner
 *         description: Enter Banner.
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: Banner Details
 */
adminRoutes.delete(
  '/ads/:id',
  authenticateAdmin,
  validate(admin.idOnly),
  catchValidationErrors,
  deleteAdAdmin
);




/**
 * @swagger
 * /admin/options:
 *   post:
 *     description: Create Ad
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Admin Ads
 *     responses:
 *       200:
 *         description: Create Ads
 */
adminRoutes.post(
  '/options',
  authenticateAdmin,
  catchValidationErrors,
  createOptionAdmin
);


/**
 * @swagger
 * /admin/options:
 *   get:
 *     description: Get Option List
 *     security:
 *     - Bearer: []
 *     tags:
 *     - Admin Ads
 *     parameters:
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
 *       - name: status
 *         description: Status (NEW | REJECTED | APPROVED | MAX_QUOTES).
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Leads list
 */
adminRoutes.get(
  '/options',
  authenticateAdmin,
  catchValidationErrors,
  getOptionsListAdmin
);



/**
 * @swagger
 * /admin/options/{id}:
 *   put:
 *     description: Update Options
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Admin Ads
 *     parameters:
 *       - name: rating
 *         description: Rating.
 *         in: formData
 *         required: true
 *         type: number
 *       - name: Option
 *         description: Enter Option.
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: Option Details
 */
adminRoutes.put(
  '/options',
  authenticateAdmin,
  // validate(admin.updateOption),
  catchValidationErrors,
  updateOptionAdmin
);


/**
 * @swagger
 * /admin/categories/{id}:
 *   delete:
 *     description: Delete Category
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Admin Category
 *     parameters:
 *       - name: rating
 *         description: Rating.
 *         in: formData
 *         required: true
 *         type: number
 *       - name: Banner
 *         description: Enter Banner.
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: Banner Details
 */
adminRoutes.delete(
  '/categories/:id',
  authenticateAdmin,
  validate(admin.idOnly),
  catchValidationErrors,
  deleteCategoryAdmin
);

/**
 * @swagger
 * /admin/sub-categories/{id}:
 *   delete:
 *     description: Delete Category
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Admin Category
 *     parameters:
 *       - name: rating
 *         description: Rating.
 *         in: formData
 *         required: true
 *         type: number
 *       - name: Banner
 *         description: Enter Banner.
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: Banner Details
 */
adminRoutes.delete(
  '/sub-categories/:id',
  authenticateAdmin,
  validate(admin.idOnly),
  catchValidationErrors,
  deleteSubCategoryAdmin
);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     description: Delete User
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Admin User
 *     parameters:
 *       - name: rating
 *         description: Rating.
 *         in: formData
 *         required: true
 *         type: number
 *       - name: Banner
 *         description: Enter User.
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: User Details
 */ 
adminRoutes.delete(
  '/users/:id',
  authenticateAdmin,
  validate(admin.idOnly),
  catchValidationErrors,
  deleteUserAdmin
);

/**
 * @swagger
 * /admin/businesses/{id}:
 *   delete:
 *     description: Delete Business
 *     security:
 *     - Bearer: []
 *     tags:
 *     -  Admin Business
 *     parameters:
 *       - name: rating
 *         description: Rating.
 *         in: formData
 *         required: true
 *         type: number
 */
adminRoutes.delete(
  '/businesses/:id',
  authenticateAdmin,
  validate(admin.idOnly),
  catchValidationErrors,
  deleteBusinessAdmin
);

export default adminRoutes;