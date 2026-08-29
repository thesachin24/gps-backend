import Sequelize from "sequelize";
import sequelize from "./index";
import Holder from "./holder";
import { HOLDER_TYPE, INVENTORY_STATUS, SIM_STATUS } from "../constants";

const SimInventory = sequelize.define(
  "sim_inventory",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.BIGINT,
    },

    sim_number: {
      allowNull: false,
      unique: true,
      type: Sequelize.STRING,
    },

    status: {
      allowNull: false,
      type: Sequelize.ENUM(
        ...Object.values(SIM_STATUS)
      ),
      defaultValue: SIM_STATUS.INITIAL,
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
    tableName: "sim_inventory",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default SimInventory;