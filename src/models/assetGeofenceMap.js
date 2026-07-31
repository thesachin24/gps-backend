import Sequelize from 'sequelize';
import sequelize from './index';

const AssetGeofenceMap = sequelize.define(
  'asset_geofence_map',
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.BIGINT,
    },
    asset_id: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    geofence_id: {
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
    tableName: 'asset_geofence_map',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default AssetGeofenceMap;
