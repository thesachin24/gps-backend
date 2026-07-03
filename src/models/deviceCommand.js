import Sequelize from 'sequelize';
import sequelize from './index';

const DeviceCommand = sequelize.define(
  'device_command',
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.BIGINT
    },
    device_id: {
      allowNull: false,
      type: Sequelize.BIGINT,
      comment: 'FK to devices.id'
    },
    device_string_id: {
      allowNull: false,
      type: Sequelize.STRING,
      comment: 'IMEI / device string ID for quick TCP dispatch'
    },
    command: {
      allowNull: false,
      type: Sequelize.STRING,
      comment: 'ASCII command string e.g. RELAY,1 or RELAY,0'
    },
    status: {
      allowNull: false,
      type: Sequelize.ENUM('pending', 'sent', 'acknowledged', 'failed'),
      defaultValue: 'pending'
    },
    server_flag: {
      allowNull: true,
      type: Sequelize.STRING(8),
      comment: '4-byte server flag hex used to match command response (0x17)'
    },
    serial: {
      allowNull: true,
      type: Sequelize.INTEGER,
      comment: 'GT06 serial number used in the command packet'
    },
    response: {
      allowNull: true,
      type: Sequelize.TEXT,
      comment: 'Raw ASCII response from device (protocol 0x17)'
    },
    sent_at: {
      allowNull: true,
      type: Sequelize.DATE
    },
    acked_at: {
      allowNull: true,
      type: Sequelize.DATE
    },
    error: {
      allowNull: true,
      type: Sequelize.TEXT,
      comment: 'Error message if command failed to send'
    }
  },
  {
    tableName: 'device_commands',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default DeviceCommand;
