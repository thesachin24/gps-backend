import firebase from "firebase-admin";

import i18n from 'i18n';
// import { databaseURL } from "../config/firebase";
import serviceAccount from '../config/serviceAccountKey.json';

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}-default-rtdb.asia-southeast1.firebasedatabase.app`
});

export const sendPush = async Params => {
  const { tokens, template, data, event_id } = Params
  // const payload = {
  //   notification: {
  //     title: i18n.__(`${template}.SUBJECT`, data),
  //     body: i18n.__(`${template}.NOTIFICATION`, data),
  //     image: "",
  //     click_action: "NOTIFICATION_CLICK",
  //     channelId: "gps_1",
  //     priority: "high"
  //   },
  //   data: {
  //     template,
  //     event_id: event_id.toString()
  //   }
  // };
  // const options = {
  //   priority: 'high',
  //   timeToLive: 60 * 60 * 24, // 1 day
  // };
  const message = {
    android: {
      priority: 'high'
    },
    apns: {
      payload: {
        aps: {
          priority: 10
        },
      },
    },
    data: {
      title: i18n.__(`${template}.SUBJECT`, data),
      body: i18n.__(`${template}.NOTIFICATION`, data),
      template,
      event_id: event_id.toString(),
    },
    tokens: tokens,
  };
  try {
  const response = await firebase.messaging().sendEachForMulticast(message);
  console.log("response", response); 
  } catch (error) {
    console.log("error", error);
  }
}
