ALTER TYPE "session_status" ADD VALUE 'awaiting_confirmation';--> statement-breakpoint
ALTER TYPE "session_status" ADD VALUE 'disputed';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interviewer_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"job_seeker_id" integer NOT NULL,
	"interviewer_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"review_text" text NOT NULL,
	"is_knowledgeable" boolean DEFAULT false,
	"is_helpful" boolean DEFAULT false,
	"is_actionable" boolean DEFAULT false,
	"is_professional" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"interviewer_id" integer NOT NULL,
	"job_seeker_id" integer NOT NULL,
	"overall_rating" integer NOT NULL,
	"communication_rating" integer NOT NULL,
	"technical_rating" integer NOT NULL,
	"problem_solving_rating" integer NOT NULL,
	"confidence_rating" integer NOT NULL,
	"strengths" text NOT NULL,
	"weaknesses" text NOT NULL,
	"improvement_tips" text NOT NULL,
	"general_comments" text,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "sample_videos" ALTER COLUMN "industry_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "interview_sessions" ADD COLUMN "dispute_reason" text;--> statement-breakpoint
ALTER TABLE "interview_sessions" ADD COLUMN "disputed_at" timestamp;--> statement-breakpoint
ALTER TABLE "sample_videos" ADD COLUMN "session_id" integer;--> statement-breakpoint
ALTER TABLE "sample_videos" ADD COLUMN "admin_approval_status" varchar(20) DEFAULT 'pending';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_videos" ADD CONSTRAINT "sample_videos_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interviewer_reviews" ADD CONSTRAINT "interviewer_reviews_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interviewer_reviews" ADD CONSTRAINT "interviewer_reviews_job_seeker_id_job_seekers_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interviewer_reviews" ADD CONSTRAINT "interviewer_reviews_interviewer_id_interviewers_id_fk" FOREIGN KEY ("interviewer_id") REFERENCES "interviewers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_feedback" ADD CONSTRAINT "session_feedback_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_feedback" ADD CONSTRAINT "session_feedback_interviewer_id_interviewers_id_fk" FOREIGN KEY ("interviewer_id") REFERENCES "interviewers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_feedback" ADD CONSTRAINT "session_feedback_job_seeker_id_job_seekers_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
