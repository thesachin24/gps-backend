import { COUPONS_FIELD, OFFSET, PAGE_LIMIT } from '../constants';
import optionModel from '../models/option';
import sequelize from '../models/index';

export const getOptionList = (filter) => {
  return optionModel.findAll({
    where: filter,
    order: ['category', 'type', 'name'],
    raw: true,
  });
};

export const getOption = (filters, attributes) =>
  optionModel.findOne({
    attributes: attributes || COUPONS_FIELD,
    where: filters
  });

export const getOptionById = filters =>
  optionModel.findOne({ where: filters });

export const getOptionInfoWithIgnoreCase = value =>
  optionModel.findOne({
    where: sequelize.where(
      sequelize.fn('lower', sequelize.col('name')),
      value.toLowerCase()
    ),
    raw: true
  });
export const createOption = payload => optionModel.build(payload).save();

export const updateOption = (optionInfo, data, t) =>
  optionInfo.update(data, { transaction: t });

export const updateMultipleOption = (payload) => {
  return payload.map(update => 
    optionModel.update({ value: update.value }, {
      where: { id: update.id }
    })
  );
}
  
export const deleteOption = id =>
  optionModel.destroy({
    where: id
  });
