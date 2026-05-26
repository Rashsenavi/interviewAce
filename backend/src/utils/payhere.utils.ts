import crypto from "crypto";

/**
 * Generate PayHere payment hash (server-side only).
 * Formula: MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase()).toUpperCase()
 */
export function generatePayHereHash(
  merchantId: string,
  orderId: string,
  amount: number,
  currency: string,
  merchantSecret: string
): string {
  const hashedSecret = crypto
    .createHash("md5")
    .update(merchantSecret)
    .digest("hex")
    .toUpperCase();

  const raw = `${merchantId}${orderId}${amount.toFixed(2)}${currency}${hashedSecret}`;

  return crypto.createHash("md5").update(raw).digest("hex").toUpperCase();
}

/**
 * Verify the hash in a PayHere webhook notification.
 * PayHere POSTs: merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig
 * Formula: MD5(merchant_id + order_id + amount + currency + status_code + MD5(secret).toUpperCase()).toUpperCase()
 */
export function verifyWebhookHash(params: {
  merchantId: string;
  orderId: string;
  amount: string;
  currency: string;
  statusCode: string;
  md5sig: string;
  merchantSecret: string;
}): boolean {
  const hashedSecret = crypto
    .createHash("md5")
    .update(params.merchantSecret)
    .digest("hex")
    .toUpperCase();

  const raw = `${params.merchantId}${params.orderId}${params.amount}${params.currency}${params.statusCode}${hashedSecret}`;
  const expected = crypto.createHash("md5").update(raw).digest("hex").toUpperCase();

  return expected === params.md5sig;
}

/**
 * Generate a unique, short order ID for a session.
 * Format: IA-<sessionId>-<timestamp6digit>
 */
export function generateOrderId(sessionId: number): string {
  const ts = Date.now().toString().slice(-6);
  return `IA-${sessionId}-${ts}`;
}

/**
 * Calculate refund amount based on cancellation time relative to session date.
 * Standard tiered refund policy:
 *   - 24h+ before session  → 100% refund
 *   - 2h–24h before session → 50% refund
 *   - Within 2h / no-show  → 0% refund
 */
export function calculateRefundAmount(
  sessionDate: Date,
  totalAmount: number
): { refundAmount: number; refundPercentage: number; reason: string } {
  const now = new Date();
  const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilSession >= 24) {
    return {
      refundAmount: totalAmount,
      refundPercentage: 100,
      reason: "Full refund — cancelled more than 24 hours before session.",
    };
  } else if (hoursUntilSession >= 2) {
    return {
      refundAmount: Math.round(totalAmount * 0.5 * 100) / 100,
      refundPercentage: 50,
      reason: "50% refund — cancelled between 2 and 24 hours before session.",
    };
  } else {
    return {
      refundAmount: 0,
      refundPercentage: 0,
      reason: "No refund — cancelled within 2 hours of session or no-show.",
    };
  }
}
