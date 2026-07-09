import firebase from "firebase-admin";

import i18n from 'i18n';
// import { databaseURL } from "../config/firebase";
import serviceAccount from '../config/serviceAccountKey.json';

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}-default-rtdb.asia-southeast1.firebasedatabase.app`
});

export const sendPush = async params => {
  try {
    const {
      tokens = [],
      template,
      data = {},
      event_id = "",
    } = params;

    /**
     * Validate Tokens
     */
    if (!Array.isArray(tokens) || !tokens.length) {
      console.log("FCM ERROR: No tokens provided");
      return;
    }

    /**
     * Notification Content
     */
    const title = String(
      i18n.__(`${template}.SUBJECT`, data)
    );

    const body = String(
      i18n.__(`${template}.NOTIFICATION`, data)
    );

    /**
     * Firebase Message
     */
    const message = {
      tokens,

      android: {
        priority: "high",
        // notification: {
        //   sound: "default",
        // },
      },

      apns: {
        payload: {
          aps: {
            sound: "default",
            contentAvailable: true,
          },
        },
      },

      // notification: {
      //   title,
      //   body,
      // },

      data: {
        title,
        body,
        params: JSON.stringify(data),
        template: String(template),
        event_id: String(event_id),
      },
    };

    /**
     * Send Notification
     */
    const response = await firebase.messaging().sendEachForMulticast(message);

    /**
     * Success Logs
     */
    console.log("=================================");
    console.log("FCM SENT");
    console.log("APP:", app.name);
    console.log("TEMPLATE:", template);
    console.log("SUCCESS:", response.successCount);
    console.log("FAILURE:", response.failureCount);
    console.log("=================================");

    /**
     * Failed Tokens
     */
    response.responses.forEach((r, index) => {
      if (!r.success) {
        console.log("=================================");
        console.log("FAILED TOKEN:", tokens[index]);

        console.log("ERROR CODE:",
          r.error?.errorInfo?.code
        );

        console.log("ERROR MESSAGE:",
          r.error?.errorInfo?.message
        );

        // console.log("FULL ERROR:", r.error);
        console.log("=================================");

        /**
         * Recommended:
         * Remove invalid tokens from DB
         */
        if (
          r.error?.errorInfo?.code ===
          "messaging/registration-token-not-registered"
        ) {
          // remove token from DB
        }

        /**
         * Token belongs to another Firebase project
         */
        if (
          r.error?.errorInfo?.code ===
          "messaging/mismatched-credential"
        ) {
          // token belongs to wrong firebase project
        }
      }
    });

    return response;

  } catch (error) {
    console.log("=================================");
    console.log("FCM FATAL ERROR");
    console.log("CODE:", error.code);
    console.log("MESSAGE:", error.message);
    console.log("STACK:", error.stack);
    console.log("FULL ERROR:", error);
    console.log("=================================");
  }
};