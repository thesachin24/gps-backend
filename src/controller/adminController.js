import {
  OK,
  CREATED,
  SERVER_ERROR,
  OFFSET,
  PAGE_LIMIT,
  MESSAGE_CONSTANTS
} from '../constants';
import logger from '../config/logger';
import {
  updateLeadDetailAdmin,
  getAllLeadsAdmin,
  getAllOrdersAdmin,
  getOrderDetailAdmin,
  updateConsultationDetailAdmin,
  getAllUsers,
  updateUserDetails,
  getAllBusinesses,
  updateBusinessDetail,
  getAllMatrimonials,
  updateMatrimonialDetail,
  getDashboardDataAdmin,
  getAllCategories,
  updateCategoryDetail,
  uploadImage,
  uploadCategoryImage,
  uploadBusinessImage,
  getAllBanners,
  updateBannerDetail,
  uploadBannerMedia,
  getAllAds,
  updateAdDetail,
  createBanners,
  createAds,
  getAllOptions,
  updateOptions,
  deleteBanners,
  deleteAds,
  deleteCategories,
  deleteUsers,
  deleteBusinesses,
  createCategories,
  getAllAvaailedBusinessesAdmin
} from '../service';
import { createSubCategories, deleteSubCategories, getAllSubCategories, updateSubCategoryDetail, uploadSubCategoryImage } from '../service/subCategoryService';



