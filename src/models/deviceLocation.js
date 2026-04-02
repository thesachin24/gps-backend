import Sequelize from 'sequelize';
import sequelize from './index';

const DeviceLocation = sequelize.define(
  'device_locations',
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
      type: Sequelize.STRING
    },
    device_type: {
      allowNull: false,
      type: Sequelize.STRING
    },
    latitude: {
      allowNull: false,
      type: Sequelize.DECIMAL(9, 6)
    },
    longitude: {
      allowNull: false,
      type: Sequelize.DECIMAL(9, 6)
    },
    recorded_at: {
      allowNull: false,
      type: Sequelize.DATE
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
    },
    accuracy: {
      allowNull: true,
      type: Sequelize.FLOAT
    },
    speed: {
      allowNull: true,
      type: Sequelize.FLOAT
    },
    heading: {
      allowNull: true,
      type: Sequelize.FLOAT
    },
    altitude: {
      allowNull: true,
      type: Sequelize.FLOAT
    },
    source: {
      allowNull: true,
      type: Sequelize.STRING
    }
  },
  {
    tableName: 'device_locations',
    timestamps: false,
    indexes: [
      {
        name: 'idx_device_locations_device_recorded_at',
        fields: ['device_id', 'recorded_at']
      },
      {
        name: 'idx_device_locations_recorded_at',
        fields: ['recorded_at']
      },
      {
        name: 'idx_device_locations_user_id',
        fields: ['user_id']
      }
    ]
  }
);

export default DeviceLocation;
