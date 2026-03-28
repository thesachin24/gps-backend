import { CustomError, handleDeleteMedia, handleUploadAndDeleteImage } from "../utils";
import {
  SERVER_ERROR,
  MESSAGE_CONSTANTS,
  NOT_FOUND,
  UN_PROCESSABLE_ENTITY,
  RAZORPAYX_USER_TYPE,
  RAZORPAYX,
  BANK_STATUS,
  RZR_VALIDATION_AMOUNT,
  CURRENCY,
  PROFESSIONAL_FIELD,
  OFFSET,
  PAGE_LIMIT,
} from "../constants";
import logger from "../config/logger";
import {
  createUserCateogry,
  createUserCateogryBulk,
  deleteAuthToken,
  deleteAvail,
  deleteFavorite,
  deleteMatrimonial,
  deleteMatrimonialPhoto,
  deleteMatrimonialRequest,
  deleteOrder,
  deleteRecentView,
  deleteReview,
  deleteUser,
  deleteUserCateogry,
  deleteUserDevice,
  getAllBusinessIds,
  getAllUsersList,
  getMatrimonial,
  getMatrimonialPhotoList,
  getProfessional,
  getUser,
  getUserById,
  getUserCategoryId,
  getUserCategoryList,
  updateProfessional,
  updateUser,
} from "../dao";
import {
  activateFundAccountRazorpay,
  createContactsRazorpay,
  createFundAccountRazorpay,
  deactivateFundAccountRazorpay,
} from "../utils/razorPay";
import { createBank, deleteBank, getBank } from "../dao/bankDao";
import { Sequelize } from "sequelize";
import { deleteBusinesses } from "./businessService";
import { deleteMatrimonials } from "./matrimonialService";
// import { consultationPayout } from '../cron/payout';

export const getAllUsers = async (query) => {
  let { search, page, limit, sortByName } = query;
  page = +page || OFFSET;
  limit = +limit || PAGE_LIMIT;
  let order = ["id", "desc"]; 
  let filter = { };
  if (search) {
    const searchText = { [Sequelize.Op.iLike]: `%${search}%` };
    filter = {
      [Sequelize.Op.or]: [
        { name: searchText }, 
        { email: searchText },
        { phone: searchText },
        { city: searchText },
        { state: searchText },
        { pincode: searchText },
        { locality: searchText },
      ],
    };
  }

  if (sortByName) {
    order = ["name", sortByName];
  }

  try {
    const userList = await getAllUsersList(filter, page, limit, order);
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: {
        list: userList.rows,
        totalPages: Math.ceil(userList.count / limit),
        currentPage: page,
        totalCount: userList.count,
      },
    };
  } catch (err) {
    throw new CustomError(SERVER_ERROR, err.message);
  }
};

export const getProfileData = async (id) => {
  const data = await getUser({ id });
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data,
  };
};

export const getBankDetails = async (user_id) => {
  const data = await getBank({ user_id });
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data,
  };
};

