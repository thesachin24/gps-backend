import Sequelize from 'sequelize';
import sequelize from './index';
import { category } from '../validations';

const UserDevice = sequelize.define(
  'options',
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    name: {
      type: Sequelize.STRING
    },
    value: {
      allowNull: false,
      type: Sequelize.STRING
    },
    type: {
      allowNull: false,
      type: Sequelize.STRING
    },
    category: {
      allowNull: false,
      type: Sequelize.STRING
    },
    data_type: {
      allowNull: false,
      type: Sequelize.STRING
    },
    description: {
      allowNull: true,
      type: Sequelize.STRING
    },
    is_editable: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  },
  {
    tableName: 'options',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default UserDevice;

