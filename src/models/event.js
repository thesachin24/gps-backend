import Sequelize from 'sequelize';
import sequelize from './index';

const Event = sequelize.define(
  'events',
  {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    asset_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },

    device_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
    },

    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    latitude: {
      type: Sequelize.DECIMAL(10, 7),
      allowNull: true,
    },

    longitude: {
      type: Sequelize.DECIMAL(10, 7),
      allowNull: true,
    },

    metadata: {
      type: Sequelize.JSONB,
      allowNull: true,
    },

    event_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: 'events',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    indexes: [
      {
        fields: ['asset_id'],
      },
      {
        fields: ['device_id'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['event_at'],
      },
      {
        fields: ['asset_id', 'event_at'],
      },
    ],
  },
);

export default Event;