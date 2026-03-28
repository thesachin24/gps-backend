import { createOrUpdateDevice, getAllOptionsDashboard } from '.';
import {
  MESSAGE_CONSTANTS,
  NOT_FOUND,
  TOTAL_QUOTES,
  SUBSCRIPTIONS,
  USER__BASIC,
  USER_TYPE,
  FAQS,
  PAYMENT,
  FORCE_UPDATE,
  OFFSET,
  DEFAULT_DASHOBARD_LIMIT,
  SERVICE_HOMEPAGE_LIMIT,
  CUSTOMER_SUPPORT,
  MAINTENANCE,
  QUESTION_STATUS,
  OPTIONS
} from '../constants';
import {
  getAllAreaOfLaw,
  getAllCities,
  getAllStates,
  getAllLanguages,
  getAllCourts,
  getAllCoupons,
  getLawyerSubscription,
  getService,
  getAllServices,
  getLawyerList,
  getAllLawyersSitemap,
  getAllQuestionsSitemap,
  getOption,
  updateOption,
  updateMultipleOption
} from '../dao';
import { getAllCounts, getDateWiseCountsForTables, getPercentageChanges } from '../dao/commonDao';
import { getListData, profileCompletePercentage } from '../helper';
import User from '../models/user';
import {
  CustomError,
} from '../utils';

const _getLawyerProfileData = data => {
  if (!data) {
    throw new CustomError(NOT_FOUND, MESSAGE_CONSTANTS.RESOURCE_NOT_FOUND);
  }
  const { advocate, is_active, subscription } = data;
  const { is_verified, is_paid, credits } = advocate;
  const complete = profileCompletePercentage(data)
  return {
    is_active,
    is_paid,
    is_verified,
    credits,
    complete,
    subscription
  };
}

export const getDashboardData = async user_id => {

  const { ads, banners } = await getListData(user_id);
    const data = {
      ads,
      banners
    }

  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data
  };
};



// Usage example
async function getChartData(start_date, end_date) {
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  //Last 30 days
  // const startDate = new Date(new Date().setDate(new Date().getDate() - 30));
  // const endDate = new Date();

  // Define the tables with the model and optional dateColumn if different from 'createdAt'
  const tables = [
    {
      model: User,       // Sequelize model for Orders table
      name: 'Users',     // Name for ApexCharts
      type: 'column',    // Chart type
      dateColumn: 'created_at' // You can provide custom column name here if necessary
    },
    {
      model: Business,        // Sequelize model for Users table
      name: 'Business',
      type: 'area',
      dateColumn: 'created_at'
    },
    {
      model: Matrimonial,     // Sequelize model for Products table
      name: 'Matrimonials',
      type: 'line',
      dateColumn: 'created_at'
    },
    {
      model: MatrimonialRequest,     // Sequelize model for Products table
      name: 'Matrimonial Requests',
      type: 'line',
      dateColumn: 'created_at'
    },
    {
      model: Favorite,     // Sequelize model for Products table
      name: 'Favorites',
      type: 'line',
      dateColumn: 'created_at'
    },
    {
      model: AvailedBusiness,     // Sequelize model for Products table
      name: 'Business Engagements',
      type: 'line',
      dateColumn: 'created_at'
    }
  ];

  // Get the data from multiple tables
  const chartData = await getDateWiseCountsForTables(tables, startDate, endDate);
  return chartData;
}


export const getDashboardDataAdmin = async (payload) => {

  const { start_date, end_date, user_id } = payload;
  const counts = await getAllCounts();
  const changes = await getPercentageChanges()
  const charts = await getChartData(start_date, end_date)
  
  const data = {
    counts,
    changes,
    charts
  }
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data
  };
};

export const getListingData = async (type) => {
  const data = {}
  if (type.includes("sitemapLawyers")) {
    data.sitemapLawyers = await getAllLawyersSitemap({
      type: 'advocate',
      is_active: 1
    },['registration_id','name']);
  }

  if (type.includes("sitemapQuestions")) {
    data.sitemapQuestions = await getAllQuestionsSitemap({
      status: QUESTION_STATUS.APPROVED
    },['area_of_law','question_id','question_title']);
  }

  if (type.includes("cities")) {
    data.cities = await getAllCities();
  }
  if (type.includes("states")) {
    data.states = await getAllStates();
  }
  if (type.includes("area_of_law")) {
    data.area_of_law = await getAllAreaOfLaw();
  }
  if (type.includes("languages")) {
    data.languages = await getAllLanguages();
  }
  if (type.includes("courts")) {
    data.courts = await getAllCourts();
  }
  if (type.includes("lawyers")) {
    data.lawyers = await getLawyerList({is_active: 1}, OFFSET, SERVICE_HOMEPAGE_LIMIT);
  }
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data
  };
};

export const getCouponData = async () => {
  const coupons = await getAllCoupons({ offers: 1 });
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data: {
      coupons
    }
  };
};

export const getServiceData = async () => {
  const data = await getAllServices({ is_active: 1 });
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data
  };
};

export const getServiceDetails = async (service_id) => {
  const data = await getService({ service_id });
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data
  };
};


export const getAllFAQs = async () => {
  const data = FAQS;
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data
  };
};



export const updateOptions = async (payload) => {
  console.log("payload", payload)
  const data = await updateMultipleOption(payload);
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data
  };
};

export const getSubscriptionPlansData = async (registration_id) => {
  const object = await getLawyerSubscription({ registration_id }, USER__BASIC);
  const { advocate } = object;
  const profile = object.toJSON()
  profile.is_paid = advocate.is_paid
  delete profile.advocate
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data: {
      profile,
      PLANS: SUBSCRIPTIONS
    }
  };
};




export const foregroundBackgroundData = async (body, registration_id) => {
  const { device_id, device_type, push_token } = body;
  if(registration_id){
    createOrUpdateDevice(registration_id, device_id, device_type, push_token)
  }
  // const PAYMENT = await getAllOptions(OPTIONS.PAYMENT)
  // const CUSTOMER_SUPPORT = await getAllOptions(OPTIONS.CUSTOMER_SUPPORT)
  // const MAINTENANCE = await getAllOptions(OPTIONS.MAINTENANCE)
  // const INVESTMENT = await getAllOptions(OPTIONS.INVESTMENT)
  // const ALERT = await getAllOptions(OPTIONS.ALERT)
  // const APP_FORCE_UPDATE = await getAllOptions(OPTIONS.APP_FORCE_UPDATE)
  const options = await getAllOptionsDashboard()
  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data: options
  };
};

