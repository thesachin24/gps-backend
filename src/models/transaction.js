import Sequelize from 'sequelize';
import sequelize from './index';

const Order = sequelize.define(
  'rzr_transactions',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    rzr_order_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    event: {
      type: Sequelize.STRING,
      allowNull: true
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: true
    },
    amount: {
      type: Sequelize.FLOAT,
      allowNull: true
    }
  },
  {
    tableName: 'rzr_transactions',
    timestamps: true
  }
);


export default Order;
