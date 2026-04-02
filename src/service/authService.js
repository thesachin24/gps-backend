import logger from '../config/logger';
import {
  CustomError,
  checkBearerToken,
  getRandomString,
  getRandomNumber,
  _notify,
  generateReferralCode
} from '../utils';
import {
  updateUser,
  createUser,
  createUserAuthToken,
  getUserDevice,
  createUserDevice,
  getUserWithIgnoreCase,
  deleteAuthToken,
  updateUserDevice,
  getUserAuthToken,
  deleteUserDevice,
  getUserRoleDetails,
  createLawyer,
  getUser,
  createProfessional,
} from '../dao';
import {
  SIXTY,
  UN_PROCESSABLE_ENTITY,
  SERVER_ERROR,
  UNAUTHORIZED,
  NOT_FOUND,
  MESSAGE_CONSTANTS,
  USER_LOGIN_FIELDS,
  MOBILE,
  OK,
  USER_TYPE,
  FORCE_UPDATE,
  NOTIFY,
  FOUR,
  ROLES,
  TEST_NUMBERS
} from '../constants';

export const createOrUpdateDevice = async (user_id, device_id, device_type, push_token) => {
  const device = await getUserDevice({ user_id, device_id, device_type });
  if (!device) {
    createUserDevice({ user_id, device_id, device_type, push_token });
  } else {
    updateUserDevice({ device_id, device_type }, { push_token });
  }
};
/**
 * This function will return user token
 * @property {int} user_id - id of the user.
 * @property {string} device_id - id of the login device.
 * @property {int} device_type - type of the login device.
 * @returns {object}
 */
const getTokenForUser = async (user, device_id, device_type, push_token) => {
  const { id, is_blocked } = user;
  const data = {};
  const token = await getRandomString(SIXTY);
  const payload = {
    user_id: id,
    device_id,
    device_type,
    token
  };
  if (is_blocked) {
    throw new CustomError(UNAUTHORIZED, MESSAGE_CONSTANTS.DISABLED_USER);
  }
  await createOrUpdateDevice(id, device_id, device_type, push_token);
  //Activate USer
  const userData = { is_active: 1, verification_code: 0 };
  const [tokenObject, userObject] = await Promise.all([
    createUserAuthToken(payload),
    updateUser(user, userData)
  ]);
  if (!tokenObject) {
    throw new CustomError(
      SERVER_ERROR,
      MESSAGE_CONSTANTS.UNABLE_TO_SAVE_DATA
    );
  }
  data.user = user.toJSON();
  data.token = tokenObject.token;
  return {
    status: OK,
    message: MESSAGE_CONSTANTS.SUCCESSFULLY_LOGIN,
    data
  };
};

/**
 * This function will return login user
 * @property {string} reqInfo - request object of login.
 * @returns {object}
 */
export const userLogin = async body => {
  const { phone, type } = body;
  let user = await getUserWithIgnoreCase(MOBILE, phone, USER_LOGIN_FIELDS);
  // console.log(user.type, type);
  let otp = null;
  if(user && user.verification_code > 0){
    otp = user.verification_code
  } else {
    otp = getRandomNumber(FOUR)
  }
  // let otp = 1234
  // if(phone == '1111111111'){
  //   otp = 1234
  // }
  if(TEST_NUMBERS.includes(phone)){
    otp = 1234
  }
  console.log(phone, otp, "otp")
  if (user) {
    if (user.role == ROLES.ADMIN && type == ROLES.ADMIN) {
      //Proceed to Admin login
    } 
    // else if (user.type !== type) {
      //Already Registered with User
      // throw new CustomError(NOT_FOUND,
      //   MESSAGE_CONSTANTS.ALREADY_REGISTERED_AS + user.type);
    // }
    //Update OTP
    const data = {
      verification_code: otp,
    };
    const updatedUser = await updateUser(user, data);
    if (!updatedUser) {
      throw new CustomError(
        SERVER_ERROR,
        MESSAGE_CONSTANTS.UNABLE_TO_UPDATE_USER
      );
    }
  } else if ([USER_TYPE.USER].includes(type)) {
    //Create User
    body.otp = otp;
    body.referral_code =  generateReferralCode(8);
    body.date_joined = new Date();
    console.log(body,"body,,,,")
    user = await createUser(body);
  //  await createProfessional({
  //   user_id: user.id
  //  });

  } else {
    //Not User
    throw new CustomError(
      SERVER_ERROR,
      MESSAGE_CONSTANTS.INVALID_LOGIN_CREDENTIALS
    );
  }

  // body.password = await getRandomString(TEN);
  //Notify OTP
  if(!TEST_NUMBERS.includes(phone)){
    await _notify(
      NOTIFY.OTP_CONFIRM,
      user.id,
      user
    );
  }

  return {
    status: OK,
    message: MESSAGE_CONSTANTS.OTP_SENT
  };
};

/**
 * This function will return login user
 * @property {string} reqInfo - request object of login.
 * @returns {object}
 */
export const userVerify = async body => {
  const { phone, otp, device_id, device_type, push_token } = body;
  const user = await getUserWithIgnoreCase(MOBILE, phone, USER_LOGIN_FIELDS);
  console.log(user,"user,,,,")
  if (!user) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.USER_NOT_FOUND);
  }
  if (!user.verification_code) {
    throw new CustomError(UN_PROCESSABLE_ENTITY, MESSAGE_CONSTANTS.EXPIRED_OTP);
  }
  if (user.verification_code != otp) {
    throw new CustomError(UN_PROCESSABLE_ENTITY, MESSAGE_CONSTANTS.INVALID_OTP);
  }
  return getTokenForUser(user, device_id, device_type, push_token);
};

/**
 * This function removes user's auth token
 * @property {string} authTokenId - auth token id of the user
 * @returns {object} auth token details object
 */
export const logoutUser = async (authToken, deactivate) => {
  if (!authToken) {
    throw new CustomError(UN_PROCESSABLE_ENTITY, MESSAGE_CONSTANTS.INVALID_AUTH_HEADER_FORMAT);
  }
  try {
    const token = checkBearerToken(authToken);
    const auth = await getUserAuthToken({ token });
    if (!auth) {
      throw new CustomError(UN_PROCESSABLE_ENTITY, MESSAGE_CONSTANTS.INVALID_TOKEN_FORMAT);
    }
    deleteAuthToken({ token });
    deleteUserDevice({ device_id: auth.device_id });
    if (deactivate) {
      const user = await getUser({ id: auth.user_id });
      await updateUser(user, { is_active: 0 })
    }
    return {
      status: OK,
      message: MESSAGE_CONSTANTS.USER_LOGOUT_SUCCESSFULLY
    };
  } catch (err) {
    logger.error(err);
    throw new CustomError(err.status || SERVER_ERROR, err.message || MESSAGE_CONSTANTS.UNABLE_TO_REMOVE_TOKEN);
  }
};

/**
 * This function will return single role
 * @property {string} filters - Query condition
 * @returns {object} role details object
 */

export const getUserRole = filters => getUserRoleDetails(filters);
