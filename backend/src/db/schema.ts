import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  boolean,
  decimal,
  integer,
  date,
  time,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const userTypeEnum = pgEnum("user_type", [
  "job_seeker",
  "interviewer",
  "admin",
]);
export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "approved",
  "rejected",
]);
export const sessionStatusEnum = pgEnum("session_status", [
  "pending",
  "scheduled",
  "rescheduled",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "held",
  "completed",
  "failed",
  "refunded",
  "cancelled",
]);
export const payoutStatusEnum = pgEnum("payout_status", [
  "pending",
  "processing",
  "paid",
  "failed",
]);
export const feedbackTypeEnum = pgEnum("feedback_type", [
  "interviewer_to_seeker",
  "seeker_to_interviewer",
]);
export const dayOfWeekEnum = pgEnum("day_of_week", [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);
export const sessionTypeEnum = pgEnum("session_type", [
  "behavioral",
  "technical",
  "case_study",
  "mixed",
]);
export const documentTypeEnum = pgEnum("document_type", [
  "nic",
  "appointment_letter",
  "employment_letter",
  "degree_certificate",
  "bank_statement",
  "linkedin_screenshot",
]);
export const adminLevelEnum = pgEnum("admin_level", ["super_admin", "moderator"]);

// Users Table - Supertype
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  userType: userTypeEnum("user_type").notNull(),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job Seekers Table
export const jobSeekers = pgTable("job_seekers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  university: varchar("university", { length: 255 }),
  graduationYear: integer("graduation_year"),
  fieldOfStudy: varchar("field_of_study", { length: 255 }),
  targetIndustries: text("target_industries"),
  careerGoals: text("career_goals"),
  preferredLanguage: varchar("preferred_language", { length: 50 }).default("english"),
  resumeUrl: varchar("resume_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const meetingPlatformEnum = pgEnum("meeting_platform", [
  "zoom",
  "teams",
]);

// Interviewers Table
export const interviewers = pgTable("interviewers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  currentCompany: varchar("current_company", { length: 255 }).notNull(),
  jobTitle: varchar("job_title", { length: 255 }).notNull(),
  yearsExperience: integer("years_experience").notNull(),
  industryExpertise: text("industry_expertise"),
  linkedinProfile: varchar("linkedin_profile", { length: 500 }).notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  bio: text("bio"),
  isVerified: boolean("is_verified").default(false),
  verificationStatus: verificationStatusEnum("verification_status").default("pending"),
  verifiedAt: timestamp("verified_at"),
  lastVerificationDate: timestamp("last_verification_date"),
  bankAccountNumber: varchar("bank_account_number", { length: 50 }),
  ratingAverage: decimal("rating_average", { precision: 3, scale: 2 }).default("0"),
  totalInterviews: integer("total_interviews").default(0),
  totalEarnings: decimal("total_earnings", { precision: 15, scale: 2 }).default("0"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("20"),
  preferredMeetingPlatform: meetingPlatformEnum("preferred_meeting_platform").default("zoom"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  nicUrl: text("nic_url"),
  appointmentLetterUrl: text("appointment_letter_url"),
  verificationNotes: text("verification_notes"),
});

// Admins Table
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  adminLevel: adminLevelEnum("admin_level").notNull(),
  permissions: text("permissions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Industries Table
export const industries = pgTable("industries", {
  id: serial("id").primaryKey(),
  industryName: varchar("industry_name", { length: 255 }).notNull().unique(),
  description: text("description"),
  iconUrl: varchar("icon_url", { length: 500 }),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Verification Table
export const userVerifications = pgTable("user_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  documentType: documentTypeEnum("document_type").notNull(),
  documentUrl: varchar("document_url", { length: 500 }).notNull(),
  verificationStatus: verificationStatusEnum("verification_status").default("pending"),
  verifiedByAdminId: integer("verified_by_admin_id").references(() => admins.id),
  verificationNotes: text("verification_notes"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Availability Slots Table
export const availabilitySlots = pgTable("availability_slots", {
  id: serial("id").primaryKey(),
  interviewerId: integer("interviewer_id")
    .notNull()
    .references(() => interviewers.id, { onDelete: "cascade" }),
  dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  isRecurring: boolean("is_recurring").default(true),
  specificDate: date("specific_date"),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Interview Sessions Table
export const interviewSessions = pgTable("interview_sessions", {
  id: serial("id").primaryKey(),
  jobSeekerId: integer("job_seeker_id")
    .notNull()
    .references(() => jobSeekers.id, { onDelete: "cascade" }),
  interviewerId: integer("interviewer_id")
    .notNull()
    .references(() => interviewers.id, { onDelete: "cascade" }),
  industryId: integer("industry_id").references(() => industries.id),
  sessionType: sessionTypeEnum("session_type").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").notNull(),
  meetingLink: varchar("meeting_link", { length: 500 }),
  sessionStatus: sessionStatusEnum("session_status").default("pending"),
  priceAmount: decimal("price_amount", { precision: 12, scale: 2 }).notNull(),
  recordingUrl: varchar("recording_url", { length: 500 }),
  recordingConsent: boolean("recording_consent").default(false),
  notes: text("notes"),
  cancellationReason: text("cancellation_reason"),
  cancelledBy: integer("cancelled_by").references(() => users.id),
  rescheduleCount: integer("reschedule_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments Table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .unique()
    .references(() => interviewSessions.id, { onDelete: "cascade" }),
  jobSeekerId: integer("job_seeker_id")
    .notNull()
    .references(() => jobSeekers.id, { onDelete: "cascade" }),
  interviewerId: integer("interviewer_id")
    .notNull()
    .references(() => interviewers.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  platformCommission: decimal("platform_commission", { precision: 12, scale: 2 }).notNull(),
  interviewerPayout: decimal("interviewer_payout", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("LKR"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  payhereOrderId: varchar("payhere_order_id", { length: 100 }),
  payhereTransactionId: varchar("payhere_transaction_id", { length: 100 }),
  payhereRawStatus: integer("payhere_raw_status"),
  paymentStatus: paymentStatusEnum("payment_status").default("pending"),
  refundAmount: decimal("refund_amount", { precision: 12, scale: 2 }),
  refundReason: text("refund_reason"),
  paymentDate: timestamp("payment_date"),
  refundDate: timestamp("refund_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Interviewer Earnings Table — one row per completed session
export const interviewerEarnings = pgTable("interviewer_earnings", {
  id: serial("id").primaryKey(),
  interviewerId: integer("interviewer_id")
    .notNull()
    .references(() => interviewers.id, { onDelete: "cascade" }),
  sessionId: integer("session_id")
    .notNull()
    .unique()
    .references(() => interviewSessions.id, { onDelete: "cascade" }),
  paymentId: integer("payment_id").references(() => payments.id),
  grossAmount: decimal("gross_amount", { precision: 12, scale: 2 }).notNull(),
  commissionDeducted: decimal("commission_deducted", { precision: 12, scale: 2 }).notNull(),
  netEarning: decimal("net_earning", { precision: 12, scale: 2 }).notNull(),
  sessionDurationHours: decimal("session_duration_hours", { precision: 5, scale: 2 }),
  payoutMonth: varchar("payout_month", { length: 7 }), // e.g. "2026-05"
  payoutId: integer("payout_id"),                       // references interviewerPayouts.id (added after)
  earnedAt: timestamp("earned_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Interviewer Payouts Table — monthly salary releases by admin
export const interviewerPayouts = pgTable("interviewer_payouts", {
  id: serial("id").primaryKey(),
  interviewerId: integer("interviewer_id")
    .notNull()
    .references(() => interviewers.id, { onDelete: "cascade" }),
  payoutMonth: varchar("payout_month", { length: 7 }).notNull(), // "2026-05"
  totalSessions: integer("total_sessions").notNull().default(0),
  totalHours: decimal("total_hours", { precision: 8, scale: 2 }).notNull().default("0"),
  grossAmount: decimal("gross_amount", { precision: 12, scale: 2 }).notNull(),
  commissionDeducted: decimal("commission_deducted", { precision: 12, scale: 2 }).notNull(),
  netPayoutAmount: decimal("net_payout_amount", { precision: 12, scale: 2 }).notNull(),
  payoutStatus: payoutStatusEnum("payout_status").default("pending"),
  bankAccountNumber: varchar("bank_account_number", { length: 50 }),
  releasedByAdminId: integer("released_by_admin_id").references(() => admins.id),
  releasedAt: timestamp("released_at"),
  autoReleased: boolean("auto_released").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Feedback Table
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => interviewSessions.id, { onDelete: "cascade" }),
  givenByUserId: integer("given_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  feedbackForUserId: integer("feedback_for_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ratingOverall: integer("rating_overall"),
  ratingCommunication: integer("rating_communication"),
  ratingTechnical: integer("rating_technical"),
  ratingProfessionalism: integer("rating_professionalism"),
  ratingHelpfulness: integer("rating_helpfulness"),
  writtenFeedback: text("written_feedback"),
  improvementSuggestions: text("improvement_suggestions"),
  strengthsIdentified: text("strengths_identified"),
  wouldRecommend: boolean("would_recommend"),
  feedbackType: feedbackTypeEnum("feedback_type").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  isFlagged: boolean("is_flagged").default(false),
  flaggedReason: text("flagged_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Question Bank Table
export const questionBank = pgTable("question_bank", {
  id: serial("id").primaryKey(),
  industryId: integer("industry_id")
    .notNull()
    .references(() => industries.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  questionType: varchar("question_type", { length: 50 }).notNull(),
  difficultyLevel: varchar("difficulty_level", { length: 50 }).notNull(),
  sampleAnswer: text("sample_answer"),
  tips: text("tips"),
  contributedByUserId: integer("contributed_by_user_id").references(() => users.id),
  usageCount: integer("usage_count").default(0),
  isApproved: boolean("is_approved").default(false),
  approvedByAdminId: integer("approved_by_admin_id").references(() => admins.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sample Videos Table
export const sampleVideos = pgTable("sample_videos", {
  id: serial("id").primaryKey(),
  industryId: integer("industry_id")
    .notNull()
    .references(() => industries.id, { onDelete: "cascade" }),
  videoTitle: varchar("video_title", { length: 255 }).notNull(),
  videoDescription: text("video_description"),
  videoUrl: varchar("video_url", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  videoType: varchar("video_type", { length: 50 }).notNull(),
  durationSeconds: integer("duration_seconds"),
  uploadedByUserId: integer("uploaded_by_user_id").references(() => users.id),
  viewCount: integer("view_count").default(0),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Favorite Interviewers Table
export const favoriteInterviewers = pgTable("favorite_interviewers", {
  id: serial("id").primaryKey(),
  jobSeekerId: integer("job_seeker_id")
    .notNull()
    .references(() => jobSeekers.id, { onDelete: "cascade" }),
  interviewerId: integer("interviewer_id")
    .notNull()
    .references(() => interviewers.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reschedule Requests Table
export const rescheduleRequests = pgTable("reschedule_requests", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => interviewSessions.id, { onDelete: "cascade" }),
  requestedByUserId: integer("requested_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  originalDate: timestamp("original_date").notNull(),
  proposedDate: timestamp("proposed_date").notNull(),
  reason: text("reason"),
  status: varchar("status", { length: 50 }).default("pending"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Package Deals Table
export const packageDeals = pgTable("package_deals", {
  id: serial("id").primaryKey(),
  packageName: varchar("package_name", { length: 255 }).notNull(),
  sessionCount: integer("session_count").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }),
  validityDays: integer("validity_days"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Package Purchases Table
export const packagePurchases = pgTable("package_purchases", {
  id: serial("id").primaryKey(),
  jobSeekerId: integer("job_seeker_id")
    .notNull()
    .references(() => jobSeekers.id, { onDelete: "cascade" }),
  packageId: integer("package_id")
    .notNull()
    .references(() => packageDeals.id, { onDelete: "cascade" }),
  totalCredits: integer("total_credits").notNull(),
  creditsRemaining: integer("credits_remaining").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  expiryDate: timestamp("expiry_date"),
  paymentId: integer("payment_id").references(() => payments.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// System Settings Table
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key", { length: 255 }).notNull().unique(),
  settingValue: text("setting_value").notNull(),
  dataType: varchar("data_type", { length: 50 }),
  description: text("description"),
  updatedByAdminId: integer("updated_by_admin_id").references(() => admins.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ticket Status Enum
export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "in_progress",
  "resolved",
  "closed",
]);

// Ticket Priority Enum
export const ticketPriorityEnum = pgEnum("ticket_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

// Support Tickets Table
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").default("open"),
  priority: ticketPriorityEnum("priority").default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ticket Messages Table
export const ticketMessages = pgTable("ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id")
    .notNull()
    .references(() => supportTickets.id, { onDelete: "cascade" }),
  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// IDE TS Server refresh trigger

// Interviewer Reviews Table (Job Seeker -> Interviewer)
export const interviewerReviews = pgTable("interviewer_reviews", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => interviewSessions.id, { onDelete: "cascade" }),
  jobSeekerId: integer("job_seeker_id")
    .notNull()
    .references(() => jobSeekers.id, { onDelete: "cascade" }),
  interviewerId: integer("interviewer_id")
    .notNull()
    .references(() => interviewers.id, { onDelete: "cascade" }),

  rating: integer("rating").notNull(),
  reviewText: text("review_text").notNull(),
  
  // Tags
  isKnowledgeable: boolean("is_knowledgeable").default(false),
  isHelpful: boolean("is_helpful").default(false),
  isActionable: boolean("is_actionable").default(false),
  isProfessional: boolean("is_professional").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});
// Session Feedback Table (Detailed Ratings)
export const sessionFeedback = pgTable("session_feedback", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => interviewSessions.id, { onDelete: "cascade" }),
  interviewerId: integer("interviewer_id")
    .notNull()
    .references(() => interviewers.id, { onDelete: "cascade" }),
  jobSeekerId: integer("job_seeker_id")
    .notNull()
    .references(() => jobSeekers.id, { onDelete: "cascade" }),

  // Overall
  overallRating: integer("overall_rating").notNull(),

  // Category Ratings
  communicationRating: integer("communication_rating").notNull(),
  technicalRating: integer("technical_rating").notNull(),
  problemSolvingRating: integer("problem_solving_rating").notNull(),
  confidenceRating: integer("confidence_rating").notNull(),

  // Written Feedback
  strengths: text("strengths").notNull(),
  weaknesses: text("weaknesses").notNull(),
  improvementTips: text("improvement_tips").notNull(),
  generalComments: text("general_comments"),

  // Visibility
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});
