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
        case NOTIFY.SUBSCRIPTION_CHARGED:
            sendTo.isPush = true
            var { order_id, start_date, end_date } = data
            variables = {
                name, order_id, start_date, end_date
            }
            _notifyAll(template, sendTo, to, tokens, variables, data.order_id)
            break;
        case NOTIFY.NEW_QUESTION:
            sendTo = {
                isEmail: true, isPush: true, isTelegram: true,
            }
            var { question_title } = data
            variables = {
                name,
                question_title
            }
            _notifyAll(template, sendTo, to, tokens, variables, data.question_id)
            break;
        case NOTIFY.APPROVE_QUESTION:
            sendTo = {
                isPush: true
            }
            _notifyAll(template, sendTo, to, tokens, variables, data.question_id)
            break;
        case NOTIFY.PENDING_QUESTION:
            sendTo = {
                isTelegram: true
            }
            var { question_title } = data
            variables = {
                name,
                question_title
            }
            _notifyAll(template, sendTo, to, tokens, variables, data.question_id)
            break;
        case NOTIFY.NEW_ANSWER:
            sendTo = {
                isEmail: true, isPush: true, isTelegram: true
            }
            var { question_title, area_of_law, question_id , answer } = data
            variables = {
                name,
                link: `${process.env.APP_URL}/indian-kanoon/${slugify(area_of_law)}-legal-advice/${slugify(question_title)}-${question_id}`,
                question_title,
                answer
            }
            _notifyAll(template, sendTo, to, tokens, variables, data.question_id)
            break;
        case NOTIFY.NEW_ORDER:
            sendTo = {
                isEmail: true, isPush: true, isSms: true, isTelegram: true,
            }
            var { order_id, final_total, rzr_order_id } = data
            variables = {
                name, order_id, final_total,
                link: `${process.env.APP_URL}/a/orders`,
            }
            variables.attachments = [
                {
                    filename: 'Invoice.pdf',
                    contentType: 'application/pdf',
                    path: data.invoicePath
                }]
            _notifyAll(template, sendTo, to, tokens, variables, data.order_id)
            break;
        case NOTIFY.NEW_CONSULTATION:
            sendTo = {
                isEmail: true, isPush: true, isSms: true
            }
            var { plan_name } = data
            variables = {
                name,
                plan_name,
                link: `${process.env.APP_URL}/a/orders`,
            }
            _notifyAll(template, sendTo, to, tokens, variables, data.order_id)
            break;
        case NOTIFY.PAYOUT_INITIATED:
            sendTo = {
                isEmail: true, isPush: true, isTelegram: true
            }
            var {amount} = data
            variables = {
                name,
                amount
            }
            _notifyAll(template, sendTo, to, tokens, variables, data.id)
            break;
        case NOTIFY.PAYOUT_PROCESSED:
            sendTo = {
                isEmail: true, isPush: true, isTelegram: true
            }
            variables = [name, data.amount]
            _notifyAll(template, sendTo, to, tokens, variables, data.id)
            break;
        case NOTIFY.NEW_REVIEW:
            sendTo = {
                isEmail: true, isPush: true, isTelegram: true
            }
            var { review } = data
            variables = {
                name, 
                review
            }
            _notifyAll(template, sendTo, to, tokens, variables, data.review_to)
            break;
        case NOTIFY.LEAD_QUOTE:
            sendTo = {
                isEmail: true, isTelegram: true
            }
            var {
                topic, sub_topic, phone
            } = data
            variables = {
                name, topic, sub_topic, phone,
                client_name : data.name
            }
            _notifyAll(template, sendTo, to, tokens, variables, data.id)
            break;
        case NOTIFY.REFUND_PROCESSED:
            sendTo = {
                isEmail: true, isPush: true,  isSms: true, isTelegram: true
            }
            var { order_id, final_total,refund_amount } = data
            variables = {
                name,
                order_id,
                final_total,
                refund_amount
            }
            _notifyAll(template, sendTo, to, tokens, variables, data.order_id)
            break;
        case NOTIFY.ORDER_ASSIGNED_USER:
        case NOTIFY.ORDER_ASSIGNED_LAWYER:
        case NOTIFY.CONSULTATION_INPROGRESS:
        case NOTIFY.CONSULTATION_COMPLETE:
        case NOTIFY.CONSULTATION_APPROVED:
            sendTo = {
                isEmail: true, isPush: true, isTelegram: true
            }
            var { plan_name, order_type } = data
            variables = {
                name,
                plan_name,
                order_type
            }
            _notifyAll(template, sendTo, to, tokens, variables, data.order_id)
            break;
        default:
            break;
    }
}
