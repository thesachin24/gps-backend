import Razorpay from 'razorpay'
import {
    RazorPayContact,
    RazorPayFundAccount,
    RazorPayTransactions,
    RazorPayPayout
} from 'razorpayx-nodejs-sdk'

const instance = new Razorpay({
    key_id: process.env.RAZORPAYX_API_KEY,
    key_secret: process.env.RAZORPAYX_API_PRIVATE_SECRET
})


export const createOrderRazorpay = payload => instance.orders.create(payload);

export const createSubscriptionRazorpay = payload => instance.subscriptions.create(payload);
//RazorpayX Library
export const createContactsRazorpay = payload => RazorPayContact.create(payload)

export const createFundAccountRazorpay = payload => RazorPayFundAccount.create(payload)

export const activateFundAccountRazorpay = account_id => RazorPayFundAccount.activate(account_id)

export const deactivateFundAccountRazorpay = payload => RazorPayFundAccount.deactivate(payload)

export const createPayoutRazorpay = payload => RazorPayPayout.create(payload)

// export const transactionsRazorpay = payload => RazorPayTransactions.create(payload)
