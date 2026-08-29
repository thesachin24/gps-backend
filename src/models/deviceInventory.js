import Sequelize from "sequelize";
import sequelize from "./index";
import Holder from "./holder";
import { HOLDER_TYPE, INVENTORY_STATUS } from "../constants";

const DeviceInventory = sequelize.define(
  "device_inventory",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.BIGINT,
    },

    device_id: {
      allowNull: false,
      unique: true,
      type: Sequelize.BIGINT,
    },

    // UUID encoded in the QR code
    qr_uuid: {
      allowNull: false,
      unique: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },

    sim_number: {
      allowNull: false,
      unique: true,
      type: Sequelize.STRING,
    },

    status: {
      allowNull: false,
      type: Sequelize.ENUM(
        ...Object.values(INVENTORY_STATUS)
      ),
      defaultValue: INVENTORY_STATUS.IN_STOCK,
    },

    holder_type: {
      allowNull: true,
      type: Sequelize.ENUM(
        ...Object.values(HOLDER_TYPE)
      ),
      defaultValue: HOLDER_TYPE.ADMIN,
    },

    holder_id: {
      allowNull: true,
      type: Sequelize.BIGINT,
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
    tableName: "device_inventory",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

DeviceInventory.belongsTo(Holder, {
  foreignKey: "holder_id",
  as: "holder",
});

Holder.hasMany(DeviceInventory, {
  foreignKey: "holder_id",
  as: "inventory",
});

export default DeviceInventory;