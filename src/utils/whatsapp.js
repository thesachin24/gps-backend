import logger from "../config/logger";
import https from "https";
import { NOTIFY } from "../constants";

//Templates on aisensy
export const sendWhatsApp = (params) => {
  const { to, template, data } = params;
  const arrayValues = Object.values(data);
  let buttons = []
  if (template == NOTIFY.OTP_CONFIRM) {
    buttons.push({
      "type": "button",
      "sub_type": "url",
      "index": 0,
      "parameters": [
        {
          "type": "text",
          "text": arrayValues[0]
        }
      ]
    })
  }

  const payload = {
    apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZGJlNGYxMmM2NjRkMGI2ZmE4ZTEzYiIsIm5hbWUiOiJ4cHBydCIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2NWVmZWUxYTAwMWZmMDJhZmZiZGJmODMiLCJhY3RpdmVQbGFuIjoiTk9ORSIsImlhdCI6MTcyNTY4NzAyNX0.inZX-4IgwqbZoTqynad5uXGAkAnYQqMgp52RQPXMYjg---",
    campaignName: template,
    destination: to,
    userName: "Xprrt",
    templateParams: arrayValues,
    source: "new-landing-page form",
    media: {},
    buttons,
    carouselCards: [],
    location: {},
  };

  var options = {
    hostname: "backend.aisensy.com",
    port: 443,
    path: "/campaign/t1/api/v2",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };
  const req = https.request(options, (res) => {
    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });

  req.on("error", (error) => {
    logger.error(error);
  });

  req.write(JSON.stringify(payload));

  req.end();
};
