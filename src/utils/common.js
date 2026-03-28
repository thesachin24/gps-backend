import cryptoRandomString from 'crypto-random-string';
import { CustomError } from '../utils';
import {
  BAD_REQUEST,
  MESSAGE_CONSTANTS,
  SUBSCRIPTION_STATUS,
  TAX
} from '../constants';
import moment from 'moment';
export const getRandomString = len => cryptoRandomString({ length: len });

export const getRandomNumber = len =>
  cryptoRandomString({ length: len, characters: '123456789' });

export const checkBearerToken = bearerHeader => {
  const parts = bearerHeader.split(' ');
  if (parts.length === 2) {
    const [scheme, credentials] = parts;
    if (/^Bearer$/i.test(scheme)) {
      return credentials;
    }
    throw new CustomError(BAD_REQUEST, MESSAGE_CONSTANTS.INVALID_TOKEN_FORMAT);
  }
  throw new CustomError(BAD_REQUEST, MESSAGE_CONSTANTS.INVALID_AUTH_HEADER_FORMAT);
};

export const precise = x => Number.parseFloat(x).toFixed(2);

export const floatValue = x => parseFloat(x).toFixed(2)

export const getTax = amount => (amount * (TAX.slab / 100)).toFixed(2);

export const getTaxIncluding = amount => (amount - (amount / ((TAX.slab + 100)/100))).toFixed(2);

export const getCommissionAmount = (amount, commission) => (amount * (commission / 100)).toFixed(2);

export const ifPhoneExist = string => {
  const regex = /(?:[-+() ]*\d){10,13}/;
  return regex.test(string)
}

export const get10DigitMobile = string => string.substr(string.length - 10)


export const UTCtoIST = (utcDate) => {
var offset = moment().utcOffset();
var localText = moment.utc(utcDate).utcOffset(offset).format("MMMM D, YYYY");
return localText
}

export const slugify = (string) => {
  return string
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// Function to generate a random number within a range
export const getRandomNumberFromMinMax = (min, max) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}
export const generateReferralCode = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let referralCode = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters.charAt(randomIndex);
  }

  return referralCode;
}


export const key_value_pair = (array) => {
  const dictionary = {};
  for (const object of array) {
    const key = object.level;
    const value = object.percentage;
    dictionary[key] = parseFloat(value);
  }
  return dictionary;
};

export const getSubscriptionStatus = (data) => {
  if (!data?.subscribe_from || !data?.subscribe_to) {
    return SUBSCRIPTION_STATUS.UNSUBSCRIBED;
  }

  const subscribeFrom = new Date(`${data.subscribe_from}T00:00:00`);
  const subscribeTo = new Date(`${data.subscribe_to}T23:59:59`);
  const currentDate = new Date();

  // Check for invalid dates
  if (isNaN(subscribeFrom) || isNaN(subscribeTo)) {
    return SUBSCRIPTION_STATUS.UNSUBSCRIBED;
  }

  if (subscribeFrom <= currentDate && currentDate <= subscribeTo) {
    return SUBSCRIPTION_STATUS.ACTIVE;
  } else if (currentDate > subscribeTo) {
    return SUBSCRIPTION_STATUS.EXPIRED;
  } else {
    return SUBSCRIPTION_STATUS.UNSUBSCRIBED;
  }
};