import { eq, and, sql, desc, asc } from "drizzle-orm";
import { db } from "../config/database";
import {
  payments,
  interviewSessions,
  interviewers,
  interviewerEarnings,
  interviewerPayouts,
  jobSeekers,
  users,
  admins,
  packageDeals,
  packagePurchases,
} from "../db/schema";
import {
  generatePayHereHash,
  generateOrderId,
  verifyWebhookHash,
  calculateRefundAmount,
} from "../utils/payhere.utils";
import { notifySessionStateChange } from "../utils/notification.utils";

const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || "";
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || "";
const SANDBOX = process.env.PAYHERE_MODE === "sandbox";
const CHECKOUT_URL =
  SANDBOX
    ? "https://sandbox.payhere.lk/pay/checkout"
    : "https://www.payhere.lk/pay/checkout";
const APP_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// ─── INITIATE PAYMENT ───────────────────────────────────────────────────────

/**
 * Prepare PayHere checkout params for a session booking.
 * Returns the hash + all form fields needed to redirect to PayHere checkout.
 */
export const initiatePayment = async (sessionId: number, userId: number) => {
  // Fetch session + job seeker + interviewer details
  const [session] = await db
    .select({
      id: interviewSessions.id,
      priceAmount: interviewSessions.priceAmount,
      duration: interviewSessions.duration,
      scheduledDate: interviewSessions.scheduledDate,
      sessionStatus: interviewSessions.sessionStatus,
      jobSeekerId: interviewSessions.jobSeekerId,
      interviewerId: interviewSessions.interviewerId,
    })
    .from(interviewSessions)
    .where(eq(interviewSessions.id, sessionId))
    .limit(1);

  if (!session) throw new Error("Session not found");
  if (session.sessionStatus !== "pending")
    throw new Error("Session is not in pending state");

  // Get job seeker details
  const [jobSeeker] = await db
    .select({ id: jobSeekers.id, userId: jobSeekers.userId })
    .from(jobSeekers)
    .where(eq(jobSeekers.userId, userId))
    .limit(1);

  if (!jobSeeker) throw new Error("Job seeker not found");
  if (jobSeeker.id !== session.jobSeekerId) throw new Error("Unauthorized");

  // Get user info for PayHere fields
  const [userInfo] = await db
    .select({ firstName: users.firstName, lastName: users.lastName, email: users.email, phone: users.phoneNumber })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  // Get interviewer commission rate
  const [interviewer] = await db
    .select({ commissionRate: interviewers.commissionRate })
    .from(interviewers)
    .where(eq(interviewers.id, session.interviewerId))
    .limit(1);

  const amount = parseFloat(session.priceAmount);
  const commissionRate = parseFloat(interviewer?.commissionRate || "20");
  
  // amount is TotalPrice (BaseRate + SystemFee)
  const baseRate = amount / (1 + commissionRate / 100);
  const platformCommission = Math.round((amount - baseRate) * 100) / 100;
  const interviewerPayout = Math.round(baseRate * 100) / 100;

  const orderId = generateOrderId(sessionId);
  const currency = "LKR";

  const hash = generatePayHereHash(MERCHANT_ID, orderId, amount, currency, MERCHANT_SECRET);

  // Upsert payment record as pending
  const existingPayment = await db
    .select({ id: payments.id })
    .from(payments)
    .where(eq(payments.sessionId, sessionId))
    .limit(1);

  if (existingPayment.length > 0) {
    await db
      .update(payments)
      .set({
        payhereOrderId: orderId,
        paymentStatus: "pending",
        updatedAt: new Date(),
      })
      .where(eq(payments.sessionId, sessionId));
  } else {
    await db.insert(payments).values({
      sessionId,
      jobSeekerId: jobSeeker.id,
      interviewerId: session.interviewerId,
      amount: amount.toFixed(2),
      platformCommission: platformCommission.toFixed(2),
      interviewerPayout: interviewerPayout.toFixed(2),
      currency,
      payhereOrderId: orderId,
      paymentStatus: "pending",
    });
  }

  return {
    checkoutUrl: CHECKOUT_URL,
    formParams: {
      merchant_id: MERCHANT_ID,
      return_url: `${APP_URL}/job-seeker/booking-confirmation?order_id=${orderId}&session_id=${sessionId}`,
      cancel_url: `${APP_URL}/job-seeker/interviewers`,
      notify_url: process.env.PAYHERE_NOTIFY_URL || "http://localhost:3001/api/payments/webhook",
      order_id: orderId,
      items: `Mock Interview Session #${sessionId}`,
      currency,
      amount: amount.toFixed(2),
      first_name: userInfo?.firstName || "",
      last_name: userInfo?.lastName || "",
      email: userInfo?.email || "",
      phone: userInfo?.phone || "",
      address: "N/A",
      city: "Colombo",
      country: "Sri Lanka",
      hash,
    },
  };
};

