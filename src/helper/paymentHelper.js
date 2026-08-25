import { CHECKOUT_TITLE, TAX } from "../constants";

export const getCheckoutObject = async type => {
  return {
    title:{
      heading: "Pay for "+ type,
      fee: CHECKOUT_TITLE.FEE,
      validity: CHECKOUT_TITLE.VALIDITY,
      tax: TAX
    }
  }
}
