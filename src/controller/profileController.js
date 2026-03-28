import {
  OK,
  SERVER_ERROR
} from '../constants';
import logger from '../config/logger';
import {
  addReferraDetails,
  addReferralDetails,
  deleteBankDetails,
  deleteUsers,
  getBankDetails,
  getProfileData,
  updateBankDetails,
  // updateLawyerDetails,
  updateProfessionalDetails,
  updateUserDetails,
  uploadCoverImage,
  uploadImage,
  uploadOtherImage,
} from '../service';

export const getProfile = async (req, res) => {
  const {
    auth: { user_id }
  } = req;
  try {
    const profile = await getProfileData(user_id);
    console.log("profile",profile)
    return res.status(OK).json(profile);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const updatePersonalProfile = async (req, res) => {
  const {
    auth: { user_id }
  } = req;
  try {
    const user = await updateUserDetails(user_id, req.body);
    return res.status(OK).json(user);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


export const getBankAccount = async (req, res) => {
  const {
    auth: { user_id }
  } = req;
  try {
    const data = await getBankDetails(user_id);
    return res.status(OK).json(data);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const updateBankAccount = async (req, res) => {
  const {
    auth: { user_id }
  } = req;
  try {
    const user = await updateBankDetails(user_id, req.body);
    return res.status(OK).json(user);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


export const updateImage = async (req, res) => {
  const {
    auth: { user_id }
  } = req;
  try {
    const user = await uploadImage(user_id, req.body);
    return res.status(OK).json(user);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const updateProfessionalProfile = async (req, res) => {
  const {
    auth: { user_id }
  } = req;
  try {
    const lawyer = await updateProfessionalDetails(user_id, req.body);
    return res.status(OK).json(lawyer);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


export const removeBankAccount = async (req, res) => {
  const {
    auth: { user_id }
  } = req;
  try {
    const review = await deleteBankDetails(user_id);
    return res.status(OK).json(review);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


export const addReferral = async (req, res) => {
  const {
    auth: { user_id }
  } = req;
  try {
    const lawyer = await addReferralDetails(user_id, req.body);
    return res.status(OK).json(lawyer);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const deleteProfile = async (req, res) => {
  const {
    auth: { user_id }
  } = req;
  try {
    const user = await deleteUsers(user_id);
    return res.status(OK).json(user);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};