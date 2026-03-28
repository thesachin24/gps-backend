import { WALLET_CREDIT_MULTIPLY, WALLET_CREDIT_MULTIPLY_PRO } from "../constants";

export const calculateCredits = (lawyerObj,order_amount) => {
  let credits = 0
  const normalCredits = order_amount * WALLET_CREDIT_MULTIPLY
  const proCredits = order_amount * WALLET_CREDIT_MULTIPLY_PRO
    if (lawyerObj.is_pro) {
      credits = proCredits
    } else {
      credits = normalCredits
    }
    return {credits,normalCredits, proCredits}
}