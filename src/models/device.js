import Sequelize from "sequelize";
import sequelize from "./index";
import DeviceAssetMap from "./deviceAssetMap";

const Device = sequelize.define(
  "devices",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.BIGINT,
    },
    // IMEI number or serial number
    device_id: {
      allowNull: false,
      unique: true,
      type: Sequelize.STRING,
    },
    device_name: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    // Type of device: GPS_TRACKER, OBD, DASHCAM
    device_type: {
      type: Sequelize.ENUM("GPS_TRACKER", "OBD", "DASHCAM"),
      defaultValue: "GPS_TRACKER",
    },
    firmware_version: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    sim_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    // ID of the entity that owns this device (user, distributor, or admin)
    owner_id: {
      allowNull: true,
      type: Sequelize.BIGINT,
    },
    // Type of the owner entity
    owner_type: {
      allowNull: true,
      type: Sequelize.ENUM('USER', 'DISTRIBUTOR', 'ADMIN'),
    },
    is_active: { 
      type: Sequelize.BOOLEAN, 
      defaultValue: true,
      allowNull: false,
    },
    created_at: {
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      type: Sequelize.DATE,
    },
  },
  {
    tableName: "devices",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

Device.hasOne(DeviceAssetMap, { foreignKey: 'device_id', as: 'device_asset' });
DeviceAssetMap.belongsTo(Device, { foreignKey: 'device_id', as: 'device_asset' });
export default Device;
