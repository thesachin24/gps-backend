import Sequelize from 'sequelize';
import {
  MESSAGE_CONSTANTS,
  SERVER_ERROR,
} from '../constants';
import {
  getOptionList
} from '../dao';
import {
  CustomError
} from '../utils';

export const getAllOptionsDashboard = async (type) => {
  let filter = {
    // type: {
    //   [Sequelize.Op.in]: type
    // }
  }
  try {
    const optionList = await getOptionList(filter);
    const options = {};
    let count = 0
    for (const obj of optionList) {
      if (!options[obj.category]) {
        options[obj.category] = {};
        count++;
      }
      if (!options[obj.category][obj.type]) {
        options[obj.category][obj.type] = {};
        count++;
      }
      if(obj.data_type == 'BOOLEAN'){
        obj.value = JSON.parse(obj.value)
      }
      options[obj.category][obj.type][obj.name] =  obj.value;
    }
    if(count == 1){
      return options[type]
    }else{
      return options;
    }
  } catch (err) {
    throw new CustomError(SERVER_ERROR, err.message);
  }
};


export const getAllOptions = async () => {
  let filter = {}
  try {
    const optionsList = await getOptionList(filter);
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: {
        list: optionsList
      }
    };
  } catch (err) {
    throw new CustomError(SERVER_ERROR, err.message);
  }
};
