import Sequelize from 'sequelize';
import sequelize from './index';

const Coupon = sequelize.define(
  'coupons',
  {
    coupon_id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: Sequelize.INTEGER
    },
    coupon_code: {
      allowNull: false,
      type: Sequelize.STRING
    },
    coupon_value: {
      allowNull: false,
      type: Sequelize.STRING
    },
    coupon_type: {
      allowNull: false,
      type: Sequelize.STRING
    },
    min_value: {
      allowNull: false,
      type: Sequelize.INTEGER
    },
    usage: {
      allowNull: false,
      type: Sequelize.STRING
    },
    description: {
      allowNull: false,
      type: Sequelize.STRING
    },
    offers: {
      allowNull: false,
      type: Sequelize.STRING
    }
  },
  {
    tableName: 'coupons',
    timestamps: false
  }
);

export default Coupon;
