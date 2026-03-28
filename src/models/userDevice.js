import Sequelize from 'sequelize';
import sequelize from './index';

const UserDevice = sequelize.define(
  'user_device',
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    device_type: {
      type: Sequelize.STRING
    },
    device_id: {
      type: Sequelize.STRING
    },
    user_id: {
      allowNull: false,
      type: Sequelize.INTEGER
    },
    push_token: {
      allowNull: true,
      type: Sequelize.STRING
    }
  },
  {
    tableName: 'user_device',
    timestamps: true,
    sequelize,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default UserDevice;

