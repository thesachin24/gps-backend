/**
 * @file List of all message constants used
 */

export const MESSAGE_CONSTANTS = Object.freeze({
  /* Common messages */
  RESOURCE_NOT_FOUND: 'Resource not found.',
  SOMETHING_WENT_WRONG: 'Something Went Wrong. Please try after sometime.',
  ACCESS_DENIED: `Access denied. You don't have rights to access this resource. `,
  SUCCESS: 'Request Completed Successfully',
  /* message used in service folder*/
  INVALID_FILE_SIZE: 'File Size is Invalid.',
  INVALID_LOGIN_CREDENTIALS: 'Invalid login credentials.',
  INVALID_OTP: 'Invalid One Time Password.',
  EXPIRED_OTP: 'OTP Expired, Please login again.',
  ACCOUNT_BLOCKED: 'Account Blocked.',
  SUCCESSFULLY_LOGIN: 'Logged in Successfully.',
  USER_NOT_FOUND: 'user not found',
  UNABLE_TO_UPDATE_USER: 'Unable to update user',
  DISABLED_USER: 'This user account is disabled. Please contact admin.',
  AUTH_TOKEN_IS_MISSING_IN_REQUEST: 'auth token is missing in request',
  USER_LOGOUT_SUCCESSFULLY: 'user logout successfully',
  UNABLE_TO_SAVE_DATA: "Unable to Save the Data. Please try again later.",
  UNABLE_TO_DELETE_DATA: "Unable to Delete the Data. Please try again later.",
  USER_CREATED_SUCCESSFULLY: 'user created successfully',
  UNABLE_TO_SAVE_USER: 'Unable to save user',
  USERNAME_PARAM_MISSING_IN_REQUEST: 'username param missing in request',

  USERNAME_DOES_NOT_EXIST: 'username does not exist',
  USERNAME_ALREADY_EXIST: 'username  already exist',

  SAME_REFERRAL: 'You cannot use self referral code.',
  ALREADY_REFERRED: 'You have already used the referral code.',
  
  REFERRAL_NOT_FOUND: 'Referral Code not found.',


  REFERRAL_APPLIED: 'Referral Code applied successfully.',

  INVALID_REQUEST: 'Invalid Request.',

  /*message used in utils.middleware */
  ACCESS_TOKEN_MISSING: 'Access token missing in request header.',
  API_KEY_MISSING: 'Partner api key is missing in request header.',
  API_KEY_INVALID: 'Invalid api key.Please use a valid api key.',
  INVALID_ACCESS_TOKEN: 'Authentication Failed. Please login to continue.',
  ADMIN_ACCESS_TOKEN: `Access denied. You don't have rights to access this resource. `,
  EXPIRED_ACCESS_TOKEN: 'Session expired. Please login to continue.',
  INVALID_EMAIL_ADDRESS: 'Invalid Email address',
  INVALID_MOBILE: 'Invalid Phone number',
  INVALID_TOKEN_FORMAT: 'Invalid Bearer token format.',
  INVALID_AUTH_HEADER_FORMAT: 'Invalid authentication header format.',
  INVALID_DATE: 'Invalid start and end date. Please select valid date with format (YYYY-MM-DD).',
  ACTIVE_FROM_DATE_INVALID: 'Active from date is invalid. It should be greater than current date.',
  ACTIVE_TO_DATE_INVALID: 'Active to date is invalid. It should be greater than current date.',
  ACTIVE_TO_BEFORE_ACTIVE_FROM: 'Active to date should be greater than active from date.',

  /*  Order */
  ALREADY_PAID: 'Order Already Paid.',
  ALREADY_SUBSCRIPTION_CHARGED: 'Subscription Already Charged.',
  RADIUS_NOT_FOUND: "We couldn't find a matching radius. Please choose from the available options.",
  /*  Question */
  QUESTION_CREATE_SUCCESS: 'Question has been asked successfully.',

  /*  Business */
  BUSINESS_CREATE_SUCCESS: 'Business has been successfully submitted.',
  BUSINESS_UPDATE_SUCCESS: 'Business has been successfully updated.',
  BUSINESS_DELETE_SUCCESS: 'Business has been successfully deleted.',
  BUSINESS_ALREADY_EXISTS: 'Business already exists with this Category. Please try with different Category.',
  BUSINESS_NOT_FOUND: 'Business not found.',
  KYC_UPDATE_SUCCESS: 'KYC has been successfully updated.',
  BUSINESS_NOT_AVAILABLE: 'Business is not available at this moment. Please contact admin.',
  BUSINESS_PHOTO_LIMIT_REACHED: 'You have reached the maximum limit of photos for your business. Please upgrade your subscription to add more photos.',
  BUSINESS_NOT_AVAILABLE_FOR_CONSULTATION: 'Business is not available for consultation.',
  /*  Consultation */
  COSULTATION_ERROR: 'Access denied. You cannot update the Consultation.',
  COSULTATION_STATUS: 'Consultation has been Marked as ',
  COSULTATION_VALIDATION: 'Cannot update the status. Current Status - ',

  /*  Lawyer */
  LAWYER_NOT_FOUND: 'Lawyer is not Available',

  /*  Answer */
  TRANSACTIONS_CREATE_SUCCESS: 'Transaction has been successfully submitted. When it is approved, you will be notified.',
  TRANSACTIONS_MAX_WITHDRAWL: 'The maximum withdrawal should not exceed the amount invested.',

  /* Checkout */
  AMOUNT_MISMATCH: 'Amount Misatch. Please try Again.',

  /* Coupon */
  MINIMUM_VALUE: 'Minimum Amount Value should be Rs. ',
  COUPON_NOT_FOUND: 'Coupon not found',

  /*  Review */
  REVIEW_CREATE_SUCCESS: 'Review has been successfully submitted.',
  REVIEW_UPDATE_SUCCESS: 'Review has been successfully updated.',
  REVIEW_DELETE_SUCCESS: 'Review has been successfully deleted.',
  REVIEW_ALREAY_POSTED: 'Already Reviewed.',

  /*  Leads */
  UNIQUENESS_METADATA_REQUIRED: 'UNIQUENESS_METADATA_REQUIRED',
  MAX_QUOTE_LIMIT: 'Max Quotes Limit Exceed',
  LESS_CREDITS: 'You have less credits.',
  RECHARGE_WALLET: 'Please Recharge your Wallet.',

  /*  Credits */
  INVALID_CODE: 'Invalid Coupon Code',
  CODE_EXPIRED: 'Coupon Code Expired',
  ALREADY_REDEEM: 'You have already redeemed this Code',
  CODE_REDEEMED: 'Code Redeemed Successfully',

  /*  Bank */
  BANK_ALREADY_ADDED: 'Bank Already Added.',

  /* */
  ALREADY_REGISTERED_AS: 'You are already registered as ',
  OTP_SENT: 'Otp Sent Successfully.',

  /* Success Posted */
  ANSWER_CREATED: 'Answer Posted Successfully',
  ANSWER_UPDATED: 'Answer Updated Successfully',
  ANSWER_DELETED: 'Answer Deleted Successfully',

  /* Category Posted */
  CATEGORY_CREATED: 'Category Created Successfully',
  CATEGORY_UPDATED: 'Category Updated Successfully',
  CATEGORY_DELETED: 'Category Deleted Successfully',
  
  /* Success Posted */
  PROFILE_UPDATED: 'Profile Updated Successfully',

    /*  Contacts */
    CONTACTS_CREATE_SUCCESS: 'Querry has been successfully submitted.',

    /* Matrimonial */
    MATRIMONIAL_CREATE_SUCCESS: 'Matrimonial has been successfully submitted.',
    MATRIMONIAL_ALREADY_POSTED: 'Matrimonial Already Posted.',
    MATRIMONIAL_NOT_REGISTERED: 'Matrimonial Not Registered yet.',
    MATRIMONIAL_NOT_FOUND: 'Matrimonial Not Found.',
  
    /*  Banner */
    BANNER_CREATE_SUCCESS: 'Banner has been successfully submitted.',
    BANNER_UPDATE_SUCCESS: 'Banner has been successfully updated.',
    BANNER_DELETE_SUCCESS: 'Banner has been successfully deleted.',
    BANNER_NOT_FOUND: 'Banner not found.',
    BANNER_ALREADY_POSTED: 'Banner Already Posted.',
    BANNER_IMAGE_UPDATED: 'Banner Image Updated Successfully.',
    BANNER_VIDEO_UPDATED: 'Banner Video Updated Successfully.',
    BANNER_AD_POSTED: 'Banner cannot be deleted as it is associated with an Ad.',

    /* Favorite */
    FAVORITE_CREATE_SUCCESS: 'Favorite has been successfully submitted.',
    FAVORITE_UPDATE_SUCCESS: 'Favorite has been successfully updated.',
    FAVORITE_DELETE_SUCCESS: 'Favorite has been successfully deleted.',
    FAVORITE_NOT_FOUND: 'Favorite not found.',
    FAVORITE_ALREADY_POSTED: 'Favorite Already Posted.',


    /*  Avail */
    AVAIL_CREATE_SUCCESS: 'Avail has been successfully submitted.',
    AVAIL_UPDATE_SUCCESS: 'Avail has been successfully updated.',
    AVAIL_DELETE_SUCCESS: 'Avail has been successfully deleted.',
    AVAIL_NOT_FOUND: 'Avail not found.',
    AVAIL_ALREADY_POSTED: 'Avail Already Posted.',

    /*Category*/
    CATEGORY_IMAGE_UPDATED: 'Category Image Updated Successfully.',
    CATEGORY_VIDEO_UPDATED: 'Category Video Updated Successfully.',
    CATEGORY_CREATE_SUCCESS: 'Category has been successfully submitted.',
    CATEGORY_UPDATE_SUCCESS: 'Category has been successfully updated.',
    SUB_CATEGORY_CREATE_SUCCESS: 'Sub Category has been successfully submitted.',
    SUB_CATEGORY_UPDATE_SUCCESS: 'Sub Category has been successfully updated.',
});
