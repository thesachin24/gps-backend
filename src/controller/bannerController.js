import {
  OK,
  CREATED,
  SERVER_ERROR,
  OFFSET,
  PAGE_LIMIT
} from '../constants';
import logger from '../config/logger';
import {
  getAllBanners,
  getBannerDetail,
  createBanners,
  updateBannerDetail,
  deleteBanners,
  uploadBannerMedia,
  createBannerMediaDetail
} from '../service';

export const getBannerList = async (req, res) => {
  let {
    query: { search, page, limit, sortByName, business_id},
    auth: { user_id }
  } = req;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;
  try {
    let filter = { }
    if(business_id){
      filter.business_id = business_id
    }
    if(user_id){
      filter.user_id = user_id
    }
    const bannerList = await getAllBanners({search, offset: page, limit, sortByName, filter});
    return res.status(OK).json(bannerList);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const getBannerDetails = async (req, res) => {
  const {
    auth: { user_id },
    params: { id },
  } = req;
  try {
    const bannerDetail = await getBannerDetail(id, user_id);
    return res.status(OK).json(bannerDetail);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const createBanner = async (req, res) => {
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

export const updateBanner = async (req, res) => {
  const {
    body,
    auth: { user_id },
    params: { id }
  } = req;
  try {
    const banner = await updateBannerDetail(id, body, user_id);
    return res.status(OK).json(banner);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};


export const createBannerMedia = async (req, res) => {
  try {
    const {
      auth: { user_id },
    } = req;
    const banner = await createBannerMediaDetail(req.body, user_id);
    return res.status(OK).json(banner);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const updateBannerMedia = async (req, res) => {
  const {
    auth: { user_id },
    params: { id }
  } = req;
  try {
    const banner = await uploadBannerMedia(id, user_id, req.body);
    return res.status(OK).json(banner);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

export const deleteBanner = async (req, res) => {
  const {
    auth: { user_id },
    params: { id }
  } = req;
  try {
    const banner = await deleteBanners(id, user_id);
    return res.status(OK).json(banner);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};
