import i18n from 'i18n';
import TelegramBot from 'node-telegram-bot-api';

// replace the value below with the Telegram token you receive from @BotFather
const token = '2084639118:AAG-hYHmxFa88jSAKsJ51huG1B6enlFlBXc';
const chatId = '-1001526024994';

process.env.NTBA_FIX_319 = 1;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: false });

export const sendTelegram = async params => {
  const { template, data } = params
  const message = i18n.__(`${template}.ADMIN`, data)

  // bot.sendPoll(chatId, message, ["Yes","No"], {
  //   //// is_closed: true,
  //   // allows_multiple_answers: false,
  //   // parse_mode: 'html',
  //   open_period: 1
  // })

  bot.sendMessage(chatId, message,
    {
      parse_mode: 'html',
      disable_web_page_preview: 1
    });
}
