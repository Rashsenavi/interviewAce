import { eq } from "drizzle-orm";
import { db } from "../config/database";
import {
  payments,
  interviewSessions,
  interviewers,
  jobSeekers,
  users,
} from "../db/schema";

/**
 * Get all payments for a job seeker
 */
export const getPaymentsForJobSeeker = async (userId: number) => {
  // Get job seeker id
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
      payhereTransactionId: payments.payhereTransactionId,
      paymentStatus: payments.paymentStatus,
      refundAmount: payments.refundAmount,
      refundReason: payments.refundReason,
      paymentDate: payments.paymentDate,
      createdAt: payments.createdAt,
      sessionType: interviewSessions.sessionType,
      scheduledDate: interviewSessions.scheduledDate,
      sessionStatus: interviewSessions.sessionStatus,
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
    .orderBy(payments.createdAt);

  return result.map((p) => ({
    id: p.id,
    sessionId: p.sessionId,
    amount: parseFloat(p.amount || "0"),
    platformCommission: parseFloat(p.platformCommission || "0"),
    interviewerPayout: parseFloat(p.interviewerPayout || "0"),
    currency: p.currency || "LKR",
    paymentMethod: p.paymentMethod,
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

export default { getPaymentsForJobSeeker };
