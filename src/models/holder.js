import Sequelize from "sequelize";

import sequelize from "./index";

const Holder = sequelize.define(
  "holders",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.BIGINT,
    },

    holder_type: {
      allowNull: false,
      type: Sequelize.ENUM(
        "ADMIN",
        "DISTRIBUTOR",
        "DEALER",
        "CUSTOMER"
      ),
    },

    holder_id: {
      allowNull: false,
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
    tableName: "holders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    indexes: [
      {
        unique: true,
        fields: ["holder_type", "holder_id"],
      },
    ],
  }
);

export default Holder;