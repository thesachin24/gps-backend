import { ORDERS_FIELD, OFFSET, PAGE_LIMIT, USER__BASIC } from '../constants';
import orderModel from '../models/order';
import userModel from '../models/user';
// import lawyerModel from '../models/lawyer';
// import invoiceModel from '../models/invoice';
import sequelize from '../models/index';
import Device from '../models/device';

export const getAllOrdersList = (filters, attributes) =>
  orderModel.findAll({
    where: filters,
    attributes: attributes || ORDERS_FIELD,
    raw: true
  });

export const getOrderList = (filter, page, pageSize, order, attributes) => {
  return orderModel.findAndCountAll({
    attributes: attributes || ORDERS_FIELD,
    offset: page * pageSize || OFFSET,
    limit: pageSize || PAGE_LIMIT,
    where: filter,
    raw: false,
    order: order.length && [order],
    include: {
      model: userModel,
      as: 'lawyer',
      attributes: USER__BASIC,
    }
  });
};

export const getOrder = (filters, attributes) =>
  orderModel.findOne({
    attributes: attributes || ORDERS_FIELD,
    where: filters,
    include: {
      model: Device,
      as: 'subscription',
      attributes: ['sim_number'],
    }
  });


export const getOrderById = (filters, attributes) =>
  orderModel.findOne({
    attributes: attributes || ORDERS_FIELD,
    where: filters,
  //   include: [{
  //     attributes: ["registration_id", "name", "city", "mobile", "profile_image"],
  //     model: userModel,
  //     as: 'lawyer',
  //     required: false,
  //     include: {
  //       attributes: ['avg_ratings', 'is_verified', 'total_ratings'],
  //       model: userModel,
  //       required: true,
  //       unique: false
  //     }
  //   },
  //   // {
  //   //   attributes: ['path'],
  //   //   model: invoiceModel
  //   // }
  // ]

  });



export const getOrderByIdAdmin = (filters, attributes) =>
orderModel.findOne({
  attributes: attributes || ORDERS_FIELD,
  where: filters,
  include: [{
    attributes: ["registration_id", "name", "city", "mobile", "profile_image"],
    model: userModel,
    as: 'lawyer',
    required: false,
    include: {
      attributes: ['avg_ratings', 'is_verified', 'total_ratings'],
      model: lawyerModel,
      required: true,
      unique: false
    }
  },{
    attributes: ["registration_id", "name", "city", "mobile", "profile_image"],
    model: userModel,
    as: 'user',
    required: false
  }
  // ,{
  //   attributes: ['path'],
  //   model: invoiceModel
  // }
]

});


export const getConsultationById = (filters, attributes) =>
  orderModel.findOne({
    attributes: attributes || ORDERS_FIELD,
    where: filters,
    include: {
      attributes: ["name", "city", "mobile", "profile_image"],
      model: userModel,
      as: 'user',
      required: true
    }
  });


export const getOrderInfoWithIgnoreCase = value =>
  orderModel.findOne({
    where: sequelize.where(
      sequelize.fn('lower', sequelize.col('name')),
      value.toLowerCase()
    ),
    raw: true
  });

export const createOrder = payload => orderModel.build(payload).save();

export const updateOrder = (orderInfo, data, t) =>
  orderInfo.update(data, { transaction: t });


export const updateMultiOrder = (update, where) =>
  orderModel.update(update, { where });


export const deleteOrder = id =>
  orderModel.destroy({
    where: id
  });
