import { DEFAULT_DASHOBARD_LIMIT, LAWYER_COMPLETENESS, 
  LEAD_STATUS, MAX_QUOTES, OFFSET, QUESTION_STATUS, SERVICE_DASHOBARD_LIMIT, 
  USER_COMPLETENESS } from "../constants";
import { getAd, getAdList, getUser } from "../dao";
import { getBannerList } from "../dao";
import Sequelize from "sequelize";

const _getFilledValues = (dataObj, fields) => {
  var count = 0;
  for (const [key, value] of Object.entries(dataObj)) {
    if (fields.includes(key) && value) {
      count++
    }
  }
  return count;
}

export const profileCompletePercentage = dataObj => {
  const jsonString = JSON.stringify(dataObj);
  const data = JSON.parse(jsonString);
  const { advocate } = data;
  delete data.advocate;
  const userFields = _getFilledValues(data, USER_COMPLETENESS)
  const lawyerFields = _getFilledValues(advocate, LAWYER_COMPLETENESS)
  const completeFields = userFields + lawyerFields
  const totalFields = USER_COMPLETENESS.length + LAWYER_COMPLETENESS.length
  return parseInt(completeFields / totalFields * 100)
};

export const getListData = async (user_id) => {
  
  //Get Ads Based on User Coordinates
  let cordinates = { latitude: 28.8955, longitude: 76.6066 }
  if(user_id){
    const userObj = await getUser({ id: user_id }, ['latitude', 'longitude']);
    cordinates = { latitude: userObj.latitude, longitude: userObj.longitude }
  }
  //Get Ads Based on User Coordinates

  const now = new Date();
  const today = now.toISOString().slice(0, 10); // "YYYY-MM-DD"

  const [ bannerObj, adObj ] = await Promise.all([
    // getCategoryList({ is_active: 1, parent_id : {[Sequelize.Op.eq]: null } }, OFFSET, SERVICE_DASHOBARD_LIMIT),
    getBannerList({ is_active: true }, OFFSET),
    getAdList(
      {
        is_active: true,
        [Sequelize.Op.and]: [
          Sequelize.where(Sequelize.fn('DATE', Sequelize.col('active_from')), '<=', today),
          Sequelize.where(Sequelize.fn('DATE', Sequelize.col('active_to')), '>=', today)
        ]
      },
      OFFSET,
      DEFAULT_DASHOBARD_LIMIT,
      [],
      cordinates
    )
  ]);
  return {
    // categories: categoriesObj.rows,
    // wallet,
    // banners: bannerObj.rows,
    ads: adObj.rows
  }
}
