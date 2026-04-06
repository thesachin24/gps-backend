import { APP_NAME } from '../constants';
import { sendTelegram } from '../utils/telegram';

const winston = require('winston');
const fs = require('fs');
require('winston-daily-rotate-file');
const { format, transports, config } = winston;
const logDir = 'logs';

/**
 * Create the `logs` directory if it does not exist
 */
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const transport = new transports.DailyRotateFile({
  filename: APP_NAME + '-%DATE%.log',
  level: 'info',
  dirname: `${logDir}`,
  datePattern: 'DD-MM-YYYY',
  maxFiles: '30d'
});

const fileFormat = format.combine(
  format.uncolorize(),
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  format.printf(
    info => {
      if (info.level == "error") {
        // sendTelegram({
        //   template: "ERROR_APP",
        //   data : {
        //     message :  `\n\nTime: ${info.timestamp} \n\n${info.stack || info.message}`
        //   }
        // })
      }
      return `${info.level} : ${info.timestamp} : ${info.stack || info.message}`
    }
  )
);

const consoleFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  format.printf(info => `${info.level} : ${info.timestamp} : ${info.stack || info.message}`)
);

const loggerTransports = [transport];
if (process.env.ENV === 'development' || process.env.LOG_CONSOLE === 'true') {
  loggerTransports.push(
    new transports.Console({
      level: process.env.LOG_LEVEL || 'info',
      format: consoleFormat
    })
  );
}

const logger = new winston.createLogger({
  levels: config.npm.levels,
  format: fileFormat,
  transports: loggerTransports,
  exitOnError: false
});

logger.stream = {
  write(message) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  }
};

export default logger;
