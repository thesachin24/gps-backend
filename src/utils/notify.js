import Razorpay from 'razorpay'
// import { sendPush } from '.';
import { NOTIFY, NOTIFY_SERVICES } from '../constants';
import { createNotification, getAllUserDeviceTokens, getUser } from '../dao';
import { sendEmail } from './email';
import { sendSMS } from './sms';
import { sendTelegram } from './telegram';
import i18n from 'i18n';
import path from 'path';
import { slugify } from './common';
import { sendWhatsApp } from './whatsapp';
import { sendPush } from './firebase';



const _notifyAll = (template, sendTo, receiver, tokens, data, event_id) => {
    const { phone, email, registration_id } = receiver
    const { isEmail, isPush, isSms, isTelegram, isWhatsApp } = sendTo
    //Send Email
    if (isEmail && NOTIFY_SERVICES.EMAIL) {
        sendEmail({
            to: email,
            template,
            data
        })
    }

    //Send Push Notification
    if (isPush && NOTIFY_SERVICES.PUSH) {
        // createNotification({
        //     notification_to: registration_id,
        //     notification: i18n.__(`${template}.NOTIFICATION`, data),
        //     notification_type: template,
        //     event_id
        // })
        if (tokens.length) {
            sendPush({
                tokens,
                template,
                data,
                event_id
            })
        }
    }

    //Send Telegram
    if (isTelegram && NOTIFY_SERVICES.TELEGRAM) {
        sendTelegram({
            template,
            data
        })
    }

    //Send Telegram
    if (isSms && NOTIFY_SERVICES.SMS) {
        sendSMS({
            to: phone,
            template,
            data
        })
    }


    //Send WhatsApp
    if (isWhatsApp && NOTIFY_SERVICES.WHATSAPP) {
        console.log(data, template)
        sendWhatsApp({
            to: phone,
            template,
            data
        })
    }
}

export const _notify = async (template, id, data) => {
    const to = await getUser({ id }, ['id', 'name', 'phone', 'email'])
    console.log(to,"to,,,,")
    const { name } = to
    const tokens = await getAllUserDeviceTokens(id)
    let sendTo = {
        isEmail: false,
        isWhatsApp: false,
        isPush: false,
        isSms: false,
        isTelegram: false,
    }
    let variables = []
    switch (template) {
        case NOTIFY.OTP_CONFIRM:
            sendTo.isSms = true
            // sendTo.isWhatsApp = true
            const { verification_code } = data
            variables = {
                // name,
                verification_code
            }
            _notifyAll(template, sendTo, to, null, variables, data.question_id)
            break;
        case NOTIFY.IGNITION_STATE_CHANGED:
            sendTo = {
                isPush: true
            }
            variables = {
                device_name: data.device_name,
                ignition_state: data.ignition_state,
                time: data.time,
                vehicle_name: data.vehicle_name
            } 
            _notifyAll(template, sendTo, to, tokens, variables, data.device_id)
            break;
        default:
            break;
    }
}
