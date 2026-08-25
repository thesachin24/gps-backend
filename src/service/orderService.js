import Sequelize from 'sequelize';
import {
  MESSAGE_CONSTANTS,
  NOT_FOUND,
  SERVER_ERROR,
  FORBIDDEN,
  ORDER_STATUS,
  ORDER_TYPE,
  PAYMENT_STATUS,
  NOTIFY,
  ORDER_DETAIL_FIELD,
  LAWYER_COMMISSION
} from '../constants';
import {
  getWalletList,
  getPayoutList,
  getOrderList,
  getOrderById,
  getConsultationById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrder,
  getAllOrdersList,
  getLawyer,
  getOrderByIdAdmin
} from '../dao';
import {
  CustomError, getCommissionAmount, _notify
} from '../utils';

export const getAllOrders = async (user_id, search, offset, limit, sortByName) => {
  let filter = {};
  filter.payment_status_new = { [Sequelize.Op.ne]: null }
  let order = ['createdAt', "desc"];
  if (search) {
    const searchText = { [Sequelize.Op.like]: `%${search}%` };
    filter = {
      [Sequelize.Op.or]: [
        { topic: searchText },
        { sub_topic: searchText },
        { city: searchText }
      ]
    };
  }
  if (sortByName) {
    order = ['name', sortByName]
  }
  filter.order_by = user_id
  try {
    const orderList = await getOrderList(filter, offset, limit, order);
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: {
        list: orderList.rows,
        totalPages: Math.ceil(orderList.count / limit),
        currentPage: offset,
        totalCount: orderList.count
      }
    };
  } catch (err) {
    throw new CustomError(SERVER_ERROR, err.message);
  }
};

export const getAllConsultations = async (user_id, search, offset, limit, sortByName) => {
  let filter = {
    order_for: user_id,
    order_type: ORDER_TYPE.CONSULTATION,
    payment_status_new: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.REFUNDED]
  };
  let order = ['createdAt', "desc"];
  if (search) {
    const searchText = { [Sequelize.Op.like]: `%${search}%` };
    filter = {
      [Sequelize.Op.or]: [
        { topic: searchText },
        { sub_topic: searchText },
        { city: searchText }
      ]
    };
  }
  if (sortByName) {
    order = ['name', sortByName]
  }
  try {
    const orderList = await getOrderList(
      filter, offset, limit, order,
      ["order_id", "plan_name", "createdAt", "order_status_new", "payment_status_new"]
    );
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: {
        list: orderList.rows,
        totalPages: Math.ceil(orderList.count / limit),
        currentPage: offset,
        totalCount: orderList.count
      }
    };
  } catch (err) {
    throw new CustomError(SERVER_ERROR, err.message);
  }
};

export const getOrderDetail = async (order_id, order_by) => {
  const data = await getOrderById({ order_by, order_id }, ORDER_DETAIL_FIELD);
  if (!data) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data
  };
};


export const getOrderDetailFromRazorOrder = async (rzr_order_id) => {
  const data = await getOrderById({ rzr_order_id }, ORDER_DETAIL_FIELD);
  if (!data) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data
  };
};

export const getConsultationDetail = async (order_id, order_for) => {
  const filter = {
    order_id,
    order_for,
    order_type: ORDER_TYPE.CONSULTATION,
    payment_status_new: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.REFUNDED]
  };
  const data = await getConsultationById(
    filter,
    [
      ...ORDER_DETAIL_FIELD,
      'advocate_commission'
    ]
  );

  let response = data.toJSON()

  // Show Premium Popup - Get Extra Payout
  let { order_amount, advocate_commission, payment_status_new } = data
  const lawyerObj = await getLawyer({ advocate_id: order_for }, ['is_pro']);
  response.payout = 0
  response.normalPayout = 0
  response.proPayout = 0
  response.is_pro = lawyerObj.is_pro
  if (payment_status_new != PAYMENT_STATUS.REFUNDED) {
    if (advocate_commission) {
      response.payout = getCommissionAmount(order_amount, advocate_commission)
    } else {
      response.payout = getCommissionAmount(order_amount, LAWYER_COMMISSION.ALL)
    }
    response.normalPayout = getCommissionAmount(order_amount, LAWYER_COMMISSION.ALL)
    response.proPayout = getCommissionAmount(order_amount, LAWYER_COMMISSION.PAID)
  }
  // Show Premium Popup - Get Extra Payout

  if (!response) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data: response
  };
};


export const createOrders = async payload => {
  try {
    const order = await createOrder(payload);
    return {
      message: MESSAGE_CONSTANTS.REIVEW_CREATE_SUCCESS,
      data: order
    };
  } catch (err) {
    throw new CustomError(
      SERVER_ERROR,
      MESSAGE_CONSTANTS.UNABLE_TO_SAVE_DATA,
      err.message
    );
  }
};

