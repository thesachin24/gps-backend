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

export const acknowledgeDeviceCommandByFlag = async (deviceStringId, serverFlag, response) => {
  const record = await DeviceCommand.findOne({
    where: {
      device_string_id: deviceStringId,
      server_flag: serverFlag,
      status: COMMAND_STATUS.SENT
    }
  });
  if (!record) return null;
  return record.update({
    status: COMMAND_STATUS.ACKNOWLEDGED,
    response,
    acked_at: new Date()
  });
};

export const getLastAcknowledgedRelayCommand = deviceStringId =>
  DeviceCommand.findOne({
    where: {
      device_string_id: deviceStringId,
      command: { [require('sequelize').Op.in]: ['RELAY,1', 'RELAY,0'] },
      status: COMMAND_STATUS.ACKNOWLEDGED
    },
    order: [['acked_at', 'DESC']]
  });
