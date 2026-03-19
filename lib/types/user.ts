export enum UserType {
  JOB_SEEKER = "job_seeker",
  INTERVIEWER = "interviewer",
  ADMIN = "admin",
}

export enum Language {
  ENGLISH = "english",
  SINHALA = "sinhala",
  TAMIL = "tamil",
}

export type UserRole = "job_seeker" | "interviewer" | "admin";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  userType: UserRole;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobSeeker {
  id: number;
  userId: number;
  university?: string;
  graduationYear?: number;
  fieldOfStudy?: string;
  targetIndustries?: string[];
  careerGoals?: string;
  preferredLanguage: Language;
  resumeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interviewer {
  id: number;
  userId: number;
  currentCompany: string;
  jobTitle: string;
  yearsExperience: number;
  industryExpertise?: string[];
  linkedinProfile: string;
  hourlyRate: number;
  bio?: string;
  isVerified: boolean;
  verificationStatus: "pending" | "approved" | "rejected";
  verifiedAt?: Date;
  lastVerificationDate?: Date;
  bankAccountNumber?: string;
  ratingAverage: number;
  totalInterviews: number;
  totalEarnings: number;
  commissionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  id: number;
  userId: number;
  adminLevel: "super_admin" | "moderator";
  permissions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  success: boolean;
  user?: Omit<User, "passwordHash">;
  token?: string;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateJobSeekerRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  university?: string;
  graduationYear?: number;
  fieldOfStudy?: string;
  targetIndustries?: string[];
  preferredLanguage?: Language;
  careerGoals?: string;
}

export interface CreateInterviewerRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  currentCompany: string;
  jobTitle: string;
  yearsExperience: number;
  linkedinProfile: string;
  industryExpertise: string[];
  hourlyRate: number;
  bio?: string;
  nicUrl?: string;
  appointmentLetterUrl?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
}
