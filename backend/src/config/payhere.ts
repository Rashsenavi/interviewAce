import crypto from "crypto";

const PAYHERE_MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || "";
const PAYHERE_MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || "";
const PAYHERE_RETURN_URL = process.env.PAYHERE_RETURN_URL || "http://localhost:3000/payment/success";
const PAYHERE_CANCEL_URL = process.env.PAYHERE_CANCEL_URL || "http://localhost:3000/payment/cancel";
const PAYHERE_NOTIFY_URL = process.env.PAYHERE_NOTIFY_URL || "http://localhost:3001/api/payments/webhook";

export interface PayHerePaymentData {
  merchant_id: string;
  return_web: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: number;
  currency: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  merchant_secret?: string;
}

/**
 * Generate PayHere merchant signature
 */
export const generatePayHereSignature = (
  merchantId: string,
  orderId: string,
  amount: string | number,
  currency: string,
  merchantSecret: string
): string => {
  const signatureString = `${merchantId}${orderId}${amount}${currency}${merchantSecret}`;
  return crypto.createHash("md5").update(signatureString).digest("hex");
};

/**
 * Verify PayHere payment notification signature
 */
export const verifyPayHereSignature = (
  merchantId: string,
  orderId: string,
  amount: string | number,
  currency: string,
  statusCode: string,
  providedSignature: string,
  merchantSecret: string
): boolean => {
  const signatureString = `${merchantId}${orderId}${amount}${currency}${statusCode}${merchantSecret}`;
  const calculatedSignature = crypto.createHash("md5").update(signatureString).digest("hex");
  return calculatedSignature === providedSignature;
};

export default {
  PAYHERE_MERCHANT_ID,
  PAYHERE_MERCHANT_SECRET,
  PAYHERE_RETURN_URL,
  PAYHERE_CANCEL_URL,
  PAYHERE_NOTIFY_URL,
  generatePayHereSignature,
  verifyPayHereSignature,
};
