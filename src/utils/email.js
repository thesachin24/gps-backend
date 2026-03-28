import { EMAIL_CONSTANTS } from '../constants/email';
import logger from '../config/logger';
import i18n from 'i18n';
import nodemailer from 'nodemailer';

const mailHeader = subject => {
  return `<!DOCTYPE html>
  <html lang="en" style="height: 100%;">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <link href="https://fonts.googleapis.com/css?family=Quicksand:300,400,500,600,700&display=swap" rel="stylesheet">
    <title>${subject}</title>
  </head>
  <body style="margin: 0; padding: 0; background: #FFFFFF; height: 100%;">
      <!-- begin template body -->
      <table style="background: #f2f2f2; border: 0; margin: auto; width: 100%; font-family: 'Quicksand', Helvetica, Arial, sans-serif; height: 100%;" >
        <tr>
          <td>
            <table style="background-color: white; border: 0; width: 100%; max-width: 620px; margin-right:auto; margin-left: auto; font-family: 'Quicksand', Helvetica, Arial, sans-serif;border:1px solid #e4e8eb;border-top: 2px solid #5067eb;padding: 38px;">		
              <tr>
                <td>
                  <a href="#" style="display: inline-block;margin-bottom: 34px;"><img src="https://res.cloudinary.com/vkeel/image/upload/assets/images/logo-theme.png" width="134" height="" style="display: block; " /></a>
                </td>
              </tr>`
}

const mailFooter = () => {
  return `
<tr>
  <td>
    <p style="margin: 0;font-size: 14px;font-size: 14px;font-weight: normal;color: #505050;margin-bottom: 3px;">Thanks!</p>
    <p style="margin: 0;font-size: 14px;font-size: 14px;font-weight: 500;color: #505050;">Support Team</p>
    <p style="margin: 0;font-size: 14px;font-size: 14px;font-weight: 500;color: #505050;">WhatsApp Helpline +91-9991116848</p>
  </td>
</tr>
<tr>
  <td>
    <p style="margin: 0;font-size: 8px; color: #333333;line-height: 1.75;padding-bottom:5px;"><br>The information is solely intended for the individual/entity it is addressed to. If you are not the intended recipient of this message, please be aware that you are not authorized in any which way whatsoever to read, forward, print, retain, copy or disseminate this message or any part of it. If you have received this e-mail in error, we would request you to please notify the sender immediately by return e-mail and delete.</p>
  </td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`
}

const makeHtmlTemplate = (subject, htmlMessage) => {
  return `${mailHeader(subject)}<p>${htmlMessage}</p>${mailFooter()}`
}

/**
 * @description Generic method for sending email via send-grid mail method.
 * @property {object} payload- Object containing necessary email properties and configs.
 */
const sendMail = async (mailOptions) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    secure: true,
    port: 465,
    auth: {
      user: "noreply@vkeel.com",
      pass: "J@1matad!",
    },
  });
  transporter.sendMail(mailOptions, (error, response) => {
    if (error) {
      logger.info(`email send error => ${JSON.stringify(error)}`);
    }
    logger.info(`email response => ${JSON.stringify(response)}`);
  });
};

/**
 * @description Send verification email to user on given email id.
 * @property {string} to- user's email address.
 * @property {string} name- user's name.
 * @property {string} token- user's email address verification token.
 * @returns {object} Success/Error Message.
 */
export const sendEmail = async params => {

  const { to, template, data } = params
  const subject = i18n.__(`${template}.SUBJECT`, data)
  const text = i18n.__(`${template}.EMAIL`, data)
  const html = makeHtmlTemplate(subject, text)
  const mailData = {
    to,
    from: EMAIL_CONSTANTS.NO_REPLY_FROM,
    subject,
    html
  };
  if(data.attachments){
    mailData.attachments = data.attachments
  }
  sendMail(mailData);
};
