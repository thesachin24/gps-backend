import {
  OK,
  SERVER_ERROR
} from '../constants';
import logger from '../config/logger';
import {
  contentGenerationOpenAI,
  foregroundBackgroundData,
  getAllFAQs,
  getCouponData,
  getDashboardData, getListingData, getServiceData, getServiceDetails, getSubscriptionPlansData, imageGenerationOpenAI,
} from '../service';

export const getDashboard = async (req, res) => {
  const {
    auth: { user_id }
  } = req;
  try {
    const dashboard = await getDashboardData(user_id);
    return res.status(OK).json(dashboard);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const data = await getServiceData();
    return res.status(OK).json(data);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const getService = async (req, res) => {
  const {
    params: { id }
  } = req;
  try {
    const response = await getServiceDetails(id);
    return res.status(OK).json(response);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const getFAQs = async (req, res) => {
  try {
    const response = await getAllFAQs();
    return res.status(OK).json(response);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const getListing = async (req, res) => {
  const {
    query: { type },
  } = req;
  try {
    const listing = await getListingData(type);
    return res.status(OK).json(listing);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const getCoupons = async (req, res) => {
  const {
    auth: { user_id }
  } = req;
  try {
    const listing = await getCouponData(user_id);
    return res.status(OK).json(listing);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const getSubscriptionPlans = async (req, res) => {
  const {
    auth: { user_id }
  } = req;
  try {
    const listing = await getSubscriptionPlansData(user_id);
    return res.status(OK).json(listing);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const foregroundBackground = async (req, res) => {
  const {
    body,
    auth: { user_id }
  } = req;
  try {
    const response = await foregroundBackgroundData(body, user_id);
    return res.status(OK).json(response);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


//OpenAI APIs
export const imageGeneration = async (req, res) => {
  const {
    query
  } = req;
  try {
    const response = await imageGenerationOpenAI(query);
    return res.status(OK).json(response);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

//OpenAI APIs
export const contentGeneration = async (req, res) => {
  const {
    query
  } = req;
  try {
    const response = await contentGenerationOpenAI(query);
    return res.status(OK).json(response);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};
