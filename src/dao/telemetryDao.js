import { TELEMETRY_FIELD, OFFSET, PAGE_LIMIT } from '../constants';
import telemetryModel from '../models/telemetry';
import sequelize from '../models/index';

export const getTelemetryList = (filter, page, pageSize, order = []) =>
  telemetryModel.findAndCountAll({
    attributes: TELEMETRY_FIELD,
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    order: order.length ? [order] : [['id', 'DESC']]
  });

export const getTelemetry = (filters, attributes) =>
  telemetryModel.findOne({
    attributes: attributes || TELEMETRY_FIELD,
    where: filters
  });

export const getTelemetryById = filters =>
  telemetryModel.findOne({
    attributes: TELEMETRY_FIELD,
    where: filters
  });

export const getTelemetryByTelemetryIdIgnoreCase = value =>
  telemetryModel.findOne({
    where: sequelize.where(
      sequelize.fn('lower', sequelize.col('telemetry_id')),
      String(value).toLowerCase()
    ),
    raw: true
  });

export const createTelemetry = payload =>
  telemetryModel.build(payload).save();

export const updateTelemetry = (telemetryInfo, data, t) =>
  telemetryInfo.update(data, { transaction: t });

export const deleteTelemetry = where =>
  telemetryModel.destroy({
    where
  });