export const createUser = async (body, api_key) => {
  const { email } = body;
  try {
    return {
      message: MESSAGE_CONSTANTS.USER_CREATED_SUCCESSFULLY,
      data: { email },
    };
  } catch (err) {
    logger.error(err);
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
export const updateUserDetails = async (id, payload) => {
  try {
    const user = await getUser({ id });
    if (!user) {
      throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
    }
    const data = await updateUser(user, payload);
    return {
      message: MESSAGE_CONSTANTS.PROFILE_UPDATED,
      data,
    };
  } catch (err) {
    logger.error(err);
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
export const uploadImage = async (id, payload) => {
  try {
    const user = await getUser({ id });
    if (!user) {
      throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
    }

    // Check if a profile image is provided
    if (payload.profile_image) {
      // Upload and update profile image
      const imageUpload = await handleUploadAndDeleteImage(
        payload.profile_image,
        payload.file_name,
        user.profile_image,
        `profile/`
      );
      const compress_url = `${imageUpload.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_200/')}`;
      payload.profile_image = compress_url;
    }

    // Check if a kyc image is provided
    // if (payload.kyc_self_image) {
    //   // Upload and update kyc image
    //   const imageUpload = await handleUploadAndDeleteImage(
    //     payload.kyc_self_image,
    //     payload.file_name,
    //     null,
    //     `kyc/self-${id}`
    //   );
    //   const compress_url = `${imageUpload.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_400/')}`;
    //   payload.kyc_self_image = compress_url;
    // }

    // Check if a kyc front doc is provided
    if (payload.kyc_doc_front) {
      // Upload and update kyc front doc
      const imageUpload = await handleUploadAndDeleteImage(
        payload.kyc_doc_front,
        payload.file_name,
        user.kyc_doc_front,
        `kyc/kyc-doc-front`
      );
      const compress_url = `${imageUpload.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_400/')}`;
      payload.kyc_doc_front = compress_url;
    }

    // Check if a kyc back doc is provided
    if (payload.kyc_doc_back) {
      // Upload and update kyc back doc
      const imageUpload = await handleUploadAndDeleteImage(
        payload.kyc_doc_back,
        payload.file_name,
        user.kyc_doc_back,
        `kyc/kyc-doc-back`
      );
      const compress_url = `${imageUpload.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_400/')}`;
      payload.kyc_doc_back = compress_url;
    }

    const data = await updateUser(user, payload);
    return {
      message: MESSAGE_CONSTANTS.PROFILE_UPDATED,
      data,
    };
  } catch (err) {
    logger.error(err);
    throw new CustomError(SERVER_ERROR, err.message);
  }
};


export const uploadCoverImage = async (user_id, payload) => {
  try {
    const professional = await getProfessional({ user_id });
    if (!professional) {
      throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
    }

    // Check if a profile image is provided
    if (payload.cover_image) {
      // Upload and update profile image
      const imageUpload = await handleUploadAndDeleteImage(
        payload.cover_image,
        payload.file_name,
        null,
        `profile/cover_image/images-${user_id}`
      );
      let cover_images = professional.cover_images;
      const compress_url = `${imageUpload.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_400/')}`;
      cover_images.push(compress_url);
      payload.cover_images = cover_images;
    }


    const data = await updateProfessional(professional, payload);
    return {
      message: MESSAGE_CONSTANTS.PROFILE_UPDATED,
      data,
    };
  } catch (err) {
    logger.error(err);
    throw new CustomError(SERVER_ERROR, err.message);
  }
};


export const uploadOtherImage = async (user_id, payload) => {
  try {
    const professional = await getProfessional({ user_id });
    if (!professional) {
      throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
    }
    let data = {}
    // Check if a profile image is provided
    if (payload.image) {
      // Upload and update profile image
      const imageUpload = await handleUploadAndDeleteImage(
        payload.image,
        payload.file_name,
        null,
        `profile/other_image/images-${user_id}`
      );
      const compress_url = `${imageUpload.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_400/')}`;
      data.path = compress_url
    }

    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data,
    };
  } catch (err) {
    logger.error(err);
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
export const updateProfessionalDetails = async (user_id, payload) => {
  try {
    const professional = await getProfessional({ user_id }, PROFESSIONAL_FIELD);
    if (!professional) {
      throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
    }

    if (payload.categories) {
      const categoriesPayload = payload.categories;

      let catObj = await getUserCategoryList({ user_id });

      const existingCategories = catObj.rows.map(
        (category) => category.category_id
      );

      const categoriesToInsert = categoriesPayload.filter(
        (category) => !existingCategories.includes(category)
      );

      const categoriesToRemove = existingCategories.filter(
        (category) => !categoriesPayload.includes(category)
      );


      if (categoriesToRemove.length > 0) {
        const deletePayload = categoriesToRemove.map((category_id) => ({
          user_id,
          category_id,
        }));
        await deleteUserCateogry(
          {  [Sequelize.Op.or]:  deletePayload } 
        );
      }
      

      if (categoriesToInsert.length > 0) {
        const insertPayload = categoriesToInsert.map((category_id) => ({
          user_id,
          category_id,
        }));
        await createUserCateogryBulk(insertPayload);
      }
    }

    // console.log(payload);
    const data = await updateProfessional(professional, payload);
    return {
      message: MESSAGE_CONSTANTS.PROFILE_UPDATED,
      data,
    };
  } catch (err) {
    logger.error(err);
    throw new CustomError(SERVER_ERROR, err.message);
  }
};

export const _createRazorpayContact = async (lawyer) => {
  const { registration_id, name, email, mobile } = lawyer;
  const options = {
    name,
    email,
    contact: mobile,
    type: RAZORPAYX.VENDOR,
    reference_id: registration_id.toString(),
  };
  const contact = await createContactsRazorpay(options);
  if (!contact.code) {
    throw new CustomError(UN_PROCESSABLE_ENTITY, contact.messages[0]);
  }
  return contact.data;
};

export const _createRazorpayBankAccount = async (payload) => {
  const { name, ifsc, account_number, contact_id } = payload;

  const options = {
    contact_id,
    account_type: RAZORPAYX.BANK_ACCOUNT,
    bank_account: {
      name,
      ifsc,
      account_number,
    },
  };
  const contact = await createFundAccountRazorpay(options);
  if (!contact.code) {
    throw new CustomError(UN_PROCESSABLE_ENTITY, contact.messages[0]);
  }
  return contact.data;
};

// export const _createRazorpayTransaction = async (account_id, lawyer) => {
//   const { name } = lawyer
//   const options = {
//     account_number: process.env.RAZORPAYX_VIRTUAL_ACCOUNT,
//     fund_account: {
//       id: account_id
//     },
//     amount: RZR_VALIDATION_AMOUNT,
//     currency: CURRENCY,
//     notes: {
//       lawyer: name
//     }
//   }
//   const contact = await transactionsRazorpay(options)
//   if (!contact.code) {
//     throw new CustomError(UN_PROCESSABLE_ENTITY, contact.messages[0]);
//   }
//   return contact.data
// };

export const _activeInactiveRazorpayBankAccount = async (
  account_id,
  status
) => {
  let response = {};
  if (status === BANK_STATUS.ACTIVATE) {
    response = await activateFundAccountRazorpay(account_id);
  } else {
    response = await deactivateFundAccountRazorpay(account_id);
  }
  if (!response.code) {
    throw new CustomError(UN_PROCESSABLE_ENTITY, response.messages[0]);
  }
  return response.data;
};

/**
 * This function will return the updated user object with address
 * @property {int} userId - the userId of the user.
 * @property {boolean} isAdmin - admin role of the user.
 * @property {object} req.body - user fields to be updated.
 * @returns {object}
 */
export const updateBankDetails = async (registration_id, payload) => {
  try {
    const bank = await getBank({ user_id: registration_id });
    if (bank) {
      throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.BANK_ALREADY_ADDED);
    }

    const { name, bank_name, ifsc, account_number, upi } = payload;

    //Create Bank
    const bankPayload = {
      user_id: registration_id,
      name,
      bank_name,
      ifsc,
      account_number,
      upi,
      status: 1,
    };
    const data = await createBank(bankPayload);

    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data,
    };
  } catch (err) {
    logger.error(err);
    throw new CustomError(SERVER_ERROR, err.message);
  }
};

export const deleteBankDetails = async (user_id) => {
  const bankInfo = await getBank({ user_id });
  if (!bankInfo) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  try {
    await deleteBank({ user_id });
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
    };
  } catch (err) {
    throw new CustomError(
      SERVER_ERROR,
      MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND,
      err.message
    );
  }
};



export const deleteUsers = async (id) => {
  const userInfo = await getUser({ id });
  if (!userInfo) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  try {
    const businessIds = await getAllBusinessIds({ user_id: id });
    for (const business of businessIds) {
      await deleteBusinesses(business.id, id);
    }

    
    const matrimonial = await getMatrimonial({ added_by_id: id });
    if (matrimonial) {
      // const matrimonialPhotos = await getMatrimonialPhotoList({ user_matrimonial_id: matrimonial.id });
      // for (const photo of matrimonialPhotos.rows) {
      //   await handleDeleteMedia(photo.path);
      //   await deleteMatrimonialPhoto({ id: photo.id });
      // }
      // await deleteMatrimonialRequest({ matrimonial_profile_id: matrimonial.id });
      // await deleteMatrimonial({ added_by_id: id });
      await deleteMatrimonials(matrimonial.id, id);
    }

    //Business Related
    await deleteRecentView({ user_id: id });
    await deleteAvail({ user_id: id });
    await deleteReview({ user_id: id });
    await deleteFavorite({ user_id: id });
    await deleteOrder({ user_id: id });

    //Delete Images User Related
    await handleDeleteMedia(userInfo.profile_image);
    await handleDeleteMedia(userInfo.kyc_doc_front);
    await handleDeleteMedia(userInfo.kyc_doc_back);

    await deleteUserDevice({ user_id: id });
    await deleteAuthToken({ user_id: id });
    await deleteUser({ id });

    
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
