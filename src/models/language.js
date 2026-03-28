import Sequelize from 'sequelize';
import sequelize from './index';

const Language = sequelize.define(
  'languages',
  {
    language_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    language_name: {
      type: Sequelize.STRING,
      allowNull: true
    }
  },
  {
    tableName: 'languages',
    timestamps: false
  }
);


export default Language;
