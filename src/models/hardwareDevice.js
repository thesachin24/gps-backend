import Sequelize from 'sequelize';
import sequelize from './index';

const HardwareDevice = sequelize.define(
  'hardware_devices',
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.BIGINT
    },
    user_id: {
      allowNull: false,
      type: Sequelize.INTEGER
    },
    device_id: {
      allowNull: false,
      unique: true,
      type: Sequelize.STRING
    },
    device_type: {
      allowNull: false,
      defaultValue: 'GPS_TRACKER',
      type: Sequelize.STRING
    },
    name: {
      allowNull: true,
      type: Sequelize.STRING
    },
    metadata: {
      allowNull: true,
      type: Sequelize.JSONB
    },
    latitude: {
      allowNull: true,
      type: Sequelize.DECIMAL(9, 6)
    },
    longitude: {
      allowNull: true,
      type: Sequelize.DECIMAL(9, 6)
    },
    last_recorded_at: {
      allowNull: true,
      type: Sequelize.DATE
    },
    is_active: {
      allowNull: false,
      defaultValue: true,
      type: Sequelize.BOOLEAN
    },
    created_at: {
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      type: Sequelize.DATE
    },
    updated_at: {
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      type: Sequelize.DATE
    }
  },
  {
    tableName: 'hardware_devices',
    timestamps: false,
    indexes: [
      {
        name: 'idx_hardware_devices_user_id',
        fields: ['user_id']
      },
      {
        name: 'idx_hardware_devices_is_active',
        fields: ['is_active']
      }
    ]
  }
);

export default HardwareDevice;
