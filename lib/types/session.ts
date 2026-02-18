export enum SessionStatus {
  SCHEDULED = "scheduled",
  RESCHEDULED = "rescheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
}

export enum SessionType {
  BEHAVIORAL = "behavioral",
  TECHNICAL = "technical",
  CASE_STUDY = "case_study",
  MIXED = "mixed",
}

export interface InterviewSession {
  id: number;
  jobSeekerId: number;
  interviewerId: number;
  industryId?: number;
  sessionType: SessionType;
  scheduledDate: Date;
  duration: number; // in minutes
  meetingLink?: string;
  sessionStatus: SessionStatus;
  priceAmount: number;
  recordingUrl?: string;
  recordingConsent: boolean;
  notes?: string;
  cancellationReason?: string;
  cancelledBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Feedback {
  id: number;
  sessionId: number;
  givenByUserId: number;
  feedbackForUserId: number;
  ratingOverall?: number; // 1-5
  ratingCommunication?: number; // 1-5
  ratingTechnical?: number; // 1-5
  ratingProfessionalism?: number; // 1-5
  ratingHelpfulness?: number; // 1-5
  writtenFeedback?: string;
  improvementSuggestions?: string;
  strengthsIdentified?: string;
  wouldRecommend?: boolean;
  feedbackType: "interviewer_to_seeker" | "seeker_to_interviewer";
  isAnonymous: boolean;
  isFlagged: boolean;
  flaggedReason?: string;
  createdAt: Date;
}

export interface RescheduleRequest {
  id: number;
  sessionId: number;
  requestedByUserId: number;
  originalDate: Date;
  proposedDate: Date;
  reason?: string;
  status: "pending" | "approved" | "declined";
  respondedAt?: Date;
  createdAt: Date;
}

export interface CreateSessionRequest {
  interviewerId: number;
  sessionType: SessionType;
  scheduledDate: Date;
  duration: number;
  industryId?: number;
  notes?: string;
  recordingConsent?: boolean;
}

export interface UpdateSessionRequest {
  sessionStatus?: SessionStatus;
  meetingLink?: string;
  recordingUrl?: string;
  notes?: string;
}

export interface CreateFeedbackRequest {
  sessionId: number;
  ratingOverall?: number;
  ratingCommunication?: number;
  ratingTechnical?: number;
  ratingProfessionalism?: number;
  ratingHelpfulness?: number;
  writtenFeedback?: string;
  improvementSuggestions?: string;
  strengthsIdentified?: string;
  wouldRecommend?: boolean;
  isAnonymous?: boolean;
}

export interface RescheduleSessionRequest {
  sessionId: number;
  proposedDate: Date;
  reason?: string;
}
