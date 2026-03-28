import easyinvoice from 'easyinvoice';
import fs from 'fs';
import Mustache from 'mustache';
import { INVOICE_FORMAT } from '../constants';
import { getOrderById, getUser } from '../dao';
import { createInvoice, updateInvoice } from '../dao/invoiceDao';
import { uploadBufferFile } from './cloudinary';
import { UTCtoIST } from './common';
import path from 'path';


// const _invoicePayload = (order_id, path) => {
//     let format = INVOICE_FORMAT
//     format = format.replace("YEAR", new Date().getFullYear());
//     format = format.replace("ORDER_ID", order_id);
//     return {
//         order_id,
//         format,
//         path
//     }
// }

export const createOrderInvoice = async (order) => {
    const { 
        order_id,order_by,createdAt,order_type,plan_name,
        sub_total,
        order_amount,
        tax,
        final_total,
        tax_percentage,
        discount_amount } = order
        

    const user = await getUser({ registration_id:order_by })
    const {registration_id,name,email,mobile,locality,city, state}= user
    //Create Invoice
    // const invoice = _invoicePayload(order_id, upload.secure_url)
    const invoiceObj = await createInvoice({order_id})
    let invoice_id = INVOICE_FORMAT
        invoice_id = invoice_id.replace("{YEAR}", new Date().getFullYear());
        invoice_id = invoice_id.replace("{INVOICE_ID}", invoiceObj.id);
    //Create Invoice

   
    //Create PDF Invoice
    const template = fs.readFileSync('./locales/invoice.html', { encoding: 'utf8' });
    const gst =  Math.round(tax)
    let params = {
        registration_id,
        order_id,
        invoice_id,
        order_type,
        plan_name,
        locality,
        name,
        city,
        state,
        email,
        mobile,
        invoice_date: UTCtoIST(createdAt),
        order_amount,
        sub_total,
        tax_percentage,
        igst: state.toLowerCase() == 'haryana' ? null : gst ,
        cgst: state.toLowerCase() == 'haryana' ?  Math.round(gst/2) : null ,
        sgst: state.toLowerCase() == 'haryana' ?  Math.round(gst/2): null ,
        final_total,
        discount_amount
    }
    const filledTemplate = Mustache.render(template, params);
    const data = {
        customize: {
            "template": Buffer.from(filledTemplate).toString('base64')
        }
    };
    const result = await easyinvoice.createInvoice(data);
    const upload = await uploadBufferFile(
        `${process.env.CLOUDINARY_INVOICE_DIRECTORY || 'invoices'}/${order_id}/`,
        `${invoiceObj.id}-${Date.now()}`,
        Buffer.from(result.pdf, "base64")
    );
    const url = upload.secure_url
    //Create PDF Invoice


    //Update Invoice
    await updateInvoice(invoiceObj, {invoice_id,path:url});
    //Update Invoice

    // await fs.writeFileSync(name, result.pdf, 'base64');
    return url
}
