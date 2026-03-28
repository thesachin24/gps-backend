import {
  OK,
  CREATED,
  SERVER_ERROR,
  OFFSET,
  PAGE_LIMIT
} from '../constants';
import logger from '../config/logger';
import {
  getAllNotifications,
  getNotificationDetail,
  createNotification,
  updateNotification,
  deleteNotification
} from '../service';

export const getNotificationList = async (req, res) => {
  let {
    query: { search, page, limit, sortByName },
    auth: { user_id }
  } = req;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;
  try {
    const notificationList = await getAllNotifications(user_id, search, page, limit, sortByName);
    return res.status(OK).json(notificationList);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const getNotificationDetails = async (req, res) => {
  const {
    auth: { user_id },
    params: { id },
  } = req;
  try {
    const notificationDetail = await getNotificationDetail(id, user_id);
    return res.status(OK).json(notificationDetail);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const {
      auth: { user_id },
      params: { notification_id },
      body } = req
    const notification = await createNotification(body, notification_id, user_id);
    return res.status(CREATED).json(notification);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const updateNotification = async (req, res) => {
  const {
    body,
    auth: { user_id },
    params: { id }
  } = req;
  try {
    const notification = await updateNotification(id, body, user_id);
    return res.status(OK).json(notification);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  const {
    auth: { user_id },
    params: { id }
  } = req;
  try {
    const notification = await deleteNotification(id, user_id);
    return res.status(OK).json(notification);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};
