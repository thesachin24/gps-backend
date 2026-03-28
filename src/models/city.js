import Sequelize from 'sequelize';
import sequelize from './index';

const City = sequelize.define(
  'cities',
  {
    city_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    city_name: {
      type: Sequelize.STRING,
      allowNull: true
    },
    city_state: {
      type: Sequelize.STRING,
      allowNull: true
    },
  },
  {
    tableName: 'cities',
    timestamps: false
  }
);


export default City;
