import { Sequelize } from 'sequelize';
import { DEVICE_FIELD, OFFSET, PAGE_LIMIT } from '../constants';
import deviceModel from '../models/device';
import sequelize from '../models/index';
import Telemetry from '../models/telemetry';
import DeviceAssetMap from '../models/deviceAssetMap';
import Asset from '../models/asset';
import DeviceState from '../models/deviceState';

export const getDeviceList = (filter, page, pageSize, order = []) =>
  deviceModel.findAndCountAll({
    attributes: DEVICE_FIELD,
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    include: [
      {
        model: DeviceState,
        as: 'device_state',
        attributes: ['latitude', 'longitude', 'speed', 'heading', 'ignition', 'relay_status', 'last_recorded_at', 'gsm_signal', 'battery_level', 'gps_fixed', 'satellites', 'gps_tracking', 'address']
      },
      {
        model: DeviceAssetMap,
        as: 'device_asset',
        attributes: ['id', 'asset_id', 'assigned_at', 'removed_at'],
        include: [
          {
            model: Asset,
            as: 'asset',
            attributes: ['id', 'name', 'type', 'registration_number', 'make', 'model', 'color', 'metadata']
          }
        ]
      }
    ],
    order: order.length ? [order] : [['id', 'DESC']]
  });

export const getDevice = (filters, attributes) =>
  deviceModel.findOne({
    attributes: attributes || DEVICE_FIELD,
    where: filters
  });

export const getDeviceById = filters =>
  deviceModel.findOne({
    attributes: DEVICE_FIELD,
    where: filters,
    include: [
      {
        model: DeviceState,
        as: 'device_state',
        attributes: ['latitude', 'longitude', 'speed', 'heading', 'ignition', 'relay_status', 'last_recorded_at', 'gsm_signal', 'battery_level', 'gps_fixed', 'satellites', 'gps_tracking', 'address']
      },
      {
        model: DeviceAssetMap,
        as: 'device_asset',
        attributes: ['id', 'asset_id', 'assigned_at', 'removed_at'],
        include: [
          {
            model: Asset,
            as: 'asset',
            attributes: ['id', 'name', 'type', 'registration_number', 'make', 'model', 'color', 'metadata']
          }
        ]
      }
    ],
  });

export const getDeviceByDeviceIdIgnoreCase = value =>
  deviceModel.findOne({
    where: sequelize.where(
      sequelize.fn('lower', sequelize.col('device_id')),
      String(value).toLowerCase()
    ),
    raw: true
  });

export const createDevice = payload =>
  deviceModel.build(payload).save();

export const updateDevice = (deviceInfo, data, t) =>
  deviceInfo.update(data, { transaction: t });

export const deleteDevice = where =>
  deviceModel.destroy({
    where
  });


export const getDeviceTripsByDeviceAndDateRange = (deviceId, from, to) => {
  const where = { device_id: deviceId };
  if (from || to) {
    where.recorded_at = {};
    if (from) where.recorded_at[Sequelize.Op.gte] = from;
    if (to) where.recorded_at[Sequelize.Op.lte] = to;
  }
  return Telemetry.findAll({
    where,
    order: [['recorded_at', 'ASC']]
  });
};

import { getDistance } from 'geolib';
import { formatSecondsToHoursAndMinutes } from './commonDao';

export const calculateSummary = (records) => {
  if (records.length < 2) {
    return {
      totalDistance: 0,
      totalRunTime: 0,
      stoppedTime: 0,
      maxSpeed: 0,
      avgSpeed: 0,
    };
  }

  let totalDistance = 0;
  let totalRunTime = 0;
  let stoppedTime = 0;
  let maxSpeed = 0;
  let speedSum = 0;
  let movingCount = 0;

  for (let i = 1; i < records.length; i++) {
    const prev = records[i - 1];
    const curr = records[i];

    const seconds =
      (new Date(curr.recorded_at).getTime() -
        new Date(prev.recorded_at).getTime()) / 1000;

    // Distance
    totalDistance +=
      getDistance(
        {
          latitude: prev.latitude,
          longitude: prev.longitude,
        },
        {
          latitude: curr.latitude,
          longitude: curr.longitude,
        }
      ) / 1000;

    // Moving
    if (curr.speed >= 5) {
      totalRunTime += seconds;
      speedSum += curr.speed;
      movingCount++;
    } else {
      stoppedTime += seconds;
    }

    if (curr.speed > maxSpeed) {
      maxSpeed = curr.speed;
    }
  }

  return {
    totalDistance: Number(totalDistance.toFixed(2)),
    totalRunTime,
    stoppedTime,
    maxSpeed,
    avgSpeed: movingCount
      ? Math.round(speedSum / movingCount)
      : 0,
  };
};

export const getDeviceSummary = async ({ id, from, to, owner_id }) => {
  console.log(id, from, to, owner_id);
  const telemetry = await getDeviceTripsByDeviceAndDateRange(
    id,
    from,
    to
);
  const summary = calculateSummary(telemetry);
  console.log(summary);
  return summary;
};