import { EVENT_FIELD, OFFSET, PAGE_LIMIT } from '../constants';
import eventModel from '../models/event';

export const getEventList = (filter, page, pageSize, order = []) =>
  eventModel.findAndCountAll({
    attributes: EVENT_FIELD,
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    order: order.length ? [order] : [['id', 'DESC']]
  });

export const getEvent = (filters, attributes) =>
  eventModel.findOne({
    attributes: attributes || EVENT_FIELD,
    where: filters
  });

export const getEventById = filters =>
  eventModel.findOne({
    attributes: EVENT_FIELD,
    where: filters
  });

export const createEvent = payload =>
  eventModel.build(payload).save();

export const updateEvent = (eventInfo, data, t) =>
  eventInfo.update(data, { transaction: t });

export const deleteEvent = where =>
  eventModel.destroy({ where });
