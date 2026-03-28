import '@babel/polyfill';
require('dotenv').config();
import express from 'express';
import logger from './src/config/logger';
import router from './src/routes/index';
import compression from 'compression';
import bodyParser from 'body-parser';
import sequelize from './src/models/index';
import morgan from 'morgan';
require('pg').defaults.parseInt8 = true
// import { startWhatsAppBot } from './src/utils/whatsapp';
import i18n from 'i18n';
// import './src/utils/cron';
import cors from 'cors';
const app = express();

//Migration Scripts
// import AWStoCouldinary from './src/migration-srcpits/aws-to-cloudinary';

// startWhatsAppBot()
//Notify Templates
i18n.configure({
  staticCatalog: {
    en: require('./locales/en.json'),
  },
  defaultLocale: 'en',
  objectNotation: true
});
// import connectDb from './src/config/database';
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(bodyParser.json({ type: 'application/json', limit: '50mb', extended: false }));
app.use(morgan('combined', { stream: logger.stream }));
app.use(cors());
app.use(compression());
app.use(`${process.env.API_VERSION}`, router);
// connectDb().then(
//     async () => {
//       logger.info('Database connected =>');
//       app.listen(process.env.PORT, () => {
//         logger.info(`Example app listening on port ${process.env.PORT}!`);
//       });
//     },
//     err => { logger.error(`Can not connect to the database${err}`);}
// );
sequelize
  .authenticate()
  .then(() => {
    logger.info('Database connection has been established successfully.');
    app.listen(process.env.PORT, () => {
      logger.info(`Example app listening on port ${process.env.PORT}!`);
    });
  })
  .catch(err => {
    logger.error('Unable to connect to the database:', err);
  });


process.on('uncaughtException', err => {
  logger.error(`There was an uncaught error: => ${err}`);
});

process.on('unhandledRejection', (reason, p) => {
  logger.info(`Unhandled Rejection at: ${p}, reason:, ${reason}`);
});
