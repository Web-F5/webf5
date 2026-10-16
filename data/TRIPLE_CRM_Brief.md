# TRIPLE Sales Method: CRM build brief and method spec

Paste or attach this file at the start of the Claude Code session that builds the CRM. It has three parts: what to build, the data model it implies, and then the full method structure (6 stages, 238 tasks with stable ids, gates, sequences, reference tables).

Companion files: `triple-seed.json` (the same structure as data, for seeding the database) and `josh-answers.json` (optional: Josh's real answers so far, keyed by task id).

## 1. What to build

A private CRM, inside the owner's own website, where each stage of the TRIPLE Sales Method is a working checklist rather than a generic pipeline. The owner (Josh) is the only user.

Requirements, in priority order:

1. **Authenticated, single user.** Nothing is readable without login. The method content is licensed course material, so it must not be crawlable or publicly reachable. Restrict sign-in to the owner's email. Add `noindex` headers and `robots.txt`, but treat those as hygiene only, not security.
2. **Database access server-side only** (API routes or Server Actions). No database credentials or queries in the browser. Josh already uses Neon (Postgres) for his other apps, so default to Neon. Avoid client-side database patterns such as Supabase RLS-from-the-browser.
3. **The checklist is the core object.** Every task has a stable id (below), a checkbox, and a free-text answer. Tasks with sub-fields (ids ending `__1`, `__2`, ...) store one answer per sub-field, so each can be extracted separately later.
4. **Stage gates.** Each stage ends in a gate (stage 1 has a practice gate and Gate 1; stages 2 to 6 have an exit milestone). A deal cannot be marked as having passed a stage until its gate tasks are all checked. The method's rule: partial evidence counts as not passed. Show gate status per account.
5. **Per-account and per-deal tracking.** Stages 2 to 6 run once per account or deal. Stage 1 (Target) is mostly workspace-level, done once for the whole territory (value proposition, ICP, tiering, territory plan). Confirm the split with Josh before finalising the schema.
6. **AI feedback per answer** (optional, second phase). A "Get feedback" button beside each answer sends the answer plus the task text to the Anthropic API from the server, using Josh's own API key (pay per use). Store the feedback together with the exact answer text it was generated for, so stale feedback can be flagged after an edit.
7. **Deal inspection view.** One page per open deal answering the six deal-inspection questions (at the end of this file) from data already captured in the checklist.

Known course rule that must be reflected in the UI wording: **a deal is not closed-won because a CRM field says so.** The commitment is made at signature, and handoff happens through a real, structured handover (see Stage 6), not a CRM status change. Do not label any status "Closed Won" without the signature and handoff tasks being done.

## 2. Suggested data model (Postgres)

- `task_template(id text primary key, stage int, group_title text, position int, text text, kind text)` seeded from `triple-seed.json`. `kind` is `task`, `gate` or `exercise`.
- `task_field_template(id text primary key, task_id text references task_template, label text, position int)` for the `__N` sub-fields.
- `account(id, name, tier char(1), trigger text, trigger_date date, current_stage int, created_at)` with tier A, B or C.
- `contact(id, account_id, name, role)` where role is one of: economic buyer, champion candidate, day-to-day user, likely blocker, coach (the "five humans" rule, also called Double Wide).
- `deal(id, account_id, stage int, status, mutual_action_plan jsonb, next_step text, next_step_date date)`.
- `task_progress(scope_type, scope_id, task_id, checked bool, answer text, ai_feedback text, feedback_for text, updated_at)` where scope is `workspace` or `deal`. Sub-field answers use the `__N` id as `task_id`.
- Stored answers use the same flat keys as the original checklist: `state[taskId] = { c: bool }` and `state[noteId] = { n: text, fb: text, fbFor: text }`. `josh-answers.json` is in that shape, so it can be imported with a one-off script.

## 3. Method notes the build should respect

- Stage names, in order: **Target, Reach, Investigate, Prove, Lock, Expand**. Letters spell TRIPLE.
- Stage 1 groups are workspace-level. Stage 2 onward are per account. The Tier A account list is 25 accounts, at ten minutes of research each.
- The Double Rule: "Double deep" (never accept the first answer) and "Double wide" (never single-thread an account; five named humans per account).
- Tier split of selling time: 70% Tier 1, 20% Tier 2, 10% Tier 3 (territory planning). The older A/B/C list rule is A-tier 80% of the week.
- The checklist wording is a paraphrase of the course lessons made for Josh's personal use. Keep it as his private tool. Before sharing the CRM with anyone else or selling it, check the course licence terms. (Not legal advice.)

## 4. Method structure: stages, groups, tasks

Format: each task is a checkbox line with its id in backticks, then the text. Indented lines under a task are its sub-fields, each with its own id.

---


## Stage 1: Target

**Job of this stage:** Choose the right accounts before you spend a single call. Reps miss quota twelve weeks before close, in a list that was never built properly.

### Value proposition

- [ ] `t-1` Write the formula sentence: "We help [ICP] fix [problem] so they get [outcome]", no product names, no adjectives
- [ ] `t-2` Name the three problems your product removes, in the buyer's own words, not marketing language
  - `t-2__1`: Problem 1
  - `t-2__2`: Problem 2
  - `t-2__3`: Problem 3
- [ ] `t-3` Attach one proof point (customer, number, outcome) to each of the three problems, and know where each number came from
  - `t-3__1`: Proof point for problem 1
  - `t-3__2`: Proof point for problem 2
  - `t-3__3`: Proof point for problem 3
- [ ] `t-4` Translate every feature you're likely to mention into a business outcome, before the call, never live
- [ ] `t-5` Run the "so what" test out loud, twice in a row, without folding back into features
- [ ] `t-6` Rehearse the value prop out loud ~10 times so it's available under pressure

### Ideal Customer Profile

- [ ] `t-7` Document the ICP across six dimensions: company size, industry, tech stack, GTM motion, the specific pain, disqualifiers
  - `t-7__1`: Company size
  - `t-7__2`: Industry
  - `t-7__3`: Tech stack
  - `t-7__4`: GTM motion
  - `t-7__5`: The specific pain
  - `t-7__6`: Disqualifiers
- [ ] `t-8` Write disqualifiers in advance, so a polite maybe has a reason to come off the list
- [ ] `t-9` Learn the five trigger events that mean "now": funding/acquisition, hiring spike, new leadership, competitor switch or renewal, compliance deadline
- [ ] `t-10` Map five humans per account by name: economic buyer, champion candidate, day-to-day user, likely blocker, coach
  - `t-10__1`: Economic buyer
  - `t-10__2`: Champion candidate
  - `t-10__3`: Day-to-day user
  - `t-10__4`: Likely blocker
  - `t-10__5`: Coach
- [ ] `t-11` Write one sentence of pain per persona, five different messages, not one message to five people
  - `t-11__1`: Economic buyer , pain sentence
  - `t-11__2`: Champion candidate , pain sentence
  - `t-11__3`: Day-to-day user , pain sentence
  - `t-11__4`: Likely blocker , pain sentence
  - `t-11__5`: Coach , pain sentence

### Tiering the list

- [ ] `t-12` Set tier definitions: A = perfect fit + live trigger, B = fit without a trigger, C = neither (cut from the list)
- [ ] `t-13` Build your own quota-backward ladder: revenue needed -> deals -> opportunities -> meetings -> accounts -> contacts, using your real conversion rates
- [ ] `t-14` Build the 25 A-tier account list, ten minutes per account (trigger + five humans + one opening observation)
- [ ] `t-15` Log every trigger with a date and all five names per account in the CRM
- [ ] `t-16` Give A-tier 80% of the week; B-tier gets one value touch a month and monitoring
- [ ] `t-17` Rebuild the list every Monday, drop converted or dead accounts, add new triggers

### Territory planning

- [ ] `tp-1` Review previous engagement per account before prospecting: past touchpoints, existing customer relationships, prior stalled/lost deals and why, partner relationships, check the CRM, Slack history, LinkedIn, the partner network, and your manager or predecessor
- [ ] `tp-2` Segment the territory into three tiers: Tier 1 Value Motion (ICP fit + current signal, 15-25 accounts for an AE / 30-50 for an SDR), Tier 2 Targeted Motion (fit, no signal yet), Tier 3 Volume Motion (broad fit, templated)
- [ ] `tp-3` Apply the time split: 70% of selling time on Tier 1, 20% on Tier 2, 10% on Tier 3
- [ ] `tp-4` Score Tier 1 accounts 1-5 on ICP fit, buying-signal strength, deal size, and access/relationships, re-score monthly
- [ ] `tp-5` Decide Value Motion vs. Volume Motion per account from that score, bespoke research + org map + named plan, or a templated sequence with light personalisation
- [ ] `tp-6` Set weekly coverage targets: Tier 1 accounts touched, new Tier 2 added to sequence, Tier 3 automated touches
- [ ] `tp-7` Work out your pipeline coverage ratio (3-4x quota) and back-solve how many accounts need to be in play
- [ ] `tp-8` Block protected outbound/calling hours before anything else fills the calendar

Rule chips:

- **Ten-minute rule**: Ten minutes per A-tier account, finds the trigger, the five humans, one opening observation. Sixty is procrastination in a suit.
- **Trigger**: Permission to call. Answers "why are you calling me now" in the first ten seconds.
- **Double wide starts here**: Five named humans per account, not job titles, not in Lock, right now.

How this stage fails:

- Spray and pray, volume with no fit
- Big logo worship, chasing a name you can't service or reach
- An opener about you, not them
- One lonely contact per account instead of five
- Research theatre, sixty minutes per account because research doesn't reject you, the phone does
- A static list nobody has reviewed in a month

### The exercise, build it for the job you want

> Doubles as job-search prep. Pick a company hiring for the role you want and build their TARGET list as if you already had the job, a real artefact you could put in front of a hiring manager, not a practice one.

- [ ] `ex-1` Pick a company from LinkedIn Jobs: sells to businesses, you can explain what they sell in under two minutes, the ad is live
- [ ] `ex-2` Write the "What You Sell" sentence, the problem they remove, in your own words, not their tagline
- [ ] `ex-3` Write the ICP Summary, size, industry, the operational condition that means they need it
- [ ] `ex-4` Note who owns the budget vs. who feels the pain, usually different job titles

Reusable AI prompt: Prompt · generate the 25-account list

````text
You are a senior enterprise sales strategist helping me build a target account list. I have attached a spreadsheet. Read the Selection Criteria tab before you do anything else. That tab has what the company sells and who buys it, in my own words.

STEP 1. READ IT BACK TO ME FIRST. DO NOT GENERATE ANY ACCOUNTS YET.
Tell me, in your words: what this company sells, who buys it, and what makes a buyer ready.
Then rate my ICP: SHARP, WORKABLE, or TOO VAGUE.
If it is TOO VAGUE, tell me the single thing missing that would make it sharp, and stop there. Do not generate the list. Do not fill the gap yourself.
If it is SHARP or WORKABLE, say so and go straight on to Step 2.

STEP 2. BUILD THE LIST. Give me exactly 25 real companies, tiered:
TIER A, 10 accounts. Strongest fit AND something has changed recently that makes the problem urgent. Every Tier A account needs a specific named trigger. If you cannot name one, it is not Tier A.
TIER B, 8 accounts. Strong fit, nothing has changed yet. For each, say what would have to happen to move it to Tier A.
TIER C, 7 accounts. Real fit, smaller or slower.

STEP 3. FORMAT. One table, 25 rows, sorted by conviction inside each tier. Columns in exactly this order: # | Tier | Account Name | Industry | Est. Employees | Why This Account | Entry Point / Trigger | Partners Involved | Target Personas | Estimated Deal Size
Entry Point / Trigger: what changed and roughly when. Write 'no known trigger' where there is not one.
Target Personas: 2 to 6 job titles. Separate who owns the budget from who feels the pain.
Estimated Deal Size: leave blank if I told you I do not know the pricing. Do not invent a range.

STEP 4. RULES. Real companies only. Mark confidence on every trigger: CONFIRMED, LIKELY, or UNKNOWN. No filler reasoning. Do not pad with famous names. Vary the triggers.

STEP 5. AFTER THE TABLE. Three accounts to start Monday and the first move for each. One account you nearly included and why you cut it. Which parts of the list you are least confident about.

IF I AM NOT IN THE ROLE YET: I am researching this company from the outside. I have no CRM, no quota and no pricing. Do not ask me for them and do not guess them.
````

- [ ] `ex-5` Run the prompt in Claude with your Selection Criteria tab attached, let it rate your ICP before it generates anything
- [ ] `ex-6` Get the 25-row tiered table (10 A / 8 B / 7 C), triggers named, confidence rated
- [ ] `ex-7` Research one A-tier account yourself, no AI: press page, careers page (8+ open roles in one function = a process breaking), the problem-owner's LinkedIn tenure, Google News last 90 days
- [ ] `ex-8` Write what you found, or "no trigger found", into the Entry Point / Trigger column; demote to B if nothing turns up

Reusable AI prompt: Prompt · find & pressure-test the five stakeholders

````text
PART A , finding the five leads

Search the web and find me the real people in the buying centre at one company. Read the Selection Criteria tab of the attached spreadsheet first.
My account: [company]. Industry: [industry]. Roughly [number] employees. Location: [city or country]. The trigger I found: [what changed, and when].
Find real, currently employed people for these five roles: economic buyer, champion, day to day user, blocker, coach.

THE RULES ON NAMES. THESE MATTER MORE THAN COVERAGE.
Every name must come with the source you found it in, as a link.
If you cannot source a name, do not give me one. Write 'not found publicly' and tell me the job titles to search on LinkedIn instead. An empty row is useful. A wrong name is not.
Do not guess at a name from a pattern, and do not carry over a name from a similar company.
Tell me how old each source is. A leadership page can be a year out of date.
Separate what you found from what you concluded. The name and title are facts. Which of the five roles they fill is your inference from their title, so label it as inference.
Only public professional information. Nothing personal.

Give me a table: Role | Name | Exact job title | Source link | How current the source is | Confidence.
Then every role you could not fill, with the job titles I should search on LinkedIn to fill it myself.

---

PART B , pressure-testing it, after you have five real people

Here are the five real people I found at [company]. Pressure test my thinking.
[Name] - [exact title] - I have them as the ECONOMIC BUYER
(and so on for all five)

Work only from the job titles I have given you. Do not add facts about these people that I have not told you, and say so plainly where you are inferring from the title alone.

Tell me: where my role assignments look wrong and which one you would swap. One line per person for the 'Why Target This Person' column. The objection each is likely to raise. Which one I should contact first and why. What I am still missing.
````

- [ ] `ex-9` Map five humans on that account via LinkedIn: economic buyer, champion candidate, day-to-day user, likely blocker, coach
  - `ex-9__1`: Economic buyer
  - `ex-9__2`: Champion candidate
  - `ex-9__3`: Day-to-day user
  - `ex-9__4`: Likely blocker
  - `ex-9__5`: Coach
- [ ] `ex-10` For each: name, title, LinkedIn URL, one line on what they personally care about
- [ ] `ex-11` Fill the blocker row even if you have to guess, it's the row people skip and the one that saves deals

#### GATE: Exercise gate · green light (Practice run, not the full Gate 1)

- [ ] `gex-1` Ten accounts tiered A/B/C by your own judgement, not the AI's
- [ ] `gex-2` At least one A-tier account with a trigger you found yourself
- [ ] `gex-3` Five humans mapped on that account, including a named blocker

_Gate rule: Reps don't miss quota in the closing stage, they miss it twelve weeks earlier, in a list they never built properly._

#### GATE: Gate 1 (Partial evidence counts as not passed)

- [ ] `g1-1` 25 A-tier accounts on the list
- [ ] `g1-2` Every A-tier account has a named, dated trigger
- [ ] `g1-3` Five mapped humans per account, logged in the CRM
- [ ] `g1-4` Value prop delivered out loud, from memory, without notes

_Gate rule: Passed = triggers dated and in the CRM, five names per account on file, value prop said unscripted. Anything less is not a territory, it's a wish._

---

## Stage 2: Reach

**Job of this stage:** Earn the meeting, not the conversation. A friendly reply is the cheapest thing a buyer can give you, a date, an agenda and a second name on the invite is the actual result.

### Channels

- [ ] `rc-1` Map each of the five personas to the channel that actually reaches them, and write the mapping down, executives answer phones, users answer LinkedIn, technical buyers read email properly
- [ ] `rc-2` Use the phone for urgency and tone, the only channel where a brush-off can be handled in the same breath it was given
- [ ] `rc-3` Use email for detail and forwardability, it survives being passed on by your champion
- [ ] `rc-4` Use LinkedIn for credibility, let them see who you are before they decide to reply
- [ ] `rc-5` Reserve video (60 seconds, their name on screen, one insight, one ask, never a product tour) for the account you can't afford to lose
- [ ] `rc-6` Chase the internal referral before any external channel, a forwarded note from a colleague beats your best cold sequence

### Multithreading

- [ ] `mt-1` Write a different message for each persona: economic buyer gets cost and risk, champion gets their day and reputation, user gets the task they hate, blocker gets what you won't break, coach gets a question and nothing else
- [ ] `mt-2` Reach two contacts at the same time, not one then the other two weeks later
- [ ] `mt-3` When one replies, ask them to bring the other onto the call
- [ ] `mt-4` Ask your champion who else this affects, then ask for the introduction, not just the email address
- [ ] `mt-5` Track champions who change companies, congratulate in week one, sell in week six

### Sequences

- [ ] `sq-1` Run the 3×3 per contact: three channels, three touches, three business days
- [ ] `sq-2` Day 1: call with the permission opener + problem statement + direct ask, then send the three-sentence email referencing the trigger
- [ ] `sq-3` Day 3: call at a different hour, then LinkedIn message or video with one specific observation
- [ ] `sq-4` Day 5: call the second contact at the account, then send the close-the-loop email
- [ ] `sq-5` Run both contacts in parallel, never sequentially
- [ ] `sq-6` No reply by the end of the sequence -> move the account to B-tier monitoring, set a 60-day re-trigger, and stop nudging

### Scripts

- [ ] `sc-1` Write the opener: ask permission, open on their trigger, never on your product
- [ ] `sc-2` Write the problem statement: what people in their role tell you, what it costs, an honest "I don't know yet if that's true for you"
- [ ] `sc-3` Ask directly for the meeting and offer two specific times, never ask if it "sounds interesting"
- [ ] `sc-4` Write the three-sentence cold email: trigger, problem it creates, ask, no attachments or links on touch one
  - `sc-4__1`: Trigger sentence
  - `sc-4__2`: Problem-it-creates sentence
  - `sc-4__3`: Ask sentence
- [ ] `sc-5` Write one LinkedIn message with a specific observation and no pitch; comment on their content before connecting
- [ ] `sc-6` Prepare the four brush-off responses and rehearse asking again once, after handling, two attempts is professional, four is a problem
- [ ] `sc-7` Write the close-the-loop email that makes a no easy to give
- [ ] `sc-8` Never send a calendar invite without an agenda in the body; confirm the day before with something worth reading

### Objection handling, the Disarm Method

> The first objection is a reflex, not the real one. Never argue it. Agree, ask one low-pressure question, then anchor something smaller than the close.

Rule chips:

- **1. Agree**: Acknowledge the objection as completely reasonable. Their guard drops and they start listening instead of defending.
- **2. Ask**: One short, low-pressure question that surfaces the real concern, multiple-choice works best.
- **3. Anchor a lower ask**: Never push for the close or pitch the product. Anchor something almost too easy to refuse: a quick look, a 15-minute walkthrough, a simple intro.

Rule chips:

- **Brush-off**: "Not interested," "send me an email," "call me in six months", reflexes, not concerns. Disarm the reflex first.
- **Situational**: "No budget," "no bandwidth," "waiting on a hire", real, but about timing/capacity, not product quality. Anchor a no-pressure look.
- **Product fit**: "Too expensive," "not built for us", usually based on something they heard or assumed. Use social proof, not arguments.
- **Existing solution**: "We use [competitor]," "we build in-house," "locked in a contract", never trash their setup. Use a trap question to surface the gap they haven't noticed.

| Objection | First move (Agree) | Anchor (lower ask) |
|---|---|---|
| Not interested | "Fair, clearly didn't land." | Multiple-choice question to surface real concern |
| Call me in six months | "Totally, if it was urgent now you'd have come to us." | Reframe as homework for the new boss / next cycle |
| Send me an email | "Happy to, want to send something useful." | Send the deck PLUS a placeholder calendar invite |
| Not my area | Drop a name to test the dodge | Permission to mention them when you reach out to the real person |
| Is this a cold call? | "Yes, and it's going about as well as I expected." | 30 seconds to explain why you called THEM specifically |
| No budget | "Budgets are tighter than they've been in a decade." | 15-minute look so they're ready when budget frees up |
| Too expensive | "Fair, we're rarely the cheapest." | Hint at flexibility, offer benchmark for their renewal |
| No bandwidth | "Every revenue leader is doing the work of two." | Reframe: we GIVE bandwidth, not take it |
| Waiting on a hire | "Smart not to commit before they're in seat." | Position as homework to gift the new hire |
| Not built for us | "Fair, wouldn't look at it if I wasn't sure." | Customer reference call with a peer at their size |
| Already have a vendor | "Assumed you would." | Multiple-choice to surface name, then trap question |
| Happy with [Competitor] | "Great team. Hard to switch when it's working." | Trap question on a known competitor weakness |
| We build it in-house | "Most teams give up halfway. Sounds like yours works." | Trap question on a hidden cost they've stopped noticing |
| Locked in a contract | "Assumed you'd have something in place." | Position as leverage for their renewal negotiation |

- [ ] `oh-1` Learn to tell within two seconds which of the four categories, brush-off, situational, product fit, existing solution, an objection falls into
- [ ] `oh-2` Write your own Agree + Ask + Anchor line for the 3-4 objections you hear most often
- [ ] `oh-3` Never re-pitch, argue, or lecture after an objection, agree first, always
- [ ] `oh-4` Remember the rule of thumb: sell the next 15 minutes on a cold call, never the product
- [ ] `oh-5` On a hang-up, log the exact date/time, their last words, and their tone in the CRM
- [ ] `oh-6` Call back in 5-7 business days and open by referencing those specifics
- [ ] `oh-7` Move on after a second hang-up, three calls is roughly where persistence turns into harassment

Rule chips:

- **3×3 rule**: Three channels, three touches, three business days, per contact. One channel is not outreach, it's a coincidence.
- **Two attempts**: Handle a brush-off once, then ask again. Two attempts at the ask is professional. Four is a problem.
- **Never single-threaded**: Two contacts in parallel, always, when one replies, use them to reach the other.

How this stage fails:

- Talking about the product instead of the problem
- No agenda in the invite, and no confirmation the day before
- One thread, a single point of failure on the account
- The same message copied across four channels, which reads as automation, not effort
- Stopping the sequence on touch two, where most of them quietly die
- Endless nudging after the sequence ends instead of closing the loop

### Prospecting tips, five moves to run this week

> Pipeline is the one thing you fully control. You can't control procurement timelines or a budget getting cut, you can control whether you put pipeline generation first every working day.

1. Warm up on LinkedIn before you DM. Connect first with no pitch, then like and comment genuinely before you ask for anything, it takes 8-15 touches to book most meetings anyway, so let them see your name first.

- [ ] `pt-1` Follow the target company page and its key leaders before reaching out cold
- [ ] `pt-2` Send a clean connection request with no pitch attached, and let it sit
- [ ] `pt-3` Like and comment with genuine insight on their posts before your first ask
- [ ] `pt-4` Reference one of their posts in your first real message so it lands warm, not cold
- [ ] `pt-5` Use an event as the opener where you can, "anyone on your team want to join this webinar?" beats a cold pitch

2. Send direct calendar invites for events instead of an email link to a registration page, it forces a yes/no instead of silence, and a decline is still a reply you can work with.

- [ ] `pt-6` For an account-based event, send a direct calendar invite from your own email rather than a link
- [ ] `pt-7` Hide the guest list so it stays professional
- [ ] `pt-8` If they accept, RSVP them through the official landing page and forward the details
- [ ] `pt-9` If they decline, follow up immediately, "is there someone else on your team who'd be a good fit?"

3. Connect event attendees to each other on LinkedIn before the event, so the room already has familiarity in it and the peer-to-peer conversation does some of the selling for you.

- [ ] `pt-10` Once two confirmed attendees look like a fit for each other, send a short group message introducing them ahead of the event
- [ ] `pt-11` Use email as the fallback where LinkedIn isn't an option

4. Use radical honesty in cold email. Being human is the differentiator when every inbox is full of AI-generated outreach.

- [ ] `pt-12` Keep cold emails around 75 words, tight, focused, no fluff
- [ ] `pt-13` Cut gimmicks and fake personalisation; get straight to the point
- [ ] `pt-14` Where your org allows it, try a blunt, human subject line instead of a polished one

5. Map the org chart before discovery. One generic message to everyone doesn't work, a tailored message per stakeholder means they walk into their own boardroom with something new to say.

- [ ] `pt-15` Before any discovery call, build the account's org chart, who you're meeting, who they report to, who else needs influencing
- [ ] `pt-16` Write a tailored message per stakeholder, tied to what they specifically care about
- [ ] `pt-17` If you're the one booking the meeting, keep researching the exec layer above your contact and hand over a rough org chart before the next person takes it further, the extra homework is what gets noticed

### Sequence library, 8 cadences to pull from

> The placeholders are not the work, the personalisation is. Pick one, rebuild it with your own product, customer stories and CTAs, and never send it as-is.

Rule chips:

- **Subject < 5 words**: Lowercase outperforms Title Case, it reads human, not marketed.
- **First email < 75 words**: Every word past 75 reduces reply rate.
- **One CTA per touch**: Two CTAs equals zero CTAs.
- **Mobile-preview everything**: ~70% of B2B email opens are on phones.
- **Multichannel beats single**: Email-only underperforms a mixed cadence by roughly 3x.

##### Sequence: 1 · The Workhorse

Default cadence for cold mid-market outreach, mixes email, LinkedIn and phone. Ends on a breakup email, usually the highest-reply-rate touch in the cadence. 
_8 touches · 17 business days_

| Day | Channel | Touch |
|---|---|---|
| Day 1 | Email | Opener, short, value-first, references something specific |
| Day 2 | LinkedIn | Connection request with a contextual note |
| Day 4 | Phone | First call attempt with voicemail |
| Day 6 | Email | Bump email, 1 line + customer proof |
| Day 9 | LinkedIn | Engage with their content (comment, like meaningful posts) |
| Day 11 | Phone | Second call attempt, no voicemail |
| Day 14 | Email | Pattern interrupt, short, casual, slightly cheeky |
| Day 17 | Email | Breakup email, "closing the loop" |

##### Sequence: 2 · Trigger-Event Sprint

A funding round, senior hire, acquisition or leadership change just happened. Speed beats polish, the trigger's window of relevance is ~14 days. 
_5 touches · 8 days_

| Day | Channel | Touch |
|---|---|---|
| Day 1 | Email | Trigger-led email, sent same day as the news |
| Day 1 | LinkedIn | Connection request referencing the trigger |
| Day 3 | Phone | Call attempt, same trigger as the hook |
| Day 5 | Email | Customer-mirror email, "same thing happened at…" |
| Day 8 | Email | Soft close |

##### Sequence: 3 · Executive Patience Play

CXO / VP-level cold outreach. Slower and more substantive so it earns the time it asks for, peaks in a 2-page brief written specifically for them. 
_5 touches · 4 weeks_

| Day | Channel | Touch |
|---|---|---|
| Day 1 | Email | Insight email, leads with a market observation, not a pitch |
| Day 7 | LinkedIn | Connection request + share-of-content |
| Day 14 | Email | Peer-name-drop email, names 3 of their peers using you |
| Day 21 | Phone | EA-friendly call (not direct dial) |
| Day 28 | Email | Tailored research piece, 2 paragraphs of original thinking |

##### Sequence: 4 · Inbound Accelerator

Someone downloaded, trialled or registered. Speed-to-lead matters more here than anywhere else, a 5-minute reply converts ~9x better than a 30-minute one. 
_5 touches · 8 days_

| Day | Channel | Touch |
|---|---|---|
| Day 1 (5 min) | Email | Signal-acknowledgement email, references exactly what they did |
| Day 1 (1 hr) | Phone | Speed-to-lead call attempt |
| Day 2 | LinkedIn | Connection request acknowledging the signal |
| Day 4 | Email | "What are you actually trying to solve" email |
| Day 8 | Email | Soft close |

##### Sequence: 5 · The Multithread

An active deal, or a proactive push into a strategic logo. Three parallel lanes, coordinated, never run behind the champion's back, each persona gets its own hook. 
_3 parallel lanes, not day-based_

| Day | Channel | Touch |
|---|---|---|
| Champion (user / mid-level) | Day-to-day pain, speed, easier work, looking good in front of their boss |
| Economic buyer (VP / C-suite) | Outcomes, ROI, team productivity, business risk, peer logos |
| Technical / security | Architecture, integration, security, vendor lock-in, compliance |

##### Sequence: 6 · The Resurrection

Closed-lost or gone-quiet from 6-18 months ago, the warmest "cold" list in the CRM. Casual tone, assumes prior history, leads with what's changed. 
_4 touches · short & casual_

| Day | Channel | Touch |
|---|---|---|
| Day 1 | Email | "Checking back in", references the original conversation |
| Day 4 | LinkedIn | Casual DM (already connected) |
| Day 9 | Email | "What changed on our side", new product / pricing / customer |
| Day 14 | Email | Soft close + open invitation |

##### Sequence: 7 · A/B Test

A methodology layered over any sequence above. Change one variable at a time, run 100+ prospects per variant, judge on meetings booked, not just replies. 
_Ongoing, not a cadence_

| Day | Channel | Touch |
|---|---|---|
| Subject line | A: "quick idea for [COMPANY]" (lowercase, casual) | B: "Question about [INITIATIVE]" (Title Case, formal) |
| Opener style | A: trigger-led, "Saw [TRIGGER]…" | B: insight-led, "We're seeing a pattern across [INDUSTRY]…" |
| Proof type | A: single named customer + outcome | B: three peer logos, no specific outcome |
| CTA | A: specific date, "15 mins next Tue 2pm?" | B: open question, "Worth a quick chat?" |
| Email length | A: under 50 words | B: 100-120 words with bulleted proof |

##### Sequence: 8 · The Sniper

Your 5-10 accounts that would change your year. Almost no automation, heavy personalisation, synthesis email in week 5 shows the level of work you'd put in as a customer. 
_8 touches · 6 weeks · max 10 prospects_

| Day | Channel | Touch |
|---|---|---|
| Week 1 | Email | Hand-written email with a specific research insight |
| Week 1 | LinkedIn | Engage with their content (do not connect yet) |
| Week 2 | Video | Personalised Loom or Vidyard, under 90 seconds |
| Week 3 | LinkedIn | Connection request referencing the video |
| Week 3 | Phone | Direct dial, script designed to earn 30 seconds |
| Week 4 | Direct mail | Physical gift or hand-written note (optional, high-value accounts) |
| Week 5 | Email | Synthesis of everything you've learned about them |
| Week 6 | Email | Open-door close |

| Prospect looks like | Run |
|---|---|
| Cold mid-market AE/manager-level | 1 · The Workhorse |
| Just had funding, a hire, or news | 2 · Trigger-Event Sprint |
| CXO or VP-level, cold | 3 · Executive Patience Play |
| Inbound signal (download/trial/webinar) | 4 · Inbound Accelerator |
| Active deal, needs more stakeholders | 5 · The Multithread |
| Closed-lost 6+ months ago | 6 · The Resurrection |
| Any sequence running 30+ days | 7 · A/B Test it |
| Top 5-10 accounts of the year | 8 · The Sniper |

- [ ] `seq-1` Pick one sequence to start with, The Workhorse if unsure, and rebuild it end-to-end with your own product, customer stories and CTAs
- [ ] `seq-2` Replace every placeholder with real content, then read each email out loud and rewrite anything that sounds like a robot wrote it
- [ ] `seq-3` Put your three best customer stories, with the metric attached, in one doc to reuse across sequences
  - `seq-3__1`: Story 1 (with metric)
  - `seq-3__2`: Story 2 (with metric)
  - `seq-3__3`: Story 3 (with metric)
- [ ] `seq-4` Write your CTAs in advance, a specific date beats "worth a chat?" roughly 2 to 1
- [ ] `seq-5` Send the first 10 touches manually before automating, to catch awkward phrasing
- [ ] `seq-6` Load 25 prospects from your target list and turn the sequence on
- [ ] `seq-7` Track reply rate and meeting-booked rate for two weeks before you judge or iterate it

#### GATE: Stage 2 exit milestone (Measured by: connects -> booked meetings, show rate, accounts with two people sequenced)

- [ ] `g2-1` Invite accepted
- [ ] `g2-2` Agenda sent
- [ ] `g2-3` Second contact made in sequence

---

## Stage 3: Investigate

**Job of this stage:** Find the expensive problem and put a number on it. Deals that stall in Lock almost always failed here, and were scored generously at the time.

### Discovery, the five-part call

- [ ] `d-1` Open human first, then set the meeting contract out loud: the agenda, how long, and what they get
- [ ] `d-2` State the three possible endings up front: it's a fit and you book a next step, it's not and they tell you straight, or you need more people and you work out who
- [ ] `d-3` Run the seven-layer question stack as the majority of the call, following every question with a second one
- [ ] `d-4` Pitch only what maps to what they just told you, enough to earn the next step, not a demo
- [ ] `d-5` Surface likely objections yourself before they have to (layer seven, skepticism)
- [ ] `d-6` Close with a dated next step and get a second name on the invite before you hang up, not after
- [ ] `d-7` Run a full discovery call end to end as a recorded roleplay, meeting contract through to the close

### Qualifying, the seven-layer stack

- [ ] `q-1` Situation, walk me through how [process] runs today; follow up on who touches it and what happens when that person is away
- [ ] `q-2` Struggle, where does it break down most; follow up on which one step they'd delete tomorrow, and why that one
- [ ] `q-3` Size, how often, and how many hours or people it takes to fix; follow up with what that's costing them
- [ ] `q-4` Stakes, what this looks like in 12 months if nothing changes; follow up on who upstairs feels it
- [ ] `q-5` Success, what specifically changes if it's solved, what metric moves, who's watching it
- [ ] `q-6` Structure, how a purchase like this gets approved, who else needs to be comfortable, whether budget is allocated or needs to be found
- [ ] `q-7` Skepticism, what they're least sure about, and what would stop this even if everyone agrees it should happen
- [ ] `q-8` Ask "what is that costing you" and go silent, do not rescue the buyer within three seconds
- [ ] `q-9` If they can't give a figure, build one together from units (frequency × hours × people × cost) and play it back for them to confirm
- [ ] `q-10` Map the decision process, budget position and timeline in the same call, not the next one

### Compelling event

- [ ] `ce-1` Look for findable events: compliance/regulatory deadlines, contract renewals, board targets, budget cycles, system end-of-life, funding milestones, headcount plans, product launches
- [ ] `ce-2` Confirm the date, ask what happens on that date and who's accountable when it arrives
- [ ] `ce-3` Where no event exists, build the cost of delay honestly from their own number (from the Size layer), converted to a monthly figure
- [ ] `ce-4` Say the cost of delay out loud, then ask what would need to be true to start earlier
- [ ] `ce-5` Never inflate the number, an honest figure they own beats a large one they'll dispute
- [ ] `ce-6` Log the event, its date, and the cost of delay in the CRM

Rule chips:

- **Meeting contract**: Say the agenda, the time, and the three possible endings out loud, that's what makes a fast no socially acceptable later.
- **Silence after the number**: Ask "what is that costing you," then say nothing. Most reps rescue the buyer within three seconds and hand back the only leverage they had.
- **No date, no deal**: A compelling event is a date with a consequence attached. If nothing bad happens by doing nothing, it's a conversation, not a deal.

How this stage fails:

- Collapsing questions and pitch, demoing four minutes in
- No meeting contract, so the hard questions feel intrusive
- Closing with "we'll catch up soon" instead of a date
- Leaving with one contact when a second name could've been added in thirty seconds
- Happy ears, enthusiasm mistaken for intent
- Accepting the first answer, which is always the feature and never the money
- Skipping the approval-process question because it feels presumptuous
- Supplying the number yourself so the buyer never owns it
- Claiming urgency without a date, or inventing a deadline the buyer doesn't recognise
- A cost of delay built on your assumptions rather than their figures

#### GATE: Stage 3 exit milestone

- [ ] `g3-1` Problem quantified in dollars, in the buyer's own words
- [ ] `g3-2` Compelling event dated, with a cost of delay attached
- [ ] `g3-3` Decision process, budget position and timeline mapped

---

## Stage 4: Prove

**Job of this stage:** Prove your solution closes their specific gap, in their words and their metrics. A verbal "they loved it" is a memory, "reply confirmed" is evidence.

### Demo, the 3-Act framework

| Act | Time | What happens |
|---|---|---|
| 1 · Set the stage | ~10% | Recap the pain from discovery, get them nodding, "last time we spoke, you told me X was costing you Y, is that still top of mind?" |
| 2 · The solution story | ~75% | Walk through 3-5 key workflows that directly address their stated pain. Less is more, never every feature |
| 3 · Call to action | ~15% | Confirm value, ask for feedback, establish clear next steps. Never end without a confirmed follow-up |

- [ ] `dm-1` Open with the replay, hand their problem back to them more clearly than they said it, and let them correct you
- [ ] `dm-2` Confirm what "fixed" looks like using their own success statement and metric before showing anything
- [ ] `dm-3` Demo only the three pains they named, nothing else goes on screen
- [ ] `dm-4` Run every section in the same order: feature, then outcome, then their number
- [ ] `dm-5` Stop and ask after each of the three, silence in a demo is not agreement
- [ ] `dm-6` Close by asking which of the three matters most, then confirm the next step with a date and a second name
- [ ] `dm-7` After each workflow, check in directly: "does this match what you described earlier?" / "is this solving the problem you mentioned with [pain]?"
- [ ] `dm-8` Watch engagement cues throughout, body language in person, camera/audio on video, and adjust if they check out

### Business case

- [ ] `bc-1` Establish the four numbers: cost today, cost of doing nothing, cost of the fix, and how fast it pays back
  - `bc-1__1`: Cost today
  - `bc-1__2`: Cost of doing nothing
  - `bc-1__3`: Cost of the fix
  - `bc-1__4`: Payback time
- [ ] `bc-2` Pull cost today straight from the Size layer, in their own words
- [ ] `bc-3` Pull cost of doing nothing from Stakes plus your cost-of-delay maths
- [ ] `bc-4` State the cost of the fix honestly, including implementation and internal effort
- [ ] `bc-5` Express payback in months, the unit an economic buyer actually approves against
- [ ] `bc-6` Put it on one page in four blocks: the problem and number in their language, the four numbers, why now (the compelling event date), and the first objection with the answer written together
- [ ] `bc-7` Build the case with the champion, not for them, what people help build, they defend
- [ ] `bc-8` Send a short written summary the same day and ask them to reply "confirmed"
- [ ] `bc-9` Agree pilot success criteria in writing before any pilot starts, a pilot with no criteria is free consulting

### ROI model, worked example

| Component | Example |
|---|---|
| Current state costs | 4 analysts × 20 hrs/week on manual data processing = $200K/year in labor |
| Future state benefits | Solution automates 80% of this = $160K/year saved |
| Investment | License = $80K/year |
| Net benefit | $160K − $80K = $80K/year |
| Payback period | $80K / $80K = 12 months (target: under 12) |
| 3-year ROI | 3-year net benefit $240K ÷ 3-year investment $240K × 100 = 100% ROI |

- [ ] `bc-10` Build the ROI model collaboratively with the champion, their numbers, not yours
- [ ] `bc-11` Use conservative assumptions throughout, credibility beats optimism
- [ ] `bc-12` Include soft benefits (speed, quality, risk reduction) only after the hard financials are established
- [ ] `bc-13` Present the model to the economic buyer in a dedicated value conversation, never tacked onto the end of a demo

### POC / proof of concept

> Unstructured POCs kill deals. Run every one on a written Mutual Success Plan, agreed before it starts.

| Element | Why it matters |
|---|---|
| Written success criteria (before starting) | Prevents the goalposts from moving |
| Clear start and end date | Creates urgency and accountability |
| Named technical owner, prospect side | Ensures someone is accountable |
| Agreed definition of "success" | Everyone knows what a win looks like |
| Formal readout meeting at the end | Forces a structured decision conversation |

- [ ] `poc-1` Write success criteria before the POC starts, not while it's running
- [ ] `poc-2` Set a clear start date and end date
- [ ] `poc-3` Name a technical owner on the prospect's side
- [ ] `poc-4` Agree the definition of "success" with them in writing
- [ ] `poc-5` Schedule a formal readout meeting at the end, never end a POC by email
- [ ] `poc-6` Use the readout to convert the outcome into next commercial steps

### Case studies

- [ ] `cs-1` Match proof on three dimensions: same industry, same role, same problem, two of three is usable, one is just a logo
- [ ] `cs-2` Use the five-part story structure: who they were, what was broken, what it cost, what changed (including what was hard), the number twelve months later
- [ ] `cs-3` Always include the hard part, honesty about the difficulty is what makes the rest credible
- [ ] `cs-4` Keep a story bank of three stories per core pain, so you never reach for the wrong one under pressure
- [ ] `cs-5` Treat a reference call as a trade, not a giveaway, ask for a shorter path to signature or a decision date in return
- [ ] `cs-6` Capture new stories at the win moment in Expand, so the bank keeps refilling

Rule chips:

- **Open with the replay**: Never the company slide. If they agree with your replay, everything after it lands. If they correct you, you just saved the deal.
- **Build with, not for**: What the champion helps build, they defend. A case built for them is a case they can't hold up under a finance question.
- **The confirmation sentence**: "I'll send a short summary tonight. If it's right, just reply confirmed." The highest-leverage habit in this stage, turns a good conversation into evidence.

### Finding & building a champion

> A Champion sells for you when you're not in the room. Nine in ten enterprise deals over $250K close on internal advocacy, not the pitch, and 70% of the meetings that move your deal happen without you there.

- **Coach**: Likes you and gives you information, but won't spend political capital, avoids introducing you to the economic buyer, stays silent in group meetings, and has nothing to gain or lose if you win.
- **Champion**: Likes you and has skin in the game, spends political capital to push the deal, makes the EB intro happen, speaks up for you in group meetings, and has career, reputation or a KPI riding on this working.
- [ ] `ch-1` Run the EB test, ask them to introduce you to the economic buyer
- [ ] `ch-2` Run the internal-sell test, ask "how would you describe what we do to your boss?" and expect a clear answer inside 30 seconds
- [ ] `ch-3` Run the forward test, send a one-page case or customer story and track whether they forward it internally
- [ ] `ch-4` Run the risk test, ask "what happens if this stalls?" and listen for real personal stakes, not a shrug
- [ ] `ch-5` Pull up your top 5 active deals and score each against all four tests
- [ ] `ch-6` Any deal passing fewer than three tests: downgrade it in the CRM and forecast from Champion to Coach
- [ ] `ch-7` Where you only have a Coach: coach them to articulate the internal pitch, find a different champion in the account, or be honest the deal isn't as far along as hoped

Rule chips:

- **Three-ask rule**: No EB introduction after three asks means you have a Coach, not a Champion, update the CRM and the forecast.
- **Coaches give intel, Champions open doors**: Never confuse the two in your pipeline review. The deal isn't real until the Champion is confirmed, not assumed.
- **3x win rate**: Deals with a tested, confirmed Champion close at roughly 3x the rate of deals where the rep only assumed they had one.

How this stage fails:

- Opening with the company slide, funding history and logo wall
- Feature-dumping in product-menu order instead of the three named pains
- Showing eleven things, which produces eleven objections
- Treating silence as agreement instead of asking
- A business case built for the champion instead of with them
- Three of the four numbers, usually missing the cost of doing nothing, the one that creates urgency
- Understating the cost of the fix, which unravels in procurement
- A pilot with no agreed success criteria
- Logo walls presented as proof, or stories with no number in them
- Stories that skip the hard part and end up sounding like marketing
- Giving away reference calls freely, which burns your best customers and buys you nothing
- Assuming a Champion instead of testing for one

#### GATE: Stage 4 exit milestone

- [ ] `g4-1` Champion confirms value in writing ("confirmed")
- [ ] `g4-2` Economic buyer has personally seen the business case

---

## Stage 5: Lock

**Job of this stage:** Convert stated agreement into a signed, funded, dated commitment, with every internal obstacle already handled. This is the end of the sale.

### Mutual action plan

- [ ] `map-1` Start at the date they want to be live, the one you dated in the compelling event
- [ ] `map-2` Work backwards through the steps: business case confirmed with the EB, security/IT review started, legal & procurement engaged, commercials agreed, signature, kickoff and go live
- [ ] `map-3` Put an owner and a date on every step, on both sides, named people, never departments
- [ ] `map-4` Define the specific evidence that proves each step is done (a booked review, a named reviewer, an executed agreement), not "in progress"
- [ ] `map-5` Send the plan the same day you build it
- [ ] `map-6` Review it weekly with the champion for 15 minutes, updating owners and dates

| Week | Step | Owner |
|---|---|---|
| 1 | Business case confirmed with the economic buyer | Champion & rep |
| 1 | Security and IT review started | Their security team |
| 2 | Legal and procurement engaged | Both sides |
| 3 | Commercials agreed | Rep & economic buyer |
| 4 | Signature | Economic buyer |
| 5 | Kickoff and go live | Delivery & champion |

A simpler version of the same plan, if six named steps is a better starting point than a full backwards-build:

| Step | Owner | Target date |
|---|---|---|
| Security and IT review complete | Prospect IT team | Week 1 |
| Legal red lines returned | Prospect legal | Week 2 |
| Legal negotiation complete | Both parties | Week 3 |
| Finance approval | Economic buyer | Week 3 |
| Contract signature | Signatory | Week 4 |
| Kickoff call scheduled | CSM and AE | Week 4 |

### Negotiation

> Negotiation starts at hello. Every interaction sets a precedent, discount before they ask and you train them to expect it; accommodate every request and you lose leverage; respond instantly to every demand and you remove their urgency.

Rule chips:

- **Never negotiate against yourself**: Trade every concession for something back, a faster close, a multi-year term, expanded scope.
- **Anchor high**: Your first number leaves room to move. Never open with your floor.
- **Bundle, don't unbundle**: Package concessions together rather than giving them away one at a time.
- **Understand their constraints**: Ask about procurement, legal and finance rules before assuming what's possible.
- [ ] `neg-1` Watch what you set as precedent from the very first conversation, not just at the negotiating table
- [ ] `neg-2` Anchor your opening number high enough to leave room to move
- [ ] `neg-3` Bundle any concessions together rather than conceding one at a time
- [ ] `neg-4` Ask about their procurement, legal and finance rules before assuming what's possible
- [ ] `neg-5` If they want a discount, trade for something back, a longer term, more seats, a faster signature, or case study rights

### Closing techniques

> The modern ABCs: Always Be Creating Value. A deal that needs to be "closed" was usually lost earlier, if the close feels hard, diagnose backwards: missing EB? Weak champion? An unresolved objection?

How this stage fails:

- "Whenever you're ready…"
- "Let me know if you want to proceed"
- "I'll check back with you next month"

| Technique | Example |
|---|---|
| Assumptive | "Let's plan on kicking off on the 1st, I'll introduce you to your Customer Success Manager today." |
| Summary | "You've confirmed this solves [X], the ROI analysis shows $[Y] in savings, and the team is aligned. What's holding us back from moving forward this week?" |
| Last-call / urgency | "Our Q3 pricing expires Friday, signatures by then and I can hold your rate and get you priority onboarding." |
| Option | "Which rollout timeline works better for your team, a January 1st start or February 1st?" |

- [ ] `ct-1` Cut weak, passive closing language from your vocabulary entirely
- [ ] `ct-2` Use the assumptive close, state the next step as already happening
- [ ] `ct-3` Use the summary close, restate confirmed value and ROI, then ask directly what's holding things back
- [ ] `ct-4` Use the urgency close only when a real deadline exists, never an invented one
- [ ] `ct-5` Use the option close, offer two acceptable paths instead of a plain yes/no
- [ ] `ct-6` If a close feels hard, diagnose backwards instead of pushing harder: missing EB, weak champion, or an unresolved objection

### Procurement

- [ ] `pr-1` Isolate before you concede, find out whether price is the only thing left before you move on it
- [ ] `pr-2` Deliver the price, then stop talking, the first person to speak usually pays for it
- [ ] `pr-3` Trade every give: discount -> longer term, monthly -> annual upfront or shorter ramp, pilot -> written criteria + decision date, smaller scope -> faster start, anything -> a case study or referrals
- [ ] `pr-4` Never move first, and never move twice without something substantial coming back
- [ ] `pr-5` Never discount a deal with no champion and no business case, that's just a cheaper broken deal
- [ ] `pr-6` Keep a concession log, every give and exactly what it bought; a blank line is a gift, not a trade

### Legal

- [ ] `lg-1` Send paper early, the moment commercials are directionally agreed, get the agreement into their queue
- [ ] `lg-2` Ask the champion who owns legal and what the backlog looks like, it tells you whether your date is realistic
- [ ] `lg-3` Know your three standard red lines and who internally can sign off on each, before their counsel is waiting
  - `lg-3__1`: Red line 1 (+ who signs off)
  - `lg-3__2`: Red line 2 (+ who signs off)
  - `lg-3__3`: Red line 3 (+ who signs off)
- [ ] `lg-4` Track every redline in the mutual action plan with an owner and a date, not in an email thread
- [ ] `lg-5` Get the two legal teams talking directly where you can, rather than relaying through you
- [ ] `lg-6` Escalate on time, not on temperature, a redline stuck five days is a scheduling issue, raise it as one

### Security

- [ ] `sec-1` Ask the security question in Investigate, not Lock, who reviews new vendors, and what does that process involve
- [ ] `sec-2` Get the security contact named and the review booked in week one of the mutual action plan
- [ ] `sec-3` Have the pack ready before it's requested: SOC 2/ISO certification, pen test summary, data residency position, DPA, sub-processor list
- [ ] `sec-4` Introduce your own solutions engineer or security lead directly to their contact, peer to peer clears faster than seller to security
- [ ] `sec-5` Answer questionnaires completely and quickly, a half-completed one goes to the back of the queue
- [ ] `sec-6` Track the review as a dated step in the plan, same as any other

### Closed won

- [ ] `cw-1` Debrief within a week, while the detail is still accurate rather than remembered
- [ ] `cw-2` Capture the trigger and the path: what it was, which channel got the first reply, how many touches it took
  - `cw-2__1`: What the trigger was
  - `cw-2__2`: Which channel got the first reply
  - `cw-2__3`: How many touches it took
- [ ] `cw-3` Capture the problem and the number in the customer's exact words, that language becomes next quarter's script
  - `cw-3__1`: The problem, in their words
  - `cw-3__2`: The number, in their words
- [ ] `cw-4` Capture what nearly killed the deal, who raised it, and what actually resolved it, the lows teach more than the highs
  - `cw-4__1`: What nearly killed the deal
  - `cw-4__2`: Who raised it
  - `cw-4__3`: What actually resolved it
- [ ] `cw-5` Brief delivery on the precise promise you made, in the customer's own words, before the handoff call
- [ ] `cw-6` Present the debrief to the group rather than just filing it

Rule chips:

- **Backwards, not forwards**: Build the plan from the date they want to be live, never forwards from today, a forwards plan suits your quarter, not theirs.
- **Trade, never gift**: Every concession buys something specific, the moment you give one away free, you've taught them the next one is free too.
- **Security in Investigate, not Lock**: Meet them early and they help you. Meet them here and they protect themselves by slowing everything down.

### Why deals are actually lost

Rule chips:

- **No budget**: Should've been found at layer six back in Investigate. Arriving here means a business-case problem or a timing problem, a discount does not create a budget line.
- **No urgency**: If nothing bad happens by doing nothing, the stakes were never sized. Go back to Stakes and the compelling event.
- **Build it internally**: Ask what that costs in engineering months, who maintains it in year two, and what else that team would've shipped instead.

How this stage fails:

- A plan built forwards from today instead of backwards from go live
- Owners listed as departments rather than named people
- A plan built and never sent, or never reviewed after week one
- Gifting a discount for goodwill, it buys nothing and signals there's more available
- Moving on price before isolating whether price was ever the real issue
- Sending legal paper late because it felt like a formality
- Redlines tracked in an email thread nobody owns
- Discovering the security review in week six, after the date's already public
- A shared inbox instead of a named security contact
- Celebrating a win without ever debriefing it
- Delivery inheriting a contract instead of the promise you actually made

#### GATE: Stage 5 exit milestone

- [ ] `g5-1` Signed, with a start date
- [ ] `g5-2` Funded
- [ ] `g5-3` Security and legal cleared

---

## Stage 6: Expand

**Job of this stage:** Turn one signature into retained revenue, a referable reputation and the next pipeline. The cheapest pipeline that exists, and the only pipeline your competitors can't see.

### Handoff

- [ ] `ho-1` Run a warm handoff call with delivery and the champion in the same room, never by email
- [ ] `ho-2` Cover block 1: why they're doing anything at all, the problem, the number, and the compelling event with its date
- [ ] `ho-3` Cover block 2: why your company, what you were compared against and what tipped it
- [ ] `ho-4` Cover block 3: what success looks like, the agreed criteria in the customer's language, and the metric measured at day 30
- [ ] `ho-5` Cover block 4: the full stakeholder map, every name, role, what they wanted, and especially who nearly blocked it
- [ ] `ho-6` Say the committed promise back out loud with both parties in the room, and let the champion correct you
- [ ] `ho-7` Stay on the account, don't disappear the moment the contract's signed

### Implementation

- [ ] `im-1` Book day 1, day 30, day 60 and day 90 in the calendar the day the deal closes, not later
- [ ] `im-2` Day 1: the warm handoff call, with success criteria in writing
- [ ] `im-3` Day 30: first value check-in against the promised metric, ask what's slower than expected, never "how's it going"
- [ ] `im-4` Day 60: the win moment, capture the numbers and the quote while the result is fresh
  - `im-4__1`: The numbers
  - `im-4__2`: The quote
- [ ] `im-5` Day 90: the expansion conversation, with the champion and one new team in the room
- [ ] `im-6` Go onsite for the launch where you can, and celebrate it publicly with the team
- [ ] `im-7` Escalate early, raise problems while they're still problems, not once they've become renewal conversations

### New use case expansion

- [ ] `xp-1` Ask for the referral at the day-60 win moment, not at renewal, when the emotion has faded
- [ ] `xp-2` Anchor the ask to their own number, so it's specific rather than a favour
- [ ] `xp-3` Map the expansion across all five directions and put a name against each
  - `xp-3__1`: More use
  - `xp-3__2`: Next team
  - `xp-3__3`: Next region
  - `xp-3__4`: Level up
  - `xp-3__5`: Outside the account
- [ ] `xp-4` Open at least one of those five directions within the month
- [ ] `xp-5` Capture the case study while the emotion and numbers are both still high
- [ ] `xp-6` Track champions who change companies, congratulate in week one, sell in week six
- [ ] `xp-7` Put the expanded account back on your A-tier list in Target, the cycle restarts here

| Direction | What it looks like |
|---|---|
| More use | Same team, deeper adoption of what they already bought |
| Next team | A different team inside the same function hits the same problem |
| Next region | The same process, run again in another market or site |
| Level up | The executive who owns the outcome across every team, not just this one |
| Outside the account | Their personal network, the referral, not the upsell |

Rule chips:

- **Warm handoff, never email**: Delivery inherits the exact promise, in the customer's words, with the person who nearly blocked it named on the map.
- **Day 1 / 30 / 60 / 90**: Booked on the day the deal closes, not later when everyone's busy. Silence at day 40 is a warning, not a convenience.
- **Ask at day 60, not renewal**: Gratitude has a short shelf life, the referral, the case study and the expansion all get harder to obtain every week you wait.

How this stage fails:

- A handoff by email, or worse, a CRM field marked closed won
- Success criteria written in your language instead of theirs
- The blocker left off the stakeholder map, so delivery walks in unprepared
- The rep disappearing after signature, wasting everything built in Investigate and Prove
- Check-ins that ask "how's it going" instead of measuring the promised metric
- Assuming a quiet account is a healthy one
- Treating training and education as somebody else's job
- Booking the check-ins "later," which means never
- Closed-won amnesia, treating the account as finished at signature
- Asking for the referral at renewal, once the emotion has faded
- No case study captured, so the next deal has no matched story to sell with
- A champion leaves and nobody notices for six months

#### GATE: Stage 6 exit milestone

- [ ] `g6-1` Documented win, captured while fresh
- [ ] `g6-2` One referral asked for and answered
- [ ] `g6-3` One expansion direction opened

---

## Seven Laws (apply to every stage)

1. Evidence over optimism. A good feeling is a signal, not data.
2. Let the milestone guide you. If it's not met, the stage is still open, however good the call felt.
3. Put a number on it. A problem without a number is still just a conversation.
4. A clear no beats an uncertain maybe. Knowing when to walk protects your time for real opportunities.
5. Sell the problem, not the product. People buy the removal of a cost they can name.
6. You're paid to advance the deal. Close every interaction with a scheduled next step.
7. If it's not written down, it's hard to rely on. A date and an owner in the CRM, or it's not real to anyone else.

## The Double Rule

- **Double deep**: Never accept the first answer. The first is the feature; the second is the money and the emotion. Every question has a follow-up, and that's where the deal lives.
- **Double wide**: Never single-thread an account. One champion is a hobby, two is a deal, three is a forecast.

## Deal inspection: the six questions

Ask of every open deal, weekly.

1. The trigger. What is it, and why this account over any other on the list?
2. The stakeholders. Who else at the account is engaged, and what did they actually say?
3. The number. What's the problem in dollars and their words, and what's the compelling event?
4. The proof. What did the champion confirm in writing, and when?
5. The plan. What does the mutual action plan say happens next, who owns it, by when?
6. The next deal. What's the referral or expansion path once this one is won?