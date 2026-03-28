/** In this file you can configure migrate-mongo*/
require('dotenv').config();
const { CONNECTION, DB_NAME } = process.env;
const config = {
  mongodb: {
    url: `${CONNECTION}`,
    databaseName: `${DB_NAME}`,
    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
    }
  },
  migrationsDir: "src/migrations",
  changelogCollectionName: "changelog"
};

module.exports = config;
