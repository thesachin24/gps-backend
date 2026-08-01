import { Op } from 'sequelize';
import { OFFSET, PAGE_LIMIT } from '../constants';
import { COMMAND_STATUS } from '../constants/deviceCommand';
import DeviceCommand from '../models/deviceCommand';

export const createDeviceCommand = payload => DeviceCommand.build(payload).save();

export const getDeviceCommand = (filters, attributes) =>
  DeviceCommand.findOne({ attributes, where: filters });

export const getDeviceCommandList = (filter, page, pageSize, order = []) =>
  DeviceCommand.findAndCountAll({
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    order: order.length ? [order] : [['id', 'DESC']]
  });

export const updateDeviceCommand = (record, data, t) =>
  record.update(data, { transaction: t });

/**
 * Mark a sent/pending command as acknowledged using the 0x17 server_flag echo.
 * Falls back to the latest open command for the device if flag match fails.
 */
export const acknowledgeDeviceCommandByFlag = async (deviceStringId, serverFlag, response) => {
  const openStatuses = [COMMAND_STATUS.SENT, COMMAND_STATUS.PENDING];
  const flag = String(serverFlag || '').toLowerCase();

  let record = null;
  if (flag) {
    record = await DeviceCommand.findOne({
      where: {
        device_string_id: deviceStringId,
        server_flag: flag,
        status: { [Op.in]: openStatuses }
      },
      order: [['id', 'DESC']]
    });
  }

  // Some firmwares echo a mangled/zero flag — fall back to latest open command
  if (!record) {
    record = await DeviceCommand.findOne({
      where: {
        device_string_id: deviceStringId,
        status: { [Op.in]: openStatuses }
      },
      order: [['id', 'DESC']]
    });
  }

  if (!record) return null;

  return record.update({
    status: COMMAND_STATUS.ACKNOWLEDGED,
    response: response || record.response || null,
    acked_at: new Date()
  });
};

export const getLastAcknowledgedRelayCommand = deviceStringId =>
  DeviceCommand.findOne({
    where: {
      device_string_id: deviceStringId,
      command: {
        [require('sequelize').Op.in]: [
          'RELAY,1',
          'RELAY,0',
          'RELAY,1#',
          'RELAY,0#',
          'Relay,1#',
          'Relay,0#'
        ]
      },
      status: COMMAND_STATUS.ACKNOWLEDGED
    },
    order: [['acked_at', 'DESC']]
  });
