import Sequelize from 'sequelize';
import sequelize from './index';
// import Invoice from './invoice';

const Order = sequelize.define(
  'orders',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    device_id: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    order_type: {
      type: Sequelize.STRING,
      allowNull: true
    },
    plan_name: {
      type: Sequelize.STRING,
      allowNull: true
    },
    tax: {
      type: Sequelize.STRING,
      allowNull: true
    },
    tax_percentage: {
      type: Sequelize.STRING,
      allowNull: true
    },
    order_amount: {
      type: Sequelize.FLOAT,
      allowNull: true
    },
    coupon_code: {
      type: Sequelize.STRING,
      allowNull: true
    },
    discount_amount: {
      type: Sequelize.FLOAT,
      allowNull: true
    },
    sub_total: {
      type: Sequelize.FLOAT,
      allowNull: true
    },
    final_total: {
      type: Sequelize.FLOAT,
      allowNull: true
    },
    payment_status: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    order_status: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    rzr_order_id: {
      type: Sequelize.STRING,
      allowNull: true
    },
    order_time: {
      type: Sequelize.DATE,
      allowNull: true
    },
    active_from: {
      type: Sequelize.DATE,
      allowNull: true
    },
    active_to: {
      type: Sequelize.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'orders',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);


//Invoice Relation
// Order.hasOne(Invoice, {
//   foreignKey: 'order_id',
//   foreignKeyConstraint: false
// });
//Invoice Relation
export default Order;