export const getDashboardAdmin = async (req, res) => {
  const {
    auth: { user_id },
    query: { start_date, end_date }
  } = req;
  try {
    const dashboard = await getDashboardDataAdmin({ start_date, end_date, user_id });
    return res.status(OK).json(dashboard);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const getLeadListAdmin = async (req, res) => {
  let {
    query: { search, page, limit, sortByName, status }
  } = req;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;
  try {
    const leadList = await getAllLeadsAdmin(search, page, limit, sortByName, status);
    return res.status(OK).json(leadList);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const getUsersListAdmin = async (req, res) => {
  let {
    query: { search, page, limit, sortByName, status }
  } = req;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;
  try {
    const list = await getAllUsers({search, page, limit, sortByName, status});
    return res.status(OK).json(list);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
}

export const updateUserAdmin = async (req, res) => {
  const {
    body,
    params: { id }
  } = req;
  try {
    const admin = await updateUserDetails(id, body);
    return res.status(OK).json(admin);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};



export const getBusinessListAdmin = async (req, res) => {
  let {
    query: { search, page, limit, sortBy, sortOrder, status }
  } = req;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;
  try {
    let filter = { }
    const params = { search, offset: page, limit, sortBy, sortOrder, status, filter, admin: true }
    const list = await getAllBusinesses(params);
    return res.status(OK).json(list);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
}

export const getAvaailedBusinessListAdmin = async (req, res) => {
  let {
    query: { search, page, limit, sortByName }
  } = req;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;
  try {
    const list = await getAllAvaailedBusinessesAdmin(search, page, limit, sortByName);
    return res.status(OK).json(list);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
}

export const updateBusinessAdmin = async (req, res) => {
  const {
    body,
    params: { id }
  } = req;
  try {
    const admin = await updateBusinessDetail(id, body, body.user_id);
    return res.status(OK).json(admin);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


export const getMatrimonialListAdmin = async (req, res) => {
  let {
    query: { search, page, limit, sortByName }
  } = req;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;
  try {
    const params = { search, offset: page, limit, sortByName}
    const list = await getAllMatrimonials(params);
    return res.status(OK).json(list);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
}

export const updateMatrimonialAdmin = async (req, res) => {
  const {
    body,
    params: { id }
  } = req;
  try {
    const admin = await updateMatrimonialDetail(id, body, body.added_by_id);
    return res.status(OK).json(admin);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const createCategoryAdmin = async (req, res) => {
  const {
    body,
  } = req;
  try {
    const admin = await createCategories(body);
    return res.status(OK).json(admin);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


export const getCategoryListAdmin = async (req, res) => {
  let {
    query: { search, page, limit, sortByName, status }
  } = req;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;
  try {
    const list = await getAllCategories({search, page, limit, sortByName, status});
    return res.status(OK).json(list);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
}

export const updateCategoryAdmin = async (req, res) => {
  const {
    body,
    params: { id }
  } = req;
  try {
    const admin = await updateCategoryDetail(id, body);
    return res.status(OK).json(admin);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


export const createSubCategoryAdmin = async (req, res) => {
  const {
    body,
  } = req;
  try {
    const admin = await createSubCategories(body);
    return res.status(OK).json(admin);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};
export const getSubCategoryListAdmin = async (req, res) => {
  let {
    query: { search, page, limit, sortByName, status }
  } = req;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;
  try {
    const list = await getAllSubCategories({search, page, limit, sortByName, status});
    return res.status(OK).json(list);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
}

export const updateSubCategoryAdmin = async (req, res) => {
  const {
    body,
    params: { id }
  } = req;
  try {
    const admin = await updateSubCategoryDetail(id, body, body.added_by_id);
    return res.status(OK).json(admin);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


export const getOrderListAdmin = async (req, res) => {
  let {
    query: { search, page, limit, sortByName },
    auth: { user_id }
  } = req;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;
  try {
    const orderList = await getAllOrdersAdmin(search, page, limit, sortByName);
    return res.status(OK).json(orderList);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


export const getOrderDetailsAdmin = async (req, res) => {
  const {
    params: { id },
    // auth: { user_id }
  } = req;
  try {
    const orderDetail = await getOrderDetailAdmin(id);
    return res.status(OK).json(orderDetail);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
}


export const updateConsultationAdmin = async (req, res) => {
  const {
    body,
    params: { id }
  } = req;
  try {
    const question = await updateConsultationDetailAdmin(id, body);
    return res.status(OK).json(question);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


export const createBannerAdmin = async (req, res) => {
  try {
    const {
      auth: { user_id },
      body } = req
    const banner = await createBanners(body, user_id);
    return res.status(CREATED).json(banner);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const getBannersListAdmin = async (req, res) => {
  let {
    query: { search, page, limit, sortByName, status, type}
  } = req;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;
  try {
    let filter = { }
    if(type){
      filter.type = type;
    }
    const params = { search, offset: page, limit, sortByName, status, filter}
    const list = await getAllBanners(params);
    return res.status(OK).json(list);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
}

export const updateBannerAdmin = async (req, res) => {
  const {
    body,
    params: { id }
  } = req;
  try {
    const admin = await updateBannerDetail(id, body);
    return res.status(OK).json(admin);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


export const deleteBannerAdmin = async (req, res) => {
  const {
    params: { id }
  } = req;
  try {
    const banner = await deleteBanners(id);
    return res.status(OK).json(banner);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


export const createAdAdmin = async (req, res) => {
  try {
    const {
      auth: { user_id },
      params: { banner_id },
      body } = req
    const banner = await createAds(body, banner_id, user_id);
    return res.status(CREATED).json(banner);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


export const getAdsListAdmin = async (req, res) => {
  let {
    query: { search, page, limit, sortByName, user_id }
  } = req;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;
  try {
    let filter = { }
    const params = {  search, offset: page, limit, sortByName, user_id, filter}
    const list = await getAllAds(params);
    return res.status(OK).json(list);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
}

export const updateAdAdmin = async (req, res) => {
  const {
    body,
    params: { id }
  } = req;
  try {
    const admin = await updateAdDetail(id, body);
    return res.status(OK).json(admin);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


export const deleteAdAdmin = async (req, res) => {
  const {
    params: { id }
  } = req;
  try {
    const banner = await deleteAds(id);
    return res.status(OK).json(banner);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


export const createOptionAdmin = async (req, res) => {
  try {
    const {
      auth: { user_id },
      params: { banner_id },
      body } = req
    const banner = await createAds(body, banner_id, user_id);
    return res.status(CREATED).json(banner);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


export const getOptionsListAdmin = async (req, res) => {
  let {
    query: {}
  } = req;
  try {
    const list = await getAllOptions();
    return res.status(OK).json(list);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
}

export const updateOptionAdmin = async (req, res) => {
  const {
    body
  } = req;
  try {
    const admin = await updateOptions(body);
    return res.status(OK).json(admin);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


export const updateMediaAdmin = async (req, res) => {
  const {
    body,
    params: { id }
  } = req;
  try {
    console.log(body);
    let upload ={};
    if(body.profile_image){
      upload = await uploadImage(id, body);
    }else if(body.category_image){
      upload = await uploadCategoryImage(id, body);
    }else if(body.sub_category_image){
      upload = await uploadSubCategoryImage(id, body);
    }else if(body.cover_image){
      upload = await uploadBusinessImage(id, null, body);
    }else if(body.banner_image || body.banner_video){
      upload = await uploadBannerMedia(id, null, body);
    }
    return res.status(OK).json(upload);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};



export const deleteCategoryAdmin = async (req, res) => {
  const {
    params: { id }
  } = req;
  try {
    const category = await deleteCategories(id);
    return res.status(OK).json(category);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const deleteSubCategoryAdmin = async (req, res) => {
  const {
    params: { id }
  } = req;
  try {
    const subCategory = await deleteSubCategories(id);
    return res.status(OK).json(subCategory);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const deleteUserAdmin = async (req, res) => {
  const {
    params: { id }
  } = req;
  try {
    const user = await deleteUsers(id);
    return res.status(OK).json(user);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const deleteBusinessAdmin = async (req, res) => {
  const {
    params: { id }
  } = req;
  try {
    const business = await deleteBusinesses(id, null);
    return res.status(OK).json(business);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};