DO $$ BEGIN
 CREATE TYPE "admin_level" AS ENUM('super_admin', 'moderator');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "day_of_week" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "document_type" AS ENUM('nic', 'appointment_letter', 'employment_letter', 'degree_certificate', 'bank_statement', 'linkedin_screenshot');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "feedback_type" AS ENUM('interviewer_to_seeker', 'seeker_to_interviewer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "meeting_platform" AS ENUM('zoom', 'teams');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "payment_status" AS ENUM('pending', 'held', 'completed', 'failed', 'refunded', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "payout_status" AS ENUM('pending', 'processing', 'paid', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "session_status" AS ENUM('pending', 'scheduled', 'rescheduled', 'in_progress', 'completed', 'cancelled', 'no_show');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "session_type" AS ENUM('behavioral', 'technical', 'case_study', 'mixed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "ticket_priority" AS ENUM('low', 'medium', 'high', 'urgent');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "ticket_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "user_type" AS ENUM('job_seeker', 'interviewer', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "verification_status" AS ENUM('pending', 'approved', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"admin_level" "admin_level" NOT NULL,
	"permissions" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admins_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "availability_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"interviewer_id" integer NOT NULL,
	"day_of_week" "day_of_week" NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"is_recurring" boolean DEFAULT true,
	"specific_date" date,
	"is_available" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "favorite_interviewers" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_seeker_id" integer NOT NULL,
	"interviewer_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"given_by_user_id" integer NOT NULL,
	"feedback_for_user_id" integer NOT NULL,
	"rating_overall" integer,
	"rating_communication" integer,
	"rating_technical" integer,
	"rating_professionalism" integer,
	"rating_helpfulness" integer,
	"written_feedback" text,
	"improvement_suggestions" text,
	"strengths_identified" text,
	"would_recommend" boolean,
	"feedback_type" "feedback_type" NOT NULL,
	"is_anonymous" boolean DEFAULT false,
	"is_flagged" boolean DEFAULT false,
	"flagged_reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "industries" (
	"id" serial PRIMARY KEY NOT NULL,
	"industry_name" varchar(255) NOT NULL,
	"description" text,
	"icon_url" varchar(500),
	"is_active" boolean DEFAULT true,
	"display_order" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "industries_industry_name_unique" UNIQUE("industry_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interview_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_seeker_id" integer NOT NULL,
	"interviewer_id" integer NOT NULL,
	"industry_id" integer,
	"session_type" "session_type" NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"meeting_link" varchar(500),
	"session_status" "session_status" DEFAULT 'pending',
	"price_amount" numeric(12, 2) NOT NULL,
	"recording_url" varchar(500),
	"recording_consent" boolean DEFAULT false,
	"notes" text,
	"cancellation_reason" text,
	"cancelled_by" integer,
	"reschedule_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interviewer_earnings" (
	"id" serial PRIMARY KEY NOT NULL,
	"interviewer_id" integer NOT NULL,
	"session_id" integer NOT NULL,
	"payment_id" integer,
	"gross_amount" numeric(12, 2) NOT NULL,
	"commission_deducted" numeric(12, 2) NOT NULL,
	"net_earning" numeric(12, 2) NOT NULL,
	"session_duration_hours" numeric(5, 2),
	"payout_month" varchar(7),
	"payout_id" integer,
	"earned_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "interviewer_earnings_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interviewer_payouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"interviewer_id" integer NOT NULL,
	"payout_month" varchar(7) NOT NULL,
	"total_sessions" integer DEFAULT 0 NOT NULL,
	"total_hours" numeric(8, 2) DEFAULT '0' NOT NULL,
	"gross_amount" numeric(12, 2) NOT NULL,
	"commission_deducted" numeric(12, 2) NOT NULL,
	"net_payout_amount" numeric(12, 2) NOT NULL,
	"payout_status" "payout_status" DEFAULT 'pending',
	"bank_account_number" varchar(50),
	"released_by_admin_id" integer,
	"released_at" timestamp,
	"auto_released" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interviewers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"current_company" varchar(255) NOT NULL,
	"job_title" varchar(255) NOT NULL,
	"years_experience" integer NOT NULL,
	"industry_expertise" text,
	"linkedin_profile" varchar(500) NOT NULL,
	"hourly_rate" numeric(10, 2) NOT NULL,
	"bio" text,
	"is_verified" boolean DEFAULT false,
	"verification_status" "verification_status" DEFAULT 'pending',
	"verified_at" timestamp,
	"last_verification_date" timestamp,
	"bank_account_number" varchar(50),
	"rating_average" numeric(3, 2) DEFAULT '0',
	"total_interviews" integer DEFAULT 0,
	"total_earnings" numeric(15, 2) DEFAULT '0',
	"commission_rate" numeric(5, 2) DEFAULT '20',
	"preferred_meeting_platform" "meeting_platform" DEFAULT 'zoom',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"nic_url" text,
	"appointment_letter_url" text,
	"verification_notes" text,
	CONSTRAINT "interviewers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_seekers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"university" varchar(255),
	"graduation_year" integer,
	"field_of_study" varchar(255),
	"target_industries" text,
	"career_goals" text,
	"preferred_language" varchar(50) DEFAULT 'english',
	"resume_url" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "job_seekers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "package_deals" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_name" varchar(255) NOT NULL,
	"session_count" integer NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"discount_percentage" numeric(5, 2),
	"validity_days" integer,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "package_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_seeker_id" integer NOT NULL,
	"package_id" integer NOT NULL,
	"total_credits" integer NOT NULL,
	"credits_remaining" integer NOT NULL,
	"purchase_date" timestamp DEFAULT now(),
	"expiry_date" timestamp,
	"payment_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"job_seeker_id" integer NOT NULL,
	"interviewer_id" integer NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"platform_commission" numeric(12, 2) NOT NULL,
	"interviewer_payout" numeric(12, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'LKR',
	"payment_method" varchar(50),
	"payhere_order_id" varchar(100),
	"payhere_transaction_id" varchar(100),
	"payhere_raw_status" integer,
	"payment_status" "payment_status" DEFAULT 'pending',
	"refund_amount" numeric(12, 2),
	"refund_reason" text,
	"payment_date" timestamp,
	"refund_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "payments_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_bank" (
	"id" serial PRIMARY KEY NOT NULL,
	"industry_id" integer NOT NULL,
	"question_text" text NOT NULL,
	"question_type" varchar(50) NOT NULL,
	"difficulty_level" varchar(50) NOT NULL,
	"sample_answer" text,
	"tips" text,
	"contributed_by_user_id" integer,
	"usage_count" integer DEFAULT 0,
	"is_approved" boolean DEFAULT false,
	"approved_by_admin_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reschedule_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"requested_by_user_id" integer NOT NULL,
	"original_date" timestamp NOT NULL,
	"proposed_date" timestamp NOT NULL,
	"reason" text,
	"status" varchar(50) DEFAULT 'pending',
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sample_videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"industry_id" integer NOT NULL,
	"video_title" varchar(255) NOT NULL,
	"video_description" text,
	"video_url" varchar(500) NOT NULL,
	"thumbnail_url" varchar(500),
	"video_type" varchar(50) NOT NULL,
	"duration_seconds" integer,
	"uploaded_by_user_id" integer,
	"view_count" integer DEFAULT 0,
	"is_featured" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"subject" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"status" "ticket_status" DEFAULT 'open',
	"priority" "ticket_priority" DEFAULT 'medium',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"setting_key" varchar(255) NOT NULL,
	"setting_value" text NOT NULL,
	"data_type" varchar(50),
	"description" text,
	"updated_by_admin_id" integer,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "system_settings_setting_key_unique" UNIQUE("setting_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"document_type" "document_type" NOT NULL,
	"document_url" varchar(500) NOT NULL,
	"verification_status" "verification_status" DEFAULT 'pending',
	"verified_by_admin_id" integer,
	"verification_notes" text,
	"submitted_at" timestamp DEFAULT now(),
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"phone_number" varchar(20),
	"user_type" "user_type" NOT NULL,
	"is_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_interviewer_id_interviewers_id_fk" FOREIGN KEY ("interviewer_id") REFERENCES "interviewers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favorite_interviewers" ADD CONSTRAINT "favorite_interviewers_job_seeker_id_job_seekers_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favorite_interviewers" ADD CONSTRAINT "favorite_interviewers_interviewer_id_interviewers_id_fk" FOREIGN KEY ("interviewer_id") REFERENCES "interviewers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_given_by_user_id_users_id_fk" FOREIGN KEY ("given_by_user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_feedback_for_user_id_users_id_fk" FOREIGN KEY ("feedback_for_user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_job_seeker_id_job_seekers_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_interviewer_id_interviewers_id_fk" FOREIGN KEY ("interviewer_id") REFERENCES "interviewers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_cancelled_by_users_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interviewer_earnings" ADD CONSTRAINT "interviewer_earnings_interviewer_id_interviewers_id_fk" FOREIGN KEY ("interviewer_id") REFERENCES "interviewers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interviewer_earnings" ADD CONSTRAINT "interviewer_earnings_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interviewer_earnings" ADD CONSTRAINT "interviewer_earnings_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interviewer_payouts" ADD CONSTRAINT "interviewer_payouts_interviewer_id_interviewers_id_fk" FOREIGN KEY ("interviewer_id") REFERENCES "interviewers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interviewer_payouts" ADD CONSTRAINT "interviewer_payouts_released_by_admin_id_admins_id_fk" FOREIGN KEY ("released_by_admin_id") REFERENCES "admins"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interviewers" ADD CONSTRAINT "interviewers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_seekers" ADD CONSTRAINT "job_seekers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "package_purchases" ADD CONSTRAINT "package_purchases_job_seeker_id_job_seekers_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "package_purchases" ADD CONSTRAINT "package_purchases_package_id_package_deals_id_fk" FOREIGN KEY ("package_id") REFERENCES "package_deals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "package_purchases" ADD CONSTRAINT "package_purchases_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_job_seeker_id_job_seekers_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_interviewer_id_interviewers_id_fk" FOREIGN KEY ("interviewer_id") REFERENCES "interviewers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_bank" ADD CONSTRAINT "question_bank_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_bank" ADD CONSTRAINT "question_bank_contributed_by_user_id_users_id_fk" FOREIGN KEY ("contributed_by_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_bank" ADD CONSTRAINT "question_bank_approved_by_admin_id_admins_id_fk" FOREIGN KEY ("approved_by_admin_id") REFERENCES "admins"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reschedule_requests" ADD CONSTRAINT "reschedule_requests_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reschedule_requests" ADD CONSTRAINT "reschedule_requests_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_videos" ADD CONSTRAINT "sample_videos_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_videos" ADD CONSTRAINT "sample_videos_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_admin_id_admins_id_fk" FOREIGN KEY ("updated_by_admin_id") REFERENCES "admins"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_verifications" ADD CONSTRAINT "user_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_verifications" ADD CONSTRAINT "user_verifications_verified_by_admin_id_admins_id_fk" FOREIGN KEY ("verified_by_admin_id") REFERENCES "admins"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
