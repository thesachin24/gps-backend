import validate from 'express-joi-validator';
import express from 'express';
const userRoutes = express.Router({ mergeParams: true });
import { catchValidationErrors, authenticate } from '../middleware';
import { user } from '../validations';
import {
  getUserList,
  registerUsers,
  updateUserDetails,
  getUserDetails
} from '../controller';

/**
 * @swagger
 * /users:
 *   get:
 *     description: Get All User List
 *     security:
 *       - Bearer: []
 *     tags:
 *     - User
 *     parameters:
 *       - name: search
 *         description: text to search.
 *         in: query
 *         type: string
 *       - name: startDate
 *         description: Start Date format (YYYY-MM-DD).
 *         in: query
 *         type: string
 *         x-example: '2017-12-09'
 *       - name: endDate
 *         description: End data format (YYYY-MM-DD).
 *         in: query
 *         type: string
 *         x-example: '2019-12-09'
 *       - name: page
 *         description: page index number.
 *         in: query
 *         type: string
 *       - name: limit
 *         description: page offset.
 *         in: query
 *         type: string
 *       - name: sortByName
 *         description: Sort data by User name (ASC, DESC).
 *         in: query
 *         type: string
 *       - name: createdAt
 *         description: Sort data by User name (ASC, DESC).
 *         in: query
 *         type: string
 *       - name: sortByEmail
 *         description: Sort data by user email (ASC, DESC).
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: user list
 */
userRoutes.get(
  '/',
  validate(user.getUsersList),
  // authenticate,
  catchValidationErrors,
  getUserList
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     description: Get User Details by id
 *     security:
 *     - Bearer: []
 *     tags:
 *     - User
 *     parameters:
 *       - name: id
 *         description: User ID
 *         required: true
 *         in: path
 *         type: number
 *     responses:
 *       200:
 *         description: Successful operation
 */
userRoutes.get(
  '/:id',
  // authenticate,
  catchValidationErrors,
  getUserDetails
);

/**
 * @swagger
 * /users:
 *   post:
 *     description: SignUp to the application
 *     tags:
 *     - User
 *     parameters:
 *       - name: firstName
 *         description: user's first name.
 *         in: formData
 *         type: string
 *       - name: lastName
 *         description: user's last name.
 *         in: formData
 *         type: string
 *       - name: password
 *         description: user's password.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: email
 *         description: Email to use for signup.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: countryCode
 *         description: country code of the user.
 *         in: formData
 *         type: string
 *       - name: phone
 *         description: user's phone.
 *         in: formData
 *         type: string
 *       - name: address
 *         description: user's address.
 *         in: formData
 *         type: string
 *       - name: state
 *         description: user's state.
 *         in: formData
 *         type: string
 *       - name: city
 *         description: user's city.
 *         in: formData
 *         type: string
 *       - name: stateId
 *         description: user's state id.
 *         in: formData
 *         type: integer
 *       - name: cityId
 *         description: user's city id.
 *         in: formData
 *         type: integer
 *       - name: pincode
 *         description: user's zip code.
 *         in: formData
 *         type: integer
 *       - name: country
 *         description: user's country.
 *         in: formData
 *         type: string
 *       - name: countryId
 *         description: user's country id.
 *         in: formData
 *         type: integer
 *       - name: deviceType
 *         description: signup device type (1-web, 2-Android, 3-ios, 4-Electron).
 *         in: formData
 *         required: true
 *         type: number
 *       - name: deviceId
 *         description: unique id of the device.
 *         in: formData
 *         type: string
 *       - name: pushToken
 *         description: notification token.
 *         in: formData
 *         type: string
 *     responses:
 *       201:
 *         description: signup
 */
userRoutes.post(
  '/',
  validate(user.createUser),
  catchValidationErrors,
  registerUsers
);
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     description: Update User Details by id
 *     security:
 *     - Bearer: []
 *     tags:
 *     - User
 *     parameters:
 *       - name: id
 *         description: User ID
 *         in: path
 *         required: true
 *         type: number
 *       - name: firstName
 *         description: user's first name.
 *         in: formData
 *         type: string
 *       - name: lastName
 *         description: user's last name.
 *         in: formData
 *         type: string
 *       - name: countryCode
 *         description: country code of the user.
 *         in: formData
 *         type: string
 *       - name: phone
 *         description: user's phone.
 *         in: formData
 *         type: string
 *       - name: profilePic
 *         description: user's profile pic.
 *         in: formData
 *         type: string
 *       - name: fileName
 *         description: user's profile pic file name.
 *         in: formData
 *         type: string
 *       - name: address
 *         description: user's address.
 *         in: formData
 *         type: string
 *       - name: state
 *         description: user's state.
 *         in: formData
 *         type: string
 *       - name: city
 *         description: user's city.
 *         in: formData
 *         type: string
 *       - name: pincode
 *         description: user's zip code.
 *         in: formData
 *         type: string
 *       - name: country
 *         description: user's country.
 *         in: formData
 *         type: string
 *       - name: isActive
 *         description: user's status.
 *         in: formData
 *         type: boolean
 *         default: true
 *     responses:
 *       200:
 *         description: Successful operation
 */
userRoutes.put(
  '/:id',
  authenticate,
  validate(user.updateUser),
  catchValidationErrors,
  updateUserDetails
);

export default userRoutes;
