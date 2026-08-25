import { COUPONS_FIELD, OFFSET, PAGE_LIMIT } from '../constants';
import couponModel from '../models/coupon';
import sequelize from '../models/index';

export const getCouponList = (filter, page, pageSize, order = []) => {
  return couponModel.findAndCountAll({
    attributes: COUPONS_FIELD,
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    raw: true,
    order: order.length && [order]
  });
};

export const getCoupon = (filters, attributes) =>
  couponModel.findOne({
    attributes: attributes || COUPONS_FIELD,
    where: filters
  });

export const getCouponById = filters =>
  couponModel.findOne({ where: filters });

export const getCouponInfoWithIgnoreCase = value =>
  couponModel.findOne({
    where: sequelize.where(
      sequelize.fn('lower', sequelize.col('name')),
      value.toLowerCase()
    ),
    raw: true
  });
export const createCoupon = payload => couponModel.build(payload).save();

export const updateCoupon = (couponInfo, data, t) =>
  couponInfo.update(data, { transaction: t });

export const deleteCoupon = id =>
  couponModel.destroy({
    where: id
  });
