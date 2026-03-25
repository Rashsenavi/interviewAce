import { Request, Response } from "express";
import { getPendingInterviewers, getInterviewerDetails, approveInterviewer, rejectInterviewer } from "../services/admin.service";

export const getPendingVerifications = async (req: Request, res: Response) => {
  const interviewers = await getPendingInterviewers();
  res.json(interviewers);
};

export const getVerificationDetails = async (req: Request, res: Response) => {
  const { interviewerId } = req.params;
  const details = await getInterviewerDetails(interviewerId);

  if (!details) {
    return res.status(404).json({
      success: false,
      error: {
        code: "INTERVIEWER_NOT_FOUND",
        message: "Interviewer not found",
      },
    });
  }

  res.json(details);
};

export const approveVerification = async (req: Request, res: Response) => {
  const { interviewerId } = req.params;
  const interviewer = await approveInterviewer(interviewerId);

  res.json({
    success: true,
    data: interviewer,
    message: "Interviewer approved successfully",
  });
};

export const rejectVerification = async (req: Request, res: Response) => {
  const { interviewerId } = req.params;
  const interviewer = await rejectInterviewer(interviewerId);

  res.json({
    success: true,
    data: interviewer,
    message: "Interviewer rejected successfully",
  });
};
