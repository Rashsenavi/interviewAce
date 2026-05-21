import { Request, Response } from "express";
import { getPendingInterviewers, getInterviewerDetails, approveInterviewer, rejectInterviewer, getAllUsers, updateUserStatus, deleteUser } from "../services/admin.service";

export const getPendingVerifications = async (req: Request, res: Response) => {
  const interviewers = await getPendingInterviewers();
  res.json({ success: true, data: interviewers });
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

  res.json({ success: true, data: details });
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
  const { notes } = req.body;
  const interviewer = await rejectInterviewer(interviewerId, notes);

  res.json({
    success: true,
    data: interviewer,
    message: "Interviewer rejected successfully",
  });
};

export const getAllUsersHandler = async (req: Request, res: Response) => {
  const users = await getAllUsers();
  res.json({ success: true, data: users });
};

export const updateUserStatusHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { isActive } = req.body;
  
  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ success: false, error: { message: "isActive boolean is required" }});
  }

  const result = await updateUserStatus(userId, isActive);
  res.json({ success: true, data: result, message: `User status updated to ${isActive ? 'active' : 'suspended'}` });
};

export const deleteUserHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;
  await deleteUser(userId);
  res.json({ success: true, message: "User deleted successfully" });
};