const _validateConsultation = (orderInfo, status, user_id) => {
  const update = {}
  const statusMust = [
    ORDER_STATUS.ASSIGNED,
    ORDER_STATUS.INPROGRESS,
    ORDER_STATUS.COMPLETED
  ]
  if (!statusMust.includes(orderInfo.order_status_new)) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.COSULTATION_VALIDATION + orderInfo.order_status_new);
  }
  switch (status) {
    case ORDER_STATUS.INPROGRESS:
      if (
        orderInfo.order_for != user_id ||
        orderInfo.order_status_new != ORDER_STATUS.ASSIGNED) {
        throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.COSULTATION_VALIDATION + orderInfo.order_status_new);
      }
      break;
    case ORDER_STATUS.COMPLETED:
      if (
        orderInfo.order_for != user_id ||
        orderInfo.order_status_new != ORDER_STATUS.INPROGRESS) {
        throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.COSULTATION_VALIDATION + orderInfo.order_status_new);
      }
      break;
    case ORDER_STATUS.APPROVED:
      if (
        orderInfo.order_by != user_id ||
        ![ORDER_STATUS.INPROGRESS, ORDER_STATUS.COMPLETED].includes(orderInfo.order_status_new)) {
        throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.COSULTATION_VALIDATION + orderInfo.order_status_new);
      }
      break;
    default:
      break;
  }
  update.order_status_new = status
  return update
}

export const updateConsultationDetail = async (order_id, payload, user_id) => {
  const orderInfo = await getOrder({ order_id });
  const { status } = payload
  if (!orderInfo) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  const update = await _validateConsultation(orderInfo, status, user_id)
  try {
    const orderDetails = await updateOrder(orderInfo, update);
    if (status == ORDER_STATUS.INPROGRESS) {
      //Notify to User
      _notify(
        NOTIFY.CONSULTATION_INPROGRESS,
        orderInfo.order_by,
        orderInfo
      );
    } else if (status == ORDER_STATUS.COMPLETED) {
      //Notify to User
      _notify(
        NOTIFY.CONSULTATION_COMPLETE,
        orderInfo.order_by,
        orderInfo
      );
    } else if (status == ORDER_STATUS.APPROVED) {
      //Notify to Lawyer
      _notify(
        NOTIFY.CONSULTATION_APPROVED,
        orderInfo.order_for,
        orderInfo
      );
    }
    return {
      message: MESSAGE_CONSTANTS.COSULTATION_STATUS + status,
      data: orderDetails
    };
  } catch (err) {
    throw new CustomError(
      SERVER_ERROR,
      MESSAGE_CONSTANTS.UNABLE_TO_UPDATE_DATA,
      err.message
    );
  }
};



export const deleteOrders = async (rating_id, user_id) => {
  const orderInfo = await getOrder({ rating_id });
  if (!orderInfo) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  if (orderInfo.rating_by !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ACCESS_DENIED);
  }
  try {
    await deleteOrder({ rating_id });
    return {
      message: MESSAGE_CONSTANTS.SUCCESS
    };
  } catch (err) {
    throw new CustomError(
      SERVER_ERROR,
      MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND,
      err.message
    );
  }
};


export const getAllWalletTransactions = async (user_id, search, offset, limit, sortByName) => {
  let filter = {};
  let order = ['createdAt', "desc"];
  if (search) {
    const searchText = { [Sequelize.Op.like]: `%${search}%` };
    filter = {
      [Sequelize.Op.or]: [
        { topic: searchText },
        { sub_topic: searchText },
        { city: searchText }
      ]
    };
  }
  if (sortByName) {
    order = ['name', sortByName]
  }
  filter.advocate_id = user_id
  try {
    const walletList = await getWalletList(filter, offset, limit, order);
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: {
        list: walletList.rows,
        totalPages: Math.ceil(walletList.count / limit),
        currentPage: offset,
        totalCount: walletList.count
      }
    };
  } catch (err) {
    throw new CustomError(SERVER_ERROR, err.message);
  }
}


export const getAllPayouts = async (user_id, search, offset, limit, sortByName) => {
  let filter = {};
  let order = ['createdAt', "desc"];
  if (search) {
    const searchText = { [Sequelize.Op.like]: `%${search}%` };
    filter = {
      [Sequelize.Op.or]: [
        { topic: searchText },
        { sub_topic: searchText },
        { city: searchText }
      ]
    };
  }
  if (sortByName) {
    order = ['name', sortByName]
  }
  filter.advocate_id = user_id
  try {
    const payoutList = await getPayoutList(filter, offset, limit, order);
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: {
        list: payoutList.rows,
        totalPages: Math.ceil(payoutList.count / limit),
        currentPage: offset,
        // totalCount: walletList.count
      }
    };
  } catch (err) {
    throw new CustomError(SERVER_ERROR, err.message);
  }
};


