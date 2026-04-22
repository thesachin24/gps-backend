import Sequelize from "sequelize";
import sequelize from "./index";

const Asset = sequelize.define(
  "assets",
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
    type: {
      type: Sequelize.ENUM(
        "CAR",
        "BIKE",
        "TRUCK",
        "BOAT",
        "CONTAINER",
        "PET",
        "PERSON",
        "OTHER",
      ),
      allowNull: false,
    },
    // Example: Office Car, Personal Car, etc.
    name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    // Example: MH-01-AB-1234, MH-01-AB-1235, etc.
    registration_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    // Example: Toyota, Tata, etc.
    make: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    // Example: Fortuner, 407, etc.
    model: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    // Example: Red, Blue, Green, etc.
    color: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    // Example: { "type": "CAR", "make": "Toyota", "model": "Fortuner", "color": "Red" }
    metadata: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: "assets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Asset;
