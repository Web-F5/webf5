import { pgTable, text, integer, boolean, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core'

export const briefDrafts = pgTable('brief_drafts', {
  id:                    uuid('id').primaryKey().defaultRandom(),
  userId:                text('user_id'),            // null = guest
  guestToken:            text('guest_token').unique(), // UUID stored in client localStorage
  guestEmail:            text('guest_email'),          // populated once step 3 completes
  currentStep:           integer('current_step').notNull().default(1),
  data:                  jsonb('data').notNull().default({}),
  status:                text('status').notNull().default('in_progress'), // 'in_progress' | 'completed'
  consentFollowupEmail:  boolean('consent_followup_email').notNull().default(false),
  consentCapturedAt:     timestamp('consent_captured_at'),
  createdAt:             timestamp('created_at').notNull().defaultNow(),
  updatedAt:             timestamp('updated_at').notNull().defaultNow(),
  lastActivityAt:        timestamp('last_activity_at').notNull().defaultNow(),
  reminderCount:         integer('reminder_count').notNull().default(0),
  lastReminderSentAt:    timestamp('last_reminder_sent_at'),
  lastInactivityEmailAt: timestamp('last_inactivity_email_at'), // rate-limits the 5-min inactivity email
  resumeEmailSent:       boolean('resume_email_sent').notNull().default(false), // guest resume link sent
  expiresAt:             timestamp('expires_at'), // guest rows expire after 30 days
})

export const courseEntitlements = pgTable('course_entitlements', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          text('user_id').notNull(),
  courseId:        text('course_id').notNull(), // slug — e.g. 'web-fundamentals'
  stripePaymentId: text('stripe_payment_id'),
  purchasedAt:     timestamp('purchased_at').notNull().defaultNow(),
  refundedAt:      timestamp('refunded_at'),    // null = active entitlement
})
