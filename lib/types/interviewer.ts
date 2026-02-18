import { Interviewer } from "./user";

export enum DocumentType {
  NIC = "nic",
  APPOINTMENT_LETTER = "appointment_letter",
  EMPLOYMENT_LETTER = "employment_letter",
  DEGREE_CERTIFICATE = "degree_certificate",
  BANK_STATEMENT = "bank_statement",
  LINKEDIN_SCREENSHOT = "linkedin_screenshot",
}

export enum VerificationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface UserVerification {
  id: number;
  userId: number;
  documentType: DocumentType;
  documentUrl: string;
  verificationStatus: VerificationStatus;
  verifiedByAdminId?: number;
  verificationNotes?: string;
  submittedAt: Date;
  verifiedAt?: Date;
  createdAt: Date;
}

export interface InterviewerFilter {
  industries?: string[];
  minRate?: number;
  maxRate?: number;
  minExperience?: number;
  minRating?: number;
  language?: string;
  verified?: boolean;
  searchQuery?: string;
}

export interface AvailabilitySlot {
  id: number;
  interviewerId: number;
  dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isRecurring: boolean;
  specificDate?: Date;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewerStats {
  interviewerId: number;
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  totalEarnings: number;
  averageRating: number;
}

export interface InterviewerProfile {
  interviewer: Interviewer;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
  stats: InterviewerStats;
  availabilities: AvailabilitySlot[];
}

export interface UpdateInterviewerRequest {
  currentCompany?: string;
  jobTitle?: string;
  yearsExperience?: number;
  industryExpertise?: string[];
  hourlyRate?: number;
  bio?: string;
  linkedinProfile?: string;
  timezone?: string;
}

export interface CreateAvailabilityRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}
