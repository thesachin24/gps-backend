import { BANNERS_FIELD, BUSINESS_FIELD, OFFSET, PAGE_LIMIT } from '../constants';
import bannerModel from '../models/banner';
import Business from '../models/business';
import sequelize from '../models/index';

export const getBannerList = (filter, page, pageSize, order = []) => {
  return bannerModel.findAndCountAll({
    attributes: BANNERS_FIELD,
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    order: order.length && [order],
    include: [{
      model: Business,
      attributes: BUSINESS_FIELD,
      required: true
    }]
  });
};

export const getAllBannerList = (filter) => {
  return bannerModel.findAndCountAll({
    attributes: BANNERS_FIELD,
    // offset: page * pageSize || OFFSET,
    // limit: pageSize || PAGE_LIMIT,
    where: filter,
    // raw: true,
    // order: order.length && [order],
  });
};


export const getBanner = (filters, attributes) =>
  bannerModel.findOne({
    attributes: attributes || BANNERS_FIELD,
    where: filters
  });

export const getBannerById = filters =>
  bannerModel.findOne({ where: filters });

export const getBannerInfoWithIgnoreCase = value =>
  bannerModel.findOne({
    where: sequelize.where(
      sequelize.fn('lower', sequelize.col('name')),
      value.toLowerCase()
    ),
    raw: true
  });
export const createBanner = payload => bannerModel.build(payload).save();

export const updateBanner = (bannerInfo, data, t) =>
  bannerInfo.update(data, { transaction: t });

export const deleteBanner = (where) =>
  bannerModel.destroy({
    where
  });
