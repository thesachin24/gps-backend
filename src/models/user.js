import Sequelize from "sequelize";
import sequelize from "./index";
import AccessToken from "./accesstoken";
import UserDevice from "./userDevice";
// import Question from './question';
// import Answer from './answer';

const { Model, DataTypes } = require("sequelize");

const User = sequelize.define(
  'users',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(254),
      allowNull: true,
      unique: true,
      // validate: {
      //   isEmail: true,
      // },
    },
    role : {
      type: DataTypes.STRING(128),
      allowNull: false,
      defaultValue: 'USER',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_blocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    verification_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    locality: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kyc_self_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kyc_doc_front: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kyc_doc_back: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kyc_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dob: {
      type: Sequelize.DATE,
      allowNull: true
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

User.hasMany(AccessToken, {
  foreignKey: "user_id",
  foreignKeyConstraint: true,
});
AccessToken.belongsTo(User, {
  foreignKey: "user_id",
  foreignKeyConstraint: true,
});

User.hasMany(UserDevice, {
  foreignKey: "user_id",
});

export default User;
