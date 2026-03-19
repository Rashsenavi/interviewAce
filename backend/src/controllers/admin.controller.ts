import { Request, Response } from "express";
import { getPendingInterviewers, getInterviewerDetails, approveInterviewer, rejectInterviewer } from "../services/admin.service";

export const getPendingVerifications = async (req: Request, res: Response) => {
  const interviewers = await getPendingInterviewers();
  res.json(interviewers);
};

export const getVerificationDetails = async (req: Request, res: Response) => {
  const { interviewerId } = req.params;
  const details = await getInterviewerDetails(interviewerId);
  res.json(details);
};

export const approveVerification = async (req: Request, res: Response) => {
  const { interviewerId } = req.params;
  await approveInterviewer(interviewerId);
  res.json({ success: true });
};

export const rejectVerification = async (req: Request, res: Response) => {
  const { interviewerId } = req.params;
  await rejectInterviewer(interviewerId);
  res.json({ success: true });
};
