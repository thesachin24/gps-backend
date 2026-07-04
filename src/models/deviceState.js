import Sequelize from 'sequelize';
import sequelize from './index';

// Latest location snapshot per device; upserted on each telemetry event
const DeviceState = sequelize.define(
  'device_state',
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.BIGINT,
    },
    device_id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.BIGINT,
    },
    latitude: {
      allowNull: true,
      type: Sequelize.DECIMAL(9, 6),
    },
    longitude: {
      allowNull: true,
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
      comment: 'ACC/ignition state from heartbeat terminalInfo bit 1'
    },
    relay_status: {
      allowNull: true,
      type: Sequelize.BOOLEAN,
      comment: 'Relay/immobilizer state from heartbeat terminalInfo bit 0 (armed)'
    },
    gsm_signal: {
      allowNull: true,
      type: Sequelize.STRING,
      comment: 'GSM signal strength from heartbeat gsmSignal'
    },
    battery_level: {
      allowNull: true,
      type: Sequelize.INTEGER,
      comment: 'Battery level from heartbeat batteryLevel'
    },
    heartbeat: {
      allowNull: true,
      type: Sequelize.JSONB,
      comment: 'Latest decoded heartbeat packet'
    },
    metadata: {
      allowNull: true,
      type: Sequelize.JSONB,
    },
    last_recorded_at: {
      allowNull: true,
      type: Sequelize.DATE,
    },
  },
  {
    tableName: 'device_state',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default DeviceState;