// ─── PROCESS WEBHOOK ────────────────────────────────────────────────────────

/**
 * Process PayHere payment notification (webhook).
 * PayHere status codes: 2 = Success, 0 = Pending, -1 = Cancelled, -2 = Failed, -3 = Chargedback
 */
export const processWebhook = async (body: Record<string, string>) => {
  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
    payment_id,
    method,
  } = body;

  // Verify webhook authenticity
  const isValid = verifyWebhookHash({
    merchantId: merchant_id,
    orderId: order_id,
    amount: payhere_amount,
    currency: payhere_currency,
    statusCode: status_code,
    md5sig,
    merchantSecret: MERCHANT_SECRET,
  });

  if (!isValid) {
    console.warn("[PayHere Webhook] Invalid hash. Ignoring notification.");
    return { success: false, reason: "invalid_hash" };
  }

  const rawStatus = parseInt(status_code, 10);

  // ─── PACKAGE PURCHASE WEBHOOK ─────────────────────────────────────────────
  if (order_id.startsWith("PKG_")) {
    const parts = order_id.split("_");
    const jobSeekerId = parseInt(parts[1], 10);
    const packageId = parseInt(parts[2], 10);

    if (rawStatus === 2) {
      const [deal] = await db
        .select()
        .from(packageDeals)
        .where(eq(packageDeals.id, packageId))
        .limit(1);

      if (deal) {
        const now = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(now.getDate() + (deal.validityDays || 30));

        await db.insert(packagePurchases).values({
          jobSeekerId,
          packageId,
          totalCredits: deal.sessionCount,
          creditsRemaining: deal.sessionCount,
          purchaseDate: now,
          expiryDate,
          isActive: true,
        });

        console.log(`[PayHere Webhook] Package purchase successful for Job Seeker #${jobSeekerId}, Package #${packageId}`);
        return { success: true, status: "package_purchased" };
      }
    }
    return { success: true, status: "package_pending" };
  }

  // Find the payment record by order ID
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.payhereOrderId, order_id))
    .limit(1);

  if (!payment) {
    console.warn(`[PayHere Webhook] No payment found for order_id: ${order_id}`);
    return { success: false, reason: "payment_not_found" };
  }

  // ── Payment Success (status 2) ────────────────────────────────────────────
  if (rawStatus === 2) {
    const now = new Date();
    const payoutMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    await db
      .update(payments)
      .set({
        payhereTransactionId: payment_id,
        paymentMethod: method,
        paymentStatus: "completed",
        payhereRawStatus: rawStatus,
        paymentDate: now,
        updatedAt: now,
      })
      .where(eq(payments.id, payment.id));

    // Update session updatedAt only (keep status as pending or whatever it is)
    await db
      .update(interviewSessions)
      .set({ updatedAt: now })
      .where(eq(interviewSessions.id, payment.sessionId));

    // Create interviewer_earnings record
    const [session] = await db
      .select({ duration: interviewSessions.duration })
      .from(interviewSessions)
      .where(eq(interviewSessions.id, payment.sessionId))
      .limit(1);

    const durationHours = session ? (session.duration / 60).toFixed(2) : "1.00";

    const existingEarning = await db
      .select({ id: interviewerEarnings.id })
      .from(interviewerEarnings)
      .where(eq(interviewerEarnings.sessionId, payment.sessionId))
      .limit(1);

    if (existingEarning.length === 0) {
      await db.insert(interviewerEarnings).values({
        interviewerId: payment.interviewerId,
        sessionId: payment.sessionId,
        paymentId: payment.id,
        grossAmount: payment.amount,
        commissionDeducted: payment.platformCommission,
        netEarning: payment.interviewerPayout,
        sessionDurationHours: durationHours,
        payoutMonth,
      });
    }

    // Send notifications
    await notifySessionStateChange(payment.sessionId, "payment_success");

    console.log(`[PayHere Webhook] Payment completed for session #${payment.sessionId}`);
    return { success: true, status: "completed" };
  }

  // ── Cancelled / Failed ────────────────────────────────────────────────────
  if (rawStatus === -1 || rawStatus === -2 || rawStatus === -3) {
    await db
      .update(payments)
      .set({
        paymentStatus: rawStatus === -1 ? "cancelled" : "failed",
        payhereRawStatus: rawStatus,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    return { success: true, status: "cancelled_or_failed" };
  }

  return { success: true, status: "ignored", rawStatus };
};

// ─── VERIFY PAYMENT STATUS ───────────────────────────────────────────────────

/**
 * Get payment status by order ID (used on the confirmation page).
 */
export const getPaymentByOrderId = async (orderId: string) => {
  const [payment] = await db
    .select({
      id: payments.id,
      sessionId: payments.sessionId,
      amount: payments.amount,
      currency: payments.currency,
      paymentStatus: payments.paymentStatus,
      payhereTransactionId: payments.payhereTransactionId,
      paymentDate: payments.paymentDate,
    })
    .from(payments)
    .where(eq(payments.payhereOrderId, orderId))
    .limit(1);

  return payment || null;
};

// ─── JOB SEEKER PAYMENTS ────────────────────────────────────────────────────

/**
 * Get all payments for a job seeker.
 */
export const getPaymentsForJobSeeker = async (userId: number) => {
  const [jobSeeker] = await db
    .select({ id: jobSeekers.id })
    .from(jobSeekers)
    .where(eq(jobSeekers.userId, userId))
    .limit(1);

  if (!jobSeeker) return [];

  const result = await db
    .select({
      id: payments.id,
      sessionId: payments.sessionId,
      amount: payments.amount,
      platformCommission: payments.platformCommission,
      interviewerPayout: payments.interviewerPayout,
      currency: payments.currency,
      paymentMethod: payments.paymentMethod,
      payhereOrderId: payments.payhereOrderId,
      payhereTransactionId: payments.payhereTransactionId,
      paymentStatus: payments.paymentStatus,
      refundAmount: payments.refundAmount,
      refundReason: payments.refundReason,
      paymentDate: payments.paymentDate,
      createdAt: payments.createdAt,
      sessionType: interviewSessions.sessionType,
      scheduledDate: interviewSessions.scheduledDate,
      sessionStatus: interviewSessions.sessionStatus,
      duration: interviewSessions.duration,
      interviewerUserId: interviewers.userId,
      interviewerFirstName: users.firstName,
      interviewerLastName: users.lastName,
      interviewerJobTitle: interviewers.jobTitle,
      interviewerCompany: interviewers.currentCompany,
    })
    .from(payments)
    .innerJoin(interviewSessions, eq(payments.sessionId, interviewSessions.id))
    .innerJoin(interviewers, eq(payments.interviewerId, interviewers.id))
    .innerJoin(users, eq(interviewers.userId, users.id))
    .where(eq(payments.jobSeekerId, jobSeeker.id))
    .orderBy(desc(payments.createdAt));

  return result.map((p) => ({
    id: p.id,
    sessionId: p.sessionId,
    amount: parseFloat(p.amount || "0"),
    platformCommission: parseFloat(p.platformCommission || "0"),
    interviewerPayout: parseFloat(p.interviewerPayout || "0"),
    currency: p.currency || "LKR",
    paymentMethod: p.paymentMethod,
    payhereOrderId: p.payhereOrderId,
    payhereTransactionId: p.payhereTransactionId,
    paymentStatus: p.paymentStatus,
    refundAmount: p.refundAmount ? parseFloat(p.refundAmount) : null,
    refundReason: p.refundReason,
    paymentDate: p.paymentDate,
    createdAt: p.createdAt,
    session: {
      type: p.sessionType,
      date: p.scheduledDate,
      status: p.sessionStatus,
      duration: p.duration,
    },
    interviewer: {
      userId: p.interviewerUserId,
      firstName: p.interviewerFirstName,
      lastName: p.interviewerLastName,
      jobTitle: p.interviewerJobTitle,
      company: p.interviewerCompany,
    },
  }));
};

// ─── INTERVIEWER EARNINGS ────────────────────────────────────────────────────

/**
 * Get earnings for an interviewer, optionally filtered by month ("2026-05").
 */
export const getInterviewerEarnings = async (userId: number, month?: string) => {
  const [interviewer] = await db
    .select({ id: interviewers.id, bankAccountNumber: interviewers.bankAccountNumber, commissionRate: interviewers.commissionRate })
    .from(interviewers)
    .where(eq(interviewers.userId, userId))
    .limit(1);

  if (!interviewer) return null;

  const conditions = [eq(interviewerEarnings.interviewerId, interviewer.id)];
  if (month) conditions.push(eq(interviewerEarnings.payoutMonth, month));

  const earnings = await db
    .select({
      id: interviewerEarnings.id,
      sessionId: interviewerEarnings.sessionId,
      grossAmount: interviewerEarnings.grossAmount,
      commissionDeducted: interviewerEarnings.commissionDeducted,
      netEarning: interviewerEarnings.netEarning,
      sessionDurationHours: interviewerEarnings.sessionDurationHours,
      payoutMonth: interviewerEarnings.payoutMonth,
      payoutId: interviewerEarnings.payoutId,
      earnedAt: interviewerEarnings.earnedAt,
      sessionType: interviewSessions.sessionType,
      scheduledDate: interviewSessions.scheduledDate,
      seekerFirstName: users.firstName,
      seekerLastName: users.lastName,
    })
    .from(interviewerEarnings)
    .innerJoin(interviewSessions, eq(interviewerEarnings.sessionId, interviewSessions.id))
    .innerJoin(jobSeekers, eq(interviewSessions.jobSeekerId, jobSeekers.id))
    .innerJoin(users, eq(jobSeekers.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(interviewerEarnings.earnedAt));

  const totalGross = earnings.reduce((s, e) => s + parseFloat(e.grossAmount || "0"), 0);
  const totalNet = earnings.reduce((s, e) => s + parseFloat(e.netEarning || "0"), 0);
  const totalHours = earnings.reduce((s, e) => s + parseFloat(e.sessionDurationHours || "0"), 0);

  // Get payout info for month
  let payoutRecord = null;
  if (month) {
    const [payout] = await db
      .select()
      .from(interviewerPayouts)
      .where(
        and(
          eq(interviewerPayouts.interviewerId, interviewer.id),
          eq(interviewerPayouts.payoutMonth, month)
        )
      )
      .limit(1);
    payoutRecord = payout || null;
  }

  return {
    summary: {
      totalSessions: earnings.length,
      totalHours: Math.round(totalHours * 100) / 100,
      totalGross,
      totalNet,
      commissionRate: parseFloat(interviewer.commissionRate || "20"),
      bankAccountNumber: interviewer.bankAccountNumber,
    },
    payout: payoutRecord,
    earnings: earnings.map((e) => ({
      id: e.id,
      sessionId: e.sessionId,
      grossAmount: parseFloat(e.grossAmount || "0"),
      commissionDeducted: parseFloat(e.commissionDeducted || "0"),
      netEarning: parseFloat(e.netEarning || "0"),
      durationHours: parseFloat(e.sessionDurationHours || "0"),
      payoutMonth: e.payoutMonth,
      payoutId: e.payoutId,
      earnedAt: e.earnedAt,
      session: {
        type: e.sessionType,
        date: e.scheduledDate,
        seekerName: `${e.seekerFirstName} ${e.seekerLastName}`,
      },
    })),
  };
};

// ─── ADMIN PAYOUT MANAGEMENT ─────────────────────────────────────────────────

/**
 * Get all interviewers' pending payout summary for a given month.
 */
export const getAdminPayoutSummary = async (month: string) => {
  const rows = await db
    .select({
      interviewerId: interviewerEarnings.interviewerId,
      payoutMonth: interviewerEarnings.payoutMonth,
      totalSessions: sql<number>`COUNT(*)::int`,
      totalHours: sql<string>`SUM(${interviewerEarnings.sessionDurationHours})`,
      grossAmount: sql<string>`SUM(${interviewerEarnings.grossAmount})`,
      commissionDeducted: sql<string>`SUM(${interviewerEarnings.commissionDeducted})`,
      netPayoutAmount: sql<string>`SUM(${interviewerEarnings.netEarning})`,
      interviewerFirstName: users.firstName,
      interviewerLastName: users.lastName,
      interviewerEmail: users.email,
      bankAccountNumber: interviewers.bankAccountNumber,
    })
    .from(interviewerEarnings)
    .innerJoin(interviewers, eq(interviewerEarnings.interviewerId, interviewers.id))
    .innerJoin(users, eq(interviewers.userId, users.id))
    .where(eq(interviewerEarnings.payoutMonth, month))
    .groupBy(
      interviewerEarnings.interviewerId,
      interviewerEarnings.payoutMonth,
      users.firstName,
      users.lastName,
      users.email,
      interviewers.bankAccountNumber
    );

  // Check which have already been paid out
  const payouts = await db
    .select()
    .from(interviewerPayouts)
    .where(eq(interviewerPayouts.payoutMonth, month));

  const payoutMap = new Map(payouts.map((p) => [p.interviewerId, p]));

  return rows.map((row) => ({
    interviewerId: row.interviewerId,
    payoutMonth: row.payoutMonth,
    totalSessions: row.totalSessions,
    totalHours: parseFloat(row.totalHours || "0"),
    grossAmount: parseFloat(row.grossAmount || "0"),
    commissionDeducted: parseFloat(row.commissionDeducted || "0"),
    netPayoutAmount: parseFloat(row.netPayoutAmount || "0"),
    interviewer: {
      firstName: row.interviewerFirstName,
      lastName: row.interviewerLastName,
      email: row.interviewerEmail,
      bankAccountNumber: row.bankAccountNumber,
    },
    payoutRecord: payoutMap.get(row.interviewerId) || null,
  }));
};

/**
 * Release monthly payouts for selected interviewers.
 * Creates an interviewerPayouts record and links earnings rows to it.
 */
export const releasePayouts = async (
  interviewerIds: number[],
  month: string,
  adminId: number | null,
  autoReleased = false
) => {
  const summary = await getAdminPayoutSummary(month);
  const toRelease = summary.filter((s) => interviewerIds.includes(s.interviewerId) && !s.payoutRecord);

  const released: number[] = [];

  for (const item of toRelease) {
    const [payout] = await db
      .insert(interviewerPayouts)
      .values({
        interviewerId: item.interviewerId,
        payoutMonth: month,
        totalSessions: item.totalSessions,
        totalHours: item.totalHours.toFixed(2),
        grossAmount: item.grossAmount.toFixed(2),
        commissionDeducted: item.commissionDeducted.toFixed(2),
        netPayoutAmount: item.netPayoutAmount.toFixed(2),
        payoutStatus: "paid",
        bankAccountNumber: item.interviewer.bankAccountNumber || null,
        releasedByAdminId: adminId || null,
        releasedAt: new Date(),
        autoReleased,
      })
      .returning({ id: interviewerPayouts.id });

    // Link earnings rows to this payout
    await db
      .update(interviewerEarnings)
      .set({ payoutId: payout.id })
      .where(
        and(
          eq(interviewerEarnings.interviewerId, item.interviewerId),
          eq(interviewerEarnings.payoutMonth, month)
        )
      );

    released.push(item.interviewerId);
  }

  return { released, skipped: interviewerIds.length - released.length };
};

/**
 * Auto-release payouts for a given month if not yet released.
 * Called by a cron job 7 days after month end.
 */
export const autoReleaseOverduePayouts = async (month: string) => {
  const summary = await getAdminPayoutSummary(month);
  const pending = summary.filter((s) => !s.payoutRecord).map((s) => s.interviewerId);

  if (pending.length === 0) return { released: 0 };

  // Use null admin ID to mark as system-released
  const result = await releasePayouts(pending, month, null, true);
  console.log(`[AutoPayout] Released ${result.released} payouts for ${month}`);
  return { released: result.released };
};

// ─── CANCEL SESSION PAYMENT ──────────────────────────────────────────────────

/**
 * Handle cancellation refund for a session.
 * Cancelled sessions are NOT added to interviewer_earnings.
 */
export const cancelSessionPayment = async (sessionId: number, cancelledByUserId: number, forceFullRefund = false) => {
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.sessionId, sessionId))
    .limit(1);

  if (!payment) return null;
  if (payment.paymentStatus === "cancelled" || payment.paymentStatus === "refunded") return payment;

  const [session] = await db
    .select({ scheduledDate: interviewSessions.scheduledDate, sessionStatus: interviewSessions.sessionStatus })
    .from(interviewSessions)
    .where(eq(interviewSessions.id, sessionId))
    .limit(1);

  const effectiveStatus = forceFullRefund ? "pending" : (session.sessionStatus || "scheduled");

  const { refundAmount, reason } = calculateRefundAmount(
    new Date(session.scheduledDate),
    parseFloat(payment.amount),
    effectiveStatus
  );

  const newStatus = refundAmount > 0 ? "refunded" : "cancelled";

  await db
    .update(payments)
    .set({
      paymentStatus: newStatus,
      refundAmount: refundAmount > 0 ? refundAmount.toFixed(2) : null,
      refundReason: reason,
      refundDate: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(payments.id, payment.id));

  // Remove any earnings record that may have been created
  await db
    .delete(interviewerEarnings)
    .where(eq(interviewerEarnings.sessionId, sessionId));

  return { refundAmount, reason, newStatus };
};

// ─── PACKAGE DEALS & CREDIT BOOKINGS ─────────────────────────────────────────

/**
 * Fallback for when the PayHere webhook doesn't fire (common in dev / localhost).
 * Called from the return_url after PayHere redirects the user back.
 * Parses the PKG_ order ID and idempotently creates the packagePurchase record.
 *
 * orderId format: PKG_{jobSeekerId}_{packageId}_{timestamp}
 */
export const verifyPackagePurchase = async (orderId: string, userId: number) => {
  // Validate it looks like a package order
  if (!orderId.startsWith("PKG_")) {
    throw new Error("Not a package order ID");
  }

  // Resolve the job seeker making the request
  const [jobSeeker] = await db
    .select({ id: jobSeekers.id })
    .from(jobSeekers)
    .where(eq(jobSeekers.userId, userId))
    .limit(1);

  if (!jobSeeker) throw new Error("Job seeker not found");

  // Parse the order ID
  const parts = orderId.split("_");
  // PKG_<jobSeekerId>_<packageId>_<timestamp>
  if (parts.length < 4) throw new Error("Invalid package order ID format");

  const orderJobSeekerId = parseInt(parts[1], 10);
  const packageId = parseInt(parts[2], 10);

  // Ensure this order belongs to the requesting user
  if (orderJobSeekerId !== jobSeeker.id) {
    throw new Error("Order does not belong to this user");
  }

  // Check if a purchase already exists for this order (idempotency)
  // We store the orderId in a separate field on packagePurchases — but since we don't have one,
  // we'll check if a purchase was created after the timestamp encoded in the orderId.
  const orderTimestamp = parseInt(parts[3], 10);
  const orderDate = new Date(orderTimestamp);

  const existingPurchases = await db
    .select({ id: packagePurchases.id })
    .from(packagePurchases)
    .where(
      and(
        eq(packagePurchases.jobSeekerId, jobSeeker.id),
        eq(packagePurchases.packageId, packageId),
        sql`purchase_date >= ${orderDate.toISOString()}::timestamptz - interval '5 minutes'`
      )
    )
    .limit(1);

  if (existingPurchases.length > 0) {
    // Already processed (webhook fired before return_url callback)
    return { credited: false, reason: "already_processed" };
  }

  // Get the package details
  const [deal] = await db
    .select()
    .from(packageDeals)
    .where(eq(packageDeals.id, packageId))
    .limit(1);

  if (!deal) throw new Error("Package deal not found");

  const now = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(now.getDate() + (deal.validityDays || 30));

  await db.insert(packagePurchases).values({
    jobSeekerId: jobSeeker.id,
    packageId,
    totalCredits: deal.sessionCount,
    creditsRemaining: deal.sessionCount,
    purchaseDate: now,
    expiryDate,
    isActive: true,
  });

  console.log(`[verifyPackagePurchase] Created package purchase for Job Seeker #${jobSeeker.id}, Package #${packageId} (fallback)`);
  return { credited: true, credits: deal.sessionCount, packageName: deal.packageName };
};

/**
 * Prepare PayHere checkout parameters for purchasing a package deal.
 */
export const initiatePackagePurchase = async (packageId: number, userId: number) => {
  const [deal] = await db
    .select()
    .from(packageDeals)
    .where(eq(packageDeals.id, packageId))
    .limit(1);

  if (!deal) throw new Error("Package not found");
  if (!deal.isActive) throw new Error("Package is inactive");

  const [jobSeeker] = await db
    .select({ id: jobSeekers.id })
    .from(jobSeekers)
    .where(eq(jobSeekers.userId, userId))
    .limit(1);

  if (!jobSeeker) throw new Error("Job seeker not found");

  const [userInfo] = await db
    .select({ firstName: users.firstName, lastName: users.lastName, email: users.email, phone: users.phoneNumber })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const amount = parseFloat(deal.price);
  const orderId = `PKG_${jobSeeker.id}_${packageId}_${Date.now()}`;
  const currency = "LKR";

  const hash = generatePayHereHash(MERCHANT_ID, orderId, amount, currency, MERCHANT_SECRET);

  return {
    checkoutUrl: CHECKOUT_URL,
    formParams: {
      merchant_id: MERCHANT_ID,
      return_url: `${APP_URL}/job-seeker/payments?purchase_success=true&order_id=${orderId}`,
      cancel_url: `${APP_URL}/job-seeker/payments`,
      notify_url: process.env.PAYHERE_NOTIFY_URL || "http://localhost:3001/api/payments/webhook",
      order_id: orderId,
      items: `Session Package - ${deal.packageName} (${deal.sessionCount} Credits)`,
      currency,
      amount: amount.toFixed(2),
      first_name: userInfo?.firstName || "",
      last_name: userInfo?.lastName || "",
      email: userInfo?.email || "",
      phone: userInfo?.phone || "",
      address: "N/A",
      city: "Colombo",
      country: "Sri Lanka",
      hash,
    },
  };
};

/**
 * Retrieve the active package credit balance for a job seeker.
 */
export const getPackageBalance = async (userId: number) => {
  const [jobSeeker] = await db
    .select({ id: jobSeekers.id })
    .from(jobSeekers)
    .where(eq(jobSeekers.userId, userId))
    .limit(1);

  if (!jobSeeker) {
    return { balance: 0 };
  }

  const activePurchases = await db
    .select()
    .from(packagePurchases)
    .where(
      and(
        eq(packagePurchases.jobSeekerId, jobSeeker.id),
        eq(packagePurchases.isActive, true),
        sql`credits_remaining > 0`,
        sql`expiry_date > NOW()`
      )
    );

  const balance = activePurchases.reduce((sum, p) => sum + p.creditsRemaining, 0);
  return { balance };
};

/**
 * Book a mock interview session by consuming 1 package credit.
 */
export const bookSessionWithCredit = async (sessionId: number, userId: number) => {
  const [jobSeeker] = await db
    .select({ id: jobSeekers.id })
    .from(jobSeekers)
    .where(eq(jobSeekers.userId, userId))
    .limit(1);

  if (!jobSeeker) throw new Error("Job seeker not found");

  const [session] = await db
    .select()
    .from(interviewSessions)
    .where(eq(interviewSessions.id, sessionId))
    .limit(1);

  if (!session) throw new Error("Session not found");
  if (session.jobSeekerId !== jobSeeker.id) throw new Error("Unauthorized");
  if (session.sessionStatus !== "pending") throw new Error("Session is not in pending state");

  const [activePurchase] = await db
    .select()
    .from(packagePurchases)
    .where(
      and(
        eq(packagePurchases.jobSeekerId, jobSeeker.id),
        eq(packagePurchases.isActive, true),
        sql`credits_remaining > 0`,
        sql`expiry_date > NOW()`
      )
    )
    .orderBy(asc(packagePurchases.purchaseDate))
    .limit(1);

  if (!activePurchase) throw new Error("No active session credits available");

  return await db.transaction(async (tx) => {
    // 1. Decrement credits remaining
    await tx
      .update(packagePurchases)
      .set({
        creditsRemaining: activePurchase.creditsRemaining - 1,
      })
      .where(eq(packagePurchases.id, activePurchase.id));

    // 2. Create completed payment record for the session
    const amount = parseFloat(session.priceAmount);
    const [interviewer] = await tx
      .select({ commissionRate: interviewers.commissionRate })
      .from(interviewers)
      .where(eq(interviewers.id, session.interviewerId))
      .limit(1);

    const commissionRate = parseFloat(interviewer?.commissionRate || "20");
    const baseRate = amount / (1 + commissionRate / 100);
    const platformCommission = Math.round((amount - baseRate) * 100) / 100;
    const interviewerPayout = Math.round(baseRate * 100) / 100;
    const orderId = `CREDIT_${sessionId}_${Date.now()}`;

    const [paymentRecord] = await tx
      .insert(payments)
      .values({
        sessionId,
        jobSeekerId: jobSeeker.id,
        interviewerId: session.interviewerId,
        amount: amount.toFixed(2),
        platformCommission: platformCommission.toFixed(2),
        interviewerPayout: interviewerPayout.toFixed(2),
        currency: "LKR",
        paymentMethod: "Credit Package Voucher",
        payhereOrderId: orderId,
        paymentStatus: "completed",
        paymentDate: new Date(),
      })
      .returning();

    // 3. Update session status to 'scheduled' since payment is complete, and auto-generate Jitsi Meet link
    const safeTopic = (session.sessionType || "interview").replace(/[^a-zA-Z0-9]/g, "");
    const timestamp = session.scheduledDate ? new Date(session.scheduledDate).getTime() : Date.now();
    const jitsiRoom = `InterviewAce-${safeTopic}-${timestamp}`;
    const autoMeetingLink = `https://meet.jit.si/${jitsiRoom}`;

    await tx
      .update(interviewSessions)
      .set({ 
        sessionStatus: "scheduled", 
        meetingLink: autoMeetingLink,
        updatedAt: new Date() 
      })
      .where(eq(interviewSessions.id, sessionId));

    // Send notifications
    await notifySessionStateChange(sessionId, "payment_success");

    return { success: true, paymentId: paymentRecord.id, orderId };
  });
};

/**
 * Auto-complete session payment in development mode if the webhook doesn't fire.
 */
export const verifySessionPaymentDev = async (orderId: string) => {
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.payhereOrderId, orderId))
    .limit(1);

  if (!payment) return null;
  if (payment.paymentStatus === "completed") return payment;

  const now = new Date();
  const payoutMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  await db
    .update(payments)
    .set({
      payhereTransactionId: `MOCK_TX_${Date.now()}`,
      paymentMethod: "Mock Card (Dev Fallback)",
      paymentStatus: "completed",
      payhereRawStatus: 2,
      paymentDate: now,
      updatedAt: now,
    })
    .where(eq(payments.id, payment.id));

  await db
    .update(interviewSessions)
    .set({ updatedAt: now })
    .where(eq(interviewSessions.id, payment.sessionId));

  const [session] = await db
    .select({ duration: interviewSessions.duration })
    .from(interviewSessions)
    .where(eq(interviewSessions.id, payment.sessionId))
    .limit(1);

  const durationHours = session ? (session.duration / 60).toFixed(2) : "1.00";

  const existingEarning = await db
    .select({ id: interviewerEarnings.id })
    .from(interviewerEarnings)
    .where(eq(interviewerEarnings.sessionId, payment.sessionId))
    .limit(1);

  if (existingEarning.length === 0) {
    await db.insert(interviewerEarnings).values({
      interviewerId: payment.interviewerId,
      sessionId: payment.sessionId,
      paymentId: payment.id,
      grossAmount: payment.amount,
      commissionDeducted: payment.platformCommission,
      netEarning: payment.interviewerPayout,
      sessionDurationHours: durationHours,
      payoutMonth,
    });
  }

  await notifySessionStateChange(payment.sessionId, "payment_success");

  console.log(`[Dev Fallback] Payment auto-completed for order ID: ${orderId}`);
  
  // Return the updated payment record
  const [updatedPayment] = await db
    .select({
      id: payments.id,
      sessionId: payments.sessionId,
      amount: payments.amount,
      currency: payments.currency,
      paymentStatus: payments.paymentStatus,
      payhereTransactionId: payments.payhereTransactionId,
      paymentDate: payments.paymentDate,
    })
    .from(payments)
    .where(eq(payments.id, payment.id))
    .limit(1);

  return updatedPayment;
};

export default {
  initiatePayment,
  processWebhook,
  getPaymentByOrderId,
  getPaymentsForJobSeeker,
  getInterviewerEarnings,
  getAdminPayoutSummary,
  releasePayouts,
  autoReleaseOverduePayouts,
  cancelSessionPayment,
  initiatePackagePurchase,
  getPackageBalance,
  bookSessionWithCredit,
  verifyPackagePurchase,
  verifySessionPaymentDev,
};
