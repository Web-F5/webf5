import { pgTable, text, integer, boolean, timestamp, jsonb, uuid, date, char } from 'drizzle-orm/pg-core'

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

export const auditLeads = pgTable('audit_leads', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  name:               text('name').notNull(),
  businessName:       text('business_name').notNull(),
  email:              text('email').notNull(),
  url:                text('url').notNull(),
  industry:           text('industry'),
  biggestFrustration: text('biggest_frustration'),
  report:             jsonb('report').notNull().default({}),
  createdAt:          timestamp('created_at').notNull().defaultNow(),
})

export const checklistLeads = pgTable('checklist_leads', {
  id:           uuid('id').primaryKey().defaultRandom(),
  name:         text('name').notNull(),
  businessName: text('business_name'),
  email:        text('email').notNull(),
  industry:     text('industry'),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
})

export const reviewRatings = pgTable('review_ratings', {
  id:             uuid('id').primaryKey().defaultRandom(), // doubles as the token in the email link
  sendId:         uuid('send_id').references(() => reviewSends.id),
  recipientName:  text('recipient_name').notNull(),
  recipientEmail: text('recipient_email').notNull(),
  fromBusiness:   text('from_business').notNull(),
  platform:       text('platform').notNull(),
  reviewUrl:      text('review_url').notNull(),
  rating:         integer('rating'),
  feedback:       text('feedback'),
  clickedReview:  boolean('clicked_review').notNull().default(false),
  createdAt:      timestamp('created_at').notNull().defaultNow(),
  ratedAt:        timestamp('rated_at'),
})

export const reviewSends = pgTable('review_sends', {
  id:             uuid('id').primaryKey().defaultRandom(),
  fromBusiness:   text('from_business').notNull(),
  platform:       text('platform').notNull(), // 'google' | 'facebook' | 'custom'
  reviewUrl:      text('review_url').notNull(),
  customMessage:  text('custom_message'),
  recipientCount: integer('recipient_count').notNull().default(0),
  createdAt:      timestamp('created_at').notNull().defaultNow(),
})

// ── TRIPLE CRM ─────────────────────────────────────────────────────────────

export const crmAccounts = pgTable('crm_accounts', {
  id:           uuid('id').primaryKey().defaultRandom(),
  name:         text('name').notNull(),
  tier:         char('tier', { length: 1 }).notNull().default('B'), // A | B | C
  triggerText:  text('trigger_text'),
  triggerDate:  date('trigger_date'),
  currentStage: integer('current_stage').notNull().default(1),
  notes:        text('notes'),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
})

export const crmContacts = pgTable('crm_contacts', {
  id:        uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').notNull().references(() => crmAccounts.id, { onDelete: 'cascade' }),
  name:      text('name').notNull(),
  title:     text('title'),
  linkedIn:  text('linked_in'),
  // role: economic_buyer | champion | user | blocker | coach
  role:      text('role').notNull(),
  notes:     text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const crmDeals = pgTable('crm_deals', {
  id:           uuid('id').primaryKey().defaultRandom(),
  accountId:    uuid('account_id').notNull().references(() => crmAccounts.id, { onDelete: 'cascade' }),
  name:         text('name').notNull(),
  stage:        integer('stage').notNull().default(2),
  // status: active | signed | lost | paused
  status:       text('status').notNull().default('active'),
  nextStep:     text('next_step'),
  nextStepDate: date('next_step_date'),
  problemText:  text('problem_text'),   // quantified problem in buyer's words
  problemValue: text('problem_value'),  // dollar figure
  compellingEvent: text('compelling_event'),
  compellingDate:  date('compelling_date'),
  signedAt:     timestamp('signed_at'),
  notes:        text('notes'),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
})

// scope_type: 'workspace' (Stage 1 tasks) | 'deal' (Stages 2–6 tasks)
// scope_id: deal id for 'deal' scope, or 'workspace' literal for workspace scope
export const crmTaskProgress = pgTable('crm_task_progress', {
  id:          uuid('id').primaryKey().defaultRandom(),
  scopeType:   text('scope_type').notNull(), // 'workspace' | 'deal'
  scopeId:     text('scope_id').notNull(),   // deal UUID or 'workspace'
  taskId:      text('task_id').notNull(),    // e.g. 't-1', 'rc-1', 'sc-4__1'
  checked:     boolean('checked').notNull().default(false),
  answer:      text('answer'),
  aiFeedback:  text('ai_feedback'),
  feedbackFor: text('feedback_for'), // the answer text the feedback was generated for
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
})

export const courseEntitlements = pgTable('course_entitlements', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          text('user_id').notNull(),
  courseId:        text('course_id').notNull(), // slug — e.g. 'web-fundamentals'
  stripePaymentId: text('stripe_payment_id'),
  purchasedAt:     timestamp('purchased_at').notNull().defaultNow(),
  refundedAt:      timestamp('refunded_at'),    // null = active entitlement
})
