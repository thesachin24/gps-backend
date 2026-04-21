import Sequelize from 'sequelize';
import sequelize from './index';

const DeviceAssetMap = sequelize.define(
  'device_asset_map',
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
    asset_id: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    assigned_at: {
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      type: Sequelize.DATE,
    },
    removed_at: {
      allowNull: true,
      type: Sequelize.DATE,
    },
  },
  {
    tableName: 'device_asset_map',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default DeviceAssetMap;
