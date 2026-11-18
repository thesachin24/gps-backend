import { Sequelize } from 'sequelize';
import { DEVICE_FIELD, OFFSET, ORDER_TYPE, PAGE_LIMIT, PAYMENT_STATUS } from '../constants';
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
        attributes: ['latitude', 'longitude', 'speed', 'heading', 'ignition', 'relay_status', 'last_location_at', 'last_heartbeat_at', 'gsm_signal', 'battery_level', 'gps_fixed', 'satellites', 'gps_tracking', 'address', 'location']
      },
      {
        model: DeviceAssetMap,
        as: 'device_asset',
        attributes: ['id', 'asset_id', 'assigned_at', 'removed_at'],
        include: [
          {
            model: Asset,
            as: 'asset',
            attributes: ['id', 'user_id', 'name', 'type', 'speed_limit', 'registration_number', 'make', 'model', 'color', 'metadata']
          }
        ]
      },
      {
        model: Order,
        as: 'subscription',
        separate: true,
        limit: 1,
        order: [['id', 'DESC']],
        attributes: ['id', 'plan_name', 'active_from', 'active_to'],
        where: {
          payment_status: PAYMENT_STATUS.PAID,
          order_type: ORDER_TYPE.SUBSCRIPTION,
          active_from: {
            [Sequelize.Op.lte]: new Date()
          },
          active_to: {
            [Sequelize.Op.gte]: new Date()
          }
        },
        required: false
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
        attributes: ['latitude', 'longitude', 'speed', 'heading', 'ignition', 'relay_status', 'last_location_at', 'last_heartbeat_at', 'gsm_signal', 'battery_level', 'gps_fixed', 'satellites', 'gps_tracking', 'address', 'location', 'metadata']
      },
      {
        model: DeviceAssetMap,
        as: 'device_asset',
        attributes: ['id', 'asset_id', 'assigned_at', 'removed_at'],
        include: [
          {
            model: Asset,
            as: 'asset',
            attributes: ['id', 'user_id', 'name', 'type', 'speed_limit', 'registration_number', 'make', 'model', 'color', 'metadata']
          }
        ]
      },
      {
        model: Order,
        as: 'subscription',
        attributes: ['id', 'plan_name', 'active_from', 'active_to'],
        where: {
          payment_status: PAYMENT_STATUS.PAID,
          order_type: ORDER_TYPE.SUBSCRIPTION,
          active_from: {
            [Sequelize.Op.lte]: new Date()
          },
          active_to: {
            [Sequelize.Op.gte]: new Date()
          }
        },
        required: false
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
    const where = {
      device_id: deviceId,
    };
  
    if (from || to) {
      where.recorded_at = {};
  
      if (from) {
        where.recorded_at[Sequelize.Op.gte] = `${from} 00:00:00`;
      }
  
      if (to) {
        where.recorded_at[Sequelize.Op.lte] = `${to} 23:59:59.999`;
      }
    }
  
    return Telemetry.findAll({
      where,
      order: [['recorded_at', 'ASC']],
    });
  };

import { getDistance } from 'geolib';
import { formatSecondsToHoursAndMinutes } from './commonDao';
import Order from '../models/order';
import User from '../models/user';


const MOVING_SPEED_KMH = 3;
const DEFAULT_STOP_THRESHOLD_MINUTES = 15;

export const calculateSummary = (
  records,
  stopDuration = DEFAULT_STOP_THRESHOLD_MINUTES
) => {
  const result = {
    totalDistance: 0,
    totalRunTime: 0,
    totalRunTimeSeconds: 0,
    stoppedTime: 0,
    stoppedTimeSeconds: 0,
    maxSpeed: 0,
    avgSpeed: 0,
  };

  if (!Array.isArray(records) || records.length < 2) {
    return result;
  }

  const stopThresholdMs =
    (Number(stopDuration) || DEFAULT_STOP_THRESHOLD_MINUTES) * 60 * 1000;

  const sortedRecords = [...records]
    .filter((r) => {
      const time = new Date(r.recorded_at).getTime();

      return (
        Number.isFinite(time) &&
        Number.isFinite(Number(r.latitude)) &&
        Number.isFinite(Number(r.longitude))
      );
    })
    .sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() -
        new Date(b.recorded_at).getTime()
    );

  let totalDistance = 0;
  let totalRunTime = 0;
  let totalRunTimeSeconds = 0;
  let stoppedTime = 0;
  let maxSpeed = 0;
  let movingDistance = 0;
  let stoppedTimeSeconds = 0;

  const getSpeed = (record) => {
    const speed = Number(record.speed_kmh ?? record.speed);

    return Number.isFinite(speed) && speed >= 0 ? speed : null;
  };

  for (let i = 1; i < sortedRecords.length; i++) {
    const prev = sortedRecords[i - 1];
    const curr = sortedRecords[i];

    const prevTime = new Date(prev.recorded_at).getTime();
    const currTime = new Date(curr.recorded_at).getTime();

    const gap = currTime - prevTime;

    // Ignore invalid intervals and long GPS gaps
    if (gap <= 0 || gap > stopThresholdMs) {
      continue;
    }

    const prevSpeed = getSpeed(prev);
    const currSpeed = getSpeed(curr);

    const isMoving =
      (currSpeed !== null && currSpeed > MOVING_SPEED_KMH) ||
      (prevSpeed !== null && prevSpeed > MOVING_SPEED_KMH);

    const seconds = gap / 1000;

    const distance =
      getDistance(
        {
          latitude: Number(prev.latitude),
          longitude: Number(prev.longitude),
        },
        {
          latitude: Number(curr.latitude),
          longitude: Number(curr.longitude),
        }
      ) / 1000;

    if (!Number.isFinite(distance) || distance < 0) {
      continue;
    }

    totalDistance += distance;

    if (isMoving) {
      totalRunTime += seconds / 60;
      totalRunTimeSeconds += seconds;
      movingDistance += distance;
    } else {
      stoppedTime += seconds / 60;
      stoppedTimeSeconds += seconds;
    }

    if (currSpeed !== null && currSpeed > MOVING_SPEED_KMH) {
      maxSpeed = Math.max(maxSpeed, currSpeed);
    }
  }

  return {
    totalDistance: Number(totalDistance.toFixed(2)),
    totalRunTime: Number(totalRunTime.toFixed(2)),
    totalRunTimeSeconds: Number(totalRunTimeSeconds.toFixed(2)),
    stoppedTime: Number(stoppedTime.toFixed(2)),
    stoppedTimeSeconds: Number(stoppedTimeSeconds.toFixed(2)),
    maxSpeed: Number(maxSpeed.toFixed(2)),
    avgSpeed:
      totalRunTimeSeconds > 0
        ? Number(
            ((movingDistance * 3600) / totalRunTimeSeconds).toFixed(0)
          )
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


export const getDeviceSubscription = (filters, attributes) =>
  deviceModel.findOne(
    {
      attributes: attributes || DEVICE_FIELD,
      where: filters,
      include: [{
        attributes: ["plan_name", "active_from", "active_to"],
        model: Order,
        as: 'subscription',
        where: {
          payment_status: ["PAID"],
          order_type: ORDER_TYPE.SUBSCRIPTION,
          active_from: {
            [Sequelize.Op.lte]: new Date()
          },
          active_to: {
            [Sequelize.Op.gte]: new Date()
          }
        },
        required: false
      }],
      order: [
        [{ model: Order, as: 'subscription' }, 'id', 'DESC']
      ],
    });