import { APP_NAME } from '../constants';

const swaggerJSDoc = require('swagger-jsdoc');
/**
 * @file This file configure swagger api docs for the end users.
 */
const options = {
  definition: {
    info: {
      title: APP_NAME + ' APIDOC',
      version: '2.0.0'
    },
    schemes: [
      'http',
      'https'
    ],
    produces: ['application/x-www-form-urlencoded', 'application/json'],
    consumes: ['application/x-www-form-urlencoded', 'application/json'],
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header'
      }
    },
    basePath: process.env.API_VERSION
  },
  apis: ['./src/routes/*.js', './src/routes/admin/*.js']
};

export default swaggerJSDoc(options);
