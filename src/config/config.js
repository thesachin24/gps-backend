require('dotenv').config();
module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    dialect: process.env.DB_DIALECT,
    pool: {
      max: 9,
      min: 0,
      idle: 10000
    },
    seederStorage: process.env.SEED_STORAGE,
    seederStorageTableName: process.env.SEED_STORAGE_TABLE,
    logging: process.env.ENV === 'development'
  },
  qa: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    dialect: process.env.DB_DIALECT,
    pool: {
      max: 9,
      min: 0,
      idle: 10000
    },
    seederStorage: process.env.SEED_STORAGE,
    seederStorageTableName: process.env.SEED_STORAGE_TABLE,
    logging: false
  },
  stage: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    dialect: process.env.DB_DIALECT,
    pool: {
      max: 9,
      min: 0,
      idle: 10000
    },
    seederStorage: process.env.SEED_STORAGE,
    seederStorageTableName: process.env.SEED_STORAGE_TABLE,
    logging: false
  },
  prod: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    dialect: process.env.DB_DIALECT,
    pool: {
      max: 9,
      min: 0,
      idle: 10000
    },
    seederStorage: process.env.SEED_STORAGE,
    seederStorageTableName: process.env.SEED_STORAGE_TABLE,
    logging: false
  }
};
