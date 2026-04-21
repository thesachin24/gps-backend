import Sequelize from 'sequelize';
import sequelize from './index';

const Telemetry = sequelize.define(
  'telemetry',
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.BIGINT,
    },
    device_id: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    latitude: {
      allowNull: false,
      type: Sequelize.DECIMAL(9, 6),
    },
    longitude: {
      allowNull: false,
      type: Sequelize.DECIMAL(9, 6),
    },
    speed: {
      allowNull: true,
      type: Sequelize.FLOAT,
    },
    heading: {
      allowNull: true,
      type: Sequelize.FLOAT,
    },
    ignition: {
      allowNull: true,
      type: Sequelize.BOOLEAN,
    },
    recorded_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  },
  {
    tableName: 'telemetry',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Telemetry;