export const getAllOrderPayouts = async (order_for, payout_id) => {
  try {
    const orderList = await getAllOrdersList({
      order_for, payout_id
    }, ['order_id', 'order_type', 'plan_name', 'order_amount', 'order_time', 'advocate_commission']);
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: orderList
    };
  } catch (err) {
    throw new CustomError(SERVER_ERROR, err.message);
  }
};



export const getAllOrdersAdmin = async (search, offset, limit, sortByName) => {
  let filter = {};
  filter.payment_status_new = { [Sequelize.Op.ne]: null }
  let order = ['createdAt', "desc"];
  if (search) {
    const searchText = { [Sequelize.Op.like]: `%${search}%` };
    filter = {
      [Sequelize.Op.or]: [
        { payment_status_new: searchText },
        { order_status_new: searchText }
      ]
    };
  }
  if (sortByName) {
    order = ['name', sortByName]
  }
  try {
    const orderList = await getOrderList(filter, offset, limit, order);
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: {
        list: orderList.rows,
        totalPages: Math.ceil(orderList.count / limit),
        currentPage: offset,
        totalCount: orderList.count
      }
    };
  } catch (err) {
    throw new CustomError(SERVER_ERROR, err.message);
  }
};


export const getOrderDetailAdmin = async (order_id) => {
  const data = await getOrderByIdAdmin({ order_id }, ORDER_DETAIL_FIELD);
  if (!data) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }

  let response = data.toJSON()

  // Show Premium Popup - Get Extra Payout
  if (data.order_for) {
    let { order_amount, advocate_commission, payment_status_new } = data
    const lawyerObj = await getLawyer({ advocate_id: data.order_for }, ['is_pro']);
    response.payout = 0
    response.normalPayout = 0
    response.proPayout = 0
    response.is_pro = lawyerObj.is_pro
    if (payment_status_new != PAYMENT_STATUS.REFUNDED) {
      if (advocate_commission) {
        response.payout = getCommissionAmount(order_amount, advocate_commission)
      } else {
        response.payout = getCommissionAmount(order_amount, LAWYER_COMMISSION.ALL)
      }
      response.normalPayout = getCommissionAmount(order_amount, LAWYER_COMMISSION.ALL)
      response.proPayout = getCommissionAmount(order_amount, LAWYER_COMMISSION.PAID)
    }
  }
  // Show Premium Popup - Get Extra Payout
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data: response
  };
};



const _validateConsultationAdmin = (orderInfo, status) => {
  const update = {}
  const statusMust = [
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.COMPLETED,
  ]
  if (!statusMust.includes(orderInfo.order_status_new)) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.COSULTATION_VALIDATION + orderInfo.order_status_new);
  }
  switch (status) {
    case ORDER_STATUS.ASSIGNED:
      if (orderInfo.order_status_new != ORDER_STATUS.PROCESSING) {
        throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.COSULTATION_VALIDATION + orderInfo.order_status_new);
      }
      break;
    case ORDER_STATUS.APPROVED:
      if (![ORDER_STATUS.INPROGRESS, ORDER_STATUS.COMPLETED].includes(orderInfo.order_status_new)) {
        throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.COSULTATION_VALIDATION + orderInfo.order_status_new);
      }
      break;
    default:
      break;
  }
  update.order_status_new = status
  return update
}

export const updateConsultationDetailAdmin = async (order_id, payload) => {
  const orderInfo = await getOrder({ order_id });
  const { status, order_for } = payload
  if (!orderInfo) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  const update = await _validateConsultationAdmin(orderInfo, status)

  if(status == ORDER_STATUS.ASSIGNED){
    const { order_type, plan_name} = payload
    const lawyerObj = await getLawyer({ advocate_id: order_for }, ['is_pro']);
    if(lawyerObj.is_pro){
      update.advocate_commission =  LAWYER_COMMISSION.PAID
    }else{
      update.advocate_commission = LAWYER_COMMISSION.ALL
    }
    update.order_type = order_type
    update.plan_name = plan_name
    update.order_for = order_for
  }

  try {
    const orderDetails = await updateOrder(orderInfo, update);
    if (status == ORDER_STATUS.ASSIGNED) {
      //Notify to User
      _notify(
        NOTIFY.ORDER_ASSIGNED_USER,
        orderInfo.order_by,
        orderInfo
      );
       //Notify to Lawyer
       _notify(
        NOTIFY.ORDER_ASSIGNED_LAWYER,
        order_for,
        orderInfo
      );
    } else if (status == ORDER_STATUS.APPROVED) {
      //Notify to Lawyer
      _notify(
        NOTIFY.CONSULTATION_APPROVED,
        orderInfo.order_for,
        orderInfo
      );
    }
    return {
      message: MESSAGE_CONSTANTS.COSULTATION_STATUS + status,
      data: orderDetails
    };
  } catch (err) {
    throw new CustomError(
      SERVER_ERROR,
      MESSAGE_CONSTANTS.UNABLE_TO_UPDATE_DATA,
      err.message
    );
  }
};
