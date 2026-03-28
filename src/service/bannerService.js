import Sequelize from 'sequelize';
import {
  MESSAGE_CONSTANTS,
  NOT_FOUND,
  SERVER_ERROR,
  FORBIDDEN,
  NOTIFY,
  QUESTION_STATUS
} from '../constants';
import {
  getBannerList,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  getBanner,
  getAd
} from '../dao';
import {
  CustomError,
  handleDeleteMedia,
  handleUploadAndDeleteImage,
  handleUploadAndDeleteVideo
} from '../utils';
import { _notify } from '../utils/notify';

export const getAllBanners = async (payload) => {
  const { search, offset, limit, sortByName, status } = payload;
  let { filter } = payload;
  let order = ['id', "desc"];
  
  if (search) {
    const searchText = { [Sequelize.Op.iLike]: `%${search}%` };
    filter = {
      [Sequelize.Op.or]: [
        { name: searchText }
      ]
    };
  }
  
  if (sortByName) {
    order = ['name', sortByName]
  }
  
  try {
    const bannerList = await getBannerList(filter, offset, limit, order);
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: {
        list: bannerList.rows,
        totalPages: Math.ceil(bannerList.count / limit),
        currentPage: offset,
        totalCount: bannerList.count
      }
    };
  } catch (err) {
    throw new CustomError(SERVER_ERROR, err.message);
  }
};

export const getBannerDetail = async (id, user_id) => {
  console.log("id",id)
  const data = await getBannerById({ id });
  if (!data) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data
  };
};

export const createBanners = async (payload, user_id) => {
  try {
    payload.is_active = true

    if(!payload.user_id){
      payload.user_id = user_id
    }

    const banner = await createBanner(payload);
    //Notify
    // _notify(
    //   NOTIFY.NEW_QUESTION,
    //   user_id,
    //   banner
    // );
    return {
      message: MESSAGE_CONSTANTS.BANNER_CREATE_SUCCESS,
      data: banner
    };
  } catch (err) {
    throw new CustomError(
      SERVER_ERROR,
      MESSAGE_CONSTANTS.UNABLE_TO_SAVE_DATA,
      err.message
    );
  }
};

export const updateBannerDetail = async (id, payload, user_id) => {
  const bannerInfo = await getBanner({ id });
  if (!bannerInfo) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  if (user_id && bannerInfo.user_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ACCESS_DENIED);
  }
  try {
    console.log(payload)
    const bannerDetails = await updateBanner(bannerInfo, payload);
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: bannerDetails
    };
  } catch (err) {
    throw new CustomError(
      SERVER_ERROR,
      MESSAGE_CONSTANTS.UNABLE_TO_UPDATE_DATA,
      err.message
    );
  }
};



/**
 * This function will return the updated user object with address
 * @property {int} userId - the userId of the user.
 * @property {boolean} isAdmin - admin role of the user.
 * @property {object} req.body - user fields to be updated.
 * @returns {object}
 */
export const createBannerMediaDetail = async (payload, user_id) => {
  try {
    payload.is_active = true
    // Check if a image is provided
    if (payload.banner_image) {
      const imageUpload = await handleUploadAndDeleteImage(
        payload.banner_image,
        payload.file_name,
        null,
        `banners/`
      );
      const compress_url = `${imageUpload.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_1200/')}`;
      payload.path = compress_url;
    }
    payload.user_id = user_id
    const data = await createBanner(payload);
    return {
      message: MESSAGE_CONSTANTS.BANNER_CREATE_SUCCESS,
      data,
    };
  } catch (err) {
    throw new CustomError(SERVER_ERROR, err.message);
  }
};


/**
 * This function will return the updated user object with address
 * @property {int} userId - the userId of the user.
 * @property {boolean} isAdmin - admin role of the user.
 * @property {object} req.body - user fields to be updated.
 * @returns {object}
 */
export const uploadBannerMedia = async (id, user_id, payload) => {
  try {
    const bannerInfo = await getBanner({ id });
    if (!bannerInfo) {
      throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
    }
    if (user_id && bannerInfo.user_id !== user_id) {
      throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ACCESS_DENIED);
    }

    // Check if a image is provided
    if (payload.banner_image) {
      const imageUpload = await handleUploadAndDeleteImage(
        payload.banner_image,
        payload.file_name,
        bannerInfo.path,
        `banners/`
      );
      const compress_url = `${imageUpload.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_400/')}`;
      payload.path = compress_url;
    }
    if (payload.banner_video) {
      const videoUpload = await handleUploadAndDeleteVideo(
        payload.banner_video,
        payload.file_name,
        bannerInfo.path,
        `banners/`
      );
      console.log(videoUpload);
      payload.path = videoUpload.secure_url;
    }

    const data = await updateBanner(bannerInfo, payload);
    return {
      message: MESSAGE_CONSTANTS.BANNER_IMAGE_UPDATED,
      data,
    };
  } catch (err) {
    throw new CustomError(SERVER_ERROR, err.message);
  }
};


export const deleteBanners = async (id, user_id) => {
  const bannerInfo = await getBanner({ id });
  if (!bannerInfo) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  const adInfo = await getAd({ banner_id: id });
  if (adInfo) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.BANNER_AD_POSTED);
  }
  if (user_id && bannerInfo.user_id !== user_id) {
    throw new CustomError(FORBIDDEN, MESSAGE_CONSTANTS.ACCESS_DENIED);
  }
  try {
    await handleDeleteMedia(bannerInfo.path);
    await deleteBanner({ id });
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
