import {
    MOBILE,
    OK,
    SERVER_ERROR,
    USER_TYPE,
    USER__BASIC
  } from '../constants';
  import logger from '../config/logger';
  import {
    getCheckoutData,
  } from '../service';
  
  export const checkoutPayment = async (req, res) => {
    const {
      body,
      auth: { user_id }
    } = req;
    try {
      const response = await getCheckoutData(body, user_id);
      return res.status(OK).json(response);
    } catch (err) {
      logger.error(err);
      return res.status(err.status || SERVER_ERROR).json(err);
    }
  };
  
