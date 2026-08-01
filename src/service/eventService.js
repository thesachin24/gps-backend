import Sequelize from 'sequelize';
import {
  MESSAGE_CONSTANTS,
  NOT_FOUND,
  SERVER_ERROR,
  FORBIDDEN,
  CONFLICT
} from '../constants';
import {
  getEventList,
} from '../dao/eventDao';
import { CustomError } from '../utils';

export const getAllEvents = async payload => {
  const { search, offset, limit, sortByName, type } = payload;
  let { filter } = payload;
  let order = ['id', 'desc'];

  if (search) {
    const searchText = { [Sequelize.Op.iLike]: `%${search}%` };
    filter = {
      ...filter,
      [Sequelize.Op.or]: [
        { title: searchText },
        { description: searchText }
      ]
    };
  }

  if (sortByName) {
    order = ['title', sortByName];
  }

  if (type) {
    filter = {
      ...filter,
      type: {
        [Sequelize.Op.eq]: type
      }
    };
  }

  try {
    const list = await getEventList(filter, offset, limit, order);
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: {
        list: list.rows,
        totalPages: Math.ceil(list.count / limit),
        currentPage: offset,
        totalCount: list.count
      }
    };
  } catch (err) {
    throw new CustomError(SERVER_ERROR, err.message);
  }
};