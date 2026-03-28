import Sequelize from 'sequelize';
import {
  MESSAGE_CONSTANTS,
  SERVER_ERROR,
} from '../constants';
import {
  getLawyer,
  getNotificationList
} from '../dao';
import {
  CustomError
} from '../utils';

export const getAllNotifications = async (user_id, search, offset, limit, sortByName) => {
  let filter = {};
  let order = ['createdAt', "desc"];
  if (search) {
    const searchText = { [Sequelize.Op.like]: `%${search}%` };
    filter = {
      [Sequelize.Op.or]: [
        { topic: searchText },
        { sub_topic: searchText },
        { city: searchText }
      ]
    };
  }
  if (sortByName) {
    order = ['name', sortByName]
  }
  filter.notification_to = user_id
  try {
    const notificationList = await getNotificationList(filter, offset, limit, order);
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: {
        list: notificationList.rows,
        totalPages: Math.ceil(notificationList.count / limit),
        currentPage: offset,
        totalCount: notificationList.count
      }
    };
  } catch (err) {
    throw new CustomError(SERVER_ERROR, err.message);
  }
};
