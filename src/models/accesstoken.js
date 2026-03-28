import Sequelize from 'sequelize';
import sequelize from './index';

const AccessToken = sequelize.define(
  'access_token',
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    ttl: {
      type: Sequelize.INTEGER
    },
    device_type: {
      type: Sequelize.STRING
    },
    device_id: {
      type: Sequelize.STRING
    },
    token: {
      type: Sequelize.STRING
    },
    user_id: {
      type: Sequelize.INTEGER
    }
  },
  {
    tableName: 'access_token',
    timestamps: true,
    sequelize,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default AccessToken;
