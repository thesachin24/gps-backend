import Sequelize from "sequelize";
import sequelize from "./index";
import { GEOFENCE_TYPE } from "../constants";

const Geofence = sequelize.define(
  "geofences",
  {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    // Example: Home, Office, Warehouse, Restricted Area
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    // Defines the business purpose of the geofence
    type: {
      type: Sequelize.ENUM(
        GEOFENCE_TYPE.REGULAR_ZONE,
        GEOFENCE_TYPE.SAFE_ZONE,
        GEOFENCE_TYPE.NO_ENTRY_ZONE,
      ),
      allowNull: false,
      defaultValue: GEOFENCE_TYPE.REGULAR_ZONE,
    },

    // Shape of the geofence
    shape: {
      type: Sequelize.ENUM(
        "CIRCLE",
        "POLYGON",
      ),
      allowNull: false,
      defaultValue: "CIRCLE",
    },

    // Required for CIRCLE geofences
    center_latitude: {
      type: Sequelize.DECIMAL(10, 7),
      allowNull: true,
    },

    center_longitude: {
      type: Sequelize.DECIMAL(10, 7),
      allowNull: true,
    },

    location: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    // Radius in metres
    radius: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },

    type: {
      type: Sequelize.ENUM(
        Object.values(GEOFENCE_TYPE),
      ),
      allowNull: false,
      defaultValue: GEOFENCE_TYPE.REGULAR_ZONE,
    },

    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    metadata: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: "geofences",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["user_id", "is_active"],
      },
    ],
  },
);

export default Geofence;