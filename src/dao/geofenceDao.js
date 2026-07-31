import { Op } from 'sequelize';
import { GEOFENCE_FIELD, OFFSET, PAGE_LIMIT } from '../constants';
import geofenceModel from '../models/geofence';

export const getGeofenceList = (filter, page, pageSize, order = []) =>
  geofenceModel.findAndCountAll({
    attributes: GEOFENCE_FIELD,
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    order: order.length ? [order] : [['id', 'DESC']]
  });

export const getGeofence = (filters, attributes) =>
  geofenceModel.findOne({
    attributes: attributes || GEOFENCE_FIELD,
    where: filters
  });

export const getGeofenceById = filters =>
  geofenceModel.findOne({
    attributes: GEOFENCE_FIELD,
    where: filters
  });

export const getGeofencesByIds = (ids, filters = {}) => {
  if (!ids?.length) return Promise.resolve([]);
  return geofenceModel.findAll({
    attributes: GEOFENCE_FIELD,
    where: {
      id: { [Op.in]: ids },
      is_active: true,
      ...filters
    }
  });
};

export const createGeofence = payload =>
  geofenceModel.build(payload).save();

export const updateGeofence = (geofenceInfo, data, t) =>
  geofenceInfo.update(data, { transaction: t });

export const deleteGeofence = where =>
  geofenceModel.destroy({ where });
