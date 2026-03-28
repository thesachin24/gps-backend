import logger from '../config/logger';
import i18n from 'i18n';
import https from 'https';


export const sendSMS = params => {
  const { to, template, data } = params

  const message = i18n.__(`${template}.SMS`, data)
  const text = encodeURIComponent(message.replace(/&#x2F;/g, "/"))
  const options = {
    hostname: "m1.sarv.com",
    path: "/api/v2.0/sms_campaign.php?token=635150004664b42b0cd2434.05906472&user_id=85780102&route=TR&template_id=15468&sender_id=PURPND&language=EN&template="+text+"&contact_numbers="+to,
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
   }
   
  }
  const req = https.request(options, res => {
    res.on('data', d => {
      console.log('Response:', d.toString())
      process.stdout.write(d)
    })
  })

  req.on('error', error => {
    console.error(error)
    logger.error(error);
  })

  req.end()
};
