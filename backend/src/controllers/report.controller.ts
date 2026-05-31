import { Request, Response } from "express";
import * as paymentService from "../services/payment.service";

/**
 * Format JSON object array into CSV string
 */
const jsonToCsv = (items: any[], fields: string[]) => {
  const csvRows = [];
  // Header row
  csvRows.push(fields.join(","));
  // Data rows
  for (const item of items) {
    const values = fields.map((field) => {
      const val = item[field];
      const escaped = ("" + (val === null || val === undefined ? "" : val)).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }
  return csvRows.join("\n");
};

/**
 * GET /api/reports/interviewer/earnings
 * Export interviewer earnings report as CSV file.
 */
export const exportInterviewerEarningsCsv = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED" } });
  }

  const month = req.query.month as string | undefined;
  const data = await paymentService.getInterviewerEarnings(req.user.id, month);

  if (!data || !data.earnings) {
    return res.status(404).json({ success: false, error: { message: "No earnings data found" } });
  }

  const formattedEarnings = data.earnings.map((e) => ({
    sessionId: e.sessionId,
    sessionType: e.session?.type || "",
    sessionDate: e.session?.date ? new Date(e.session.date).toLocaleDateString() : "",
    seekerName: e.session?.seekerName || "",
    durationHours: e.durationHours,
    grossAmount: e.grossAmount,
    commissionDeducted: e.commissionDeducted,
    netEarning: e.netEarning,
    earnedAt: e.earnedAt ? new Date(e.earnedAt).toLocaleDateString() : "",
    payoutMonth: e.payoutMonth,
  }));

  const fields = [
    "sessionId",
    "sessionType",
    "sessionDate",
    "seekerName",
    "durationHours",
    "grossAmount",
    "commissionDeducted",
    "netEarning",
    "earnedAt",
    "payoutMonth",
  ];

  const csvContent = jsonToCsv(formattedEarnings, fields);
  const fileName = `interviewer_earnings_${month || "all"}.csv`;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  res.status(200).send(csvContent);
};

/**
 * GET /api/reports/admin/payouts
 * Export admin payouts report for a given month as CSV file.
 */
export const exportAdminPayoutsCsv = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED" } });
  }

  const month = req.query.month as string;
  if (!month) {
    return res.status(400).json({ success: false, error: { message: "Month (YYYY-MM) is required" } });
  }

  const data = await paymentService.getAdminPayoutSummary(month);

  const formattedPayouts = data.map((p) => ({
    interviewerId: p.interviewerId,
    firstName: p.interviewer.firstName,
    lastName: p.interviewer.lastName,
    email: p.interviewer.email,
    bankAccountNumber: p.interviewer.bankAccountNumber || "N/A",
    payoutMonth: p.payoutMonth,
    totalSessions: p.totalSessions,
    totalHours: p.totalHours,
    grossAmount: p.grossAmount,
    commissionDeducted: p.commissionDeducted,
    netPayoutAmount: p.netPayoutAmount,
    payoutStatus: p.payoutRecord?.payoutStatus || "pending",
    releasedAt: p.payoutRecord?.releasedAt ? new Date(p.payoutRecord.releasedAt).toLocaleDateString() : "N/A",
  }));

  const fields = [
    "interviewerId",
    "firstName",
    "lastName",
    "email",
    "bankAccountNumber",
    "payoutMonth",
    "totalSessions",
    "totalHours",
    "grossAmount",
    "commissionDeducted",
    "netPayoutAmount",
    "payoutStatus",
    "releasedAt",
  ];

  const csvContent = jsonToCsv(formattedPayouts, fields);
  const fileName = `admin_payouts_${month}.csv`;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  res.status(200).send(csvContent);
};
