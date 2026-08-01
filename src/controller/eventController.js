import logger from '../config/logger';
import {
  OK,
  CREATED,
  SERVER_ERROR,
  OFFSET,
  PAGE_LIMIT
} from '../constants';
import {
  getAllEvents,
} from '../service';

export const getEventList = async (req, res) => {
  let {
    query: { search, page, limit, sortByName, type, asset_id },
    auth: { user_id }
  } = req;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;
  try {
    const filter = { user_id };
    const eventList = await getAllEvents({
      search,
      offset: page,
      limit,
      sortByName,
      type,
      filter,
      asset_id
    });
    return res.status(OK).json(eventList);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};