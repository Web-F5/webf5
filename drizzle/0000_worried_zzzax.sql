CREATE TABLE "audit_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"business_name" text NOT NULL,
	"email" text NOT NULL,
	"url" text NOT NULL,
	"industry" text,
	"biggest_frustration" text,
	"report" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brief_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"guest_token" text,
	"guest_email" text,
	"current_step" integer DEFAULT 1 NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"consent_followup_email" boolean DEFAULT false NOT NULL,
	"consent_captured_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"reminder_count" integer DEFAULT 0 NOT NULL,
	"last_reminder_sent_at" timestamp,
	"last_inactivity_email_at" timestamp,
	"resume_email_sent" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	CONSTRAINT "brief_drafts_guest_token_unique" UNIQUE("guest_token")
);
--> statement-breakpoint
CREATE TABLE "checklist_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"business_name" text,
	"email" text NOT NULL,
	"industry" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_entitlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"stripe_payment_id" text,
	"purchased_at" timestamp DEFAULT now() NOT NULL,
	"refunded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "crm_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"tier" char(1) DEFAULT 'B' NOT NULL,
	"trigger_text" text,
	"trigger_date" date,
	"current_stage" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"name" text NOT NULL,
	"title" text,
	"linked_in" text,
	"role" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"name" text NOT NULL,
	"stage" integer DEFAULT 2 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"next_step" text,
	"next_step_date" date,
	"problem_text" text,
	"problem_value" text,
	"compelling_event" text,
	"compelling_date" date,
	"signed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_task_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope_type" text NOT NULL,
	"scope_id" text NOT NULL,
	"task_id" text NOT NULL,
	"checked" boolean DEFAULT false NOT NULL,
	"answer" text,
	"ai_feedback" text,
	"feedback_for" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"send_id" uuid,
	"recipient_name" text NOT NULL,
	"recipient_email" text NOT NULL,
	"from_business" text NOT NULL,
	"platform" text NOT NULL,
	"review_url" text NOT NULL,
	"rating" integer,
	"feedback" text,
	"clicked_review" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"rated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "review_sends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_business" text NOT NULL,
	"platform" text NOT NULL,
	"review_url" text NOT NULL,
	"custom_message" text,
	"recipient_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crm_contacts" ADD CONSTRAINT "crm_contacts_account_id_crm_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."crm_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_account_id_crm_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."crm_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_ratings" ADD CONSTRAINT "review_ratings_send_id_review_sends_id_fk" FOREIGN KEY ("send_id") REFERENCES "public"."review_sends"("id") ON DELETE no action ON UPDATE no action;