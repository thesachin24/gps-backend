import Sequelize from "sequelize";
import sequelize from "./index";
import Business from "./business";

const Banners = sequelize.define(
  "banners",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: Sequelize.INTEGER,
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    business_id: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    user_id: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    path: {
      type: Sequelize.STRING(300),
      allowNull: true,
    },
    type: {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: "IMAGE",
      enum: ["IMAGE", "VIDEO"]
    },
    priority: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    },
  },
  {
    tableName: "banners",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Banners.belongsTo(Business, {
  foreignKey: "business_id",
});

export default Banners;
