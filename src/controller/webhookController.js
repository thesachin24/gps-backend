import {
  OK,
  SERVER_ERROR
} from '../constants';
import logger from '../config/logger';
import {
} from '../service';

export const webhookRazorpay = async (req, res) => {
  const {
    body
  } = req;
  try {
    const response = await webhookRazorpayData(body);
    return res.status(OK).json(response);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || SERVER_ERROR).json({ ...err, message: err.message });
  }
};

