'use client'

import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────

type Channel = 'email' | 'linkedin' | 'phone' | 'video' | 'note'

interface Touch {
  day: number | string
  channel: Channel
  type: string
  subject?: string
  body: string
  note?: string
}

interface Sequence {
  id: number
  name: string
  tagline: string
  when: string
  touches: Touch[]
  tip?: string
}

// ── Data ──────────────────────────────────────────────────────────────────

const SEQUENCES: Sequence[] = [
  {
    id: 1,
    name: 'The Workhorse',
    tagline: '8 touches · 17 business days · cold mid-market',
    when: 'Default for cold mid-market outreach (AE / manager level). Mix of email, LinkedIn, and phone.',
    touches: [
      {
        day: 1, channel: 'email', type: 'Opener',
        subject: 'quick idea for [COMPANY]',
        body: `Hi [FIRST NAME],

Saw [TRIGGER — e.g., your team just posted about expanding into APAC / your Q3 hire of [NAME] / [SPECIFIC NEWS]] and figured it was worth a note.

We work with teams like [CUSTOMER 1], [CUSTOMER 2] and [CUSTOMER 3] who were running into [SPECIFIC PROBLEM YOUR PRODUCT SOLVES]. After [TIMEFRAME] with us, [CUSTOMER STORY — e.g., they cut onboarding time by 40% and recovered 12 hours/week per AE].

Worth 15 minutes next Tue or Wed to compare notes?

[YOUR NAME]`,
      },
      {
        day: 2, channel: 'linkedin', type: 'Connection Request',
        body: `Hi [FIRST NAME] — emailed you yesterday but figured I'd connect here too. We help [SIMILAR ROLE] teams at [SIMILAR COMPANY TYPE] with [PROBLEM]. Open to connecting either way?`,
        note: 'Under 200 characters.',
      },
      {
        day: 4, channel: 'phone', type: 'Call + Voicemail',
        body: `CALL SCRIPT (if they pick up — under 30 seconds):
Hi [FIRST NAME], it's [YOUR NAME] from [COMPANY]. I know this is a cold call — gimme 30 seconds, then you can hang up if it's not relevant?
[Wait for yes]
We're working with [CUSTOMER 1] and [CUSTOMER 2] on [PROBLEM]. Reason I called you specifically — [SPECIFIC TRIGGER ABOUT THEIR COMPANY]. Worth comparing notes for 15 minutes next week?

───

VOICEMAIL (under 25 seconds):
Hi [FIRST NAME], [YOUR NAME] from [YOUR COMPANY]. Quick one — we just helped [CUSTOMER STORY in 1 line]. Thought it'd be worth comparing notes given [TRIGGER]. I'll send a follow-up email — easier to reply there. Cheers.`,
      },
      {
        day: 6, channel: 'email', type: 'Bump with proof',
        subject: 'Re: quick idea for [COMPANY]',
        body: `[FIRST NAME] — bumping this up.

Quick number that might be relevant: [CUSTOMER STORY with hard metric — e.g., "Atlassian's RevOps team cut their reporting cycle from 5 days to 4 hours"].

Worth 15 min?

[YOUR NAME]`,
        note: 'Reply to the original thread.',
      },
      {
        day: 9, channel: 'linkedin', type: 'Engagement (no DM)',
        body: `Don't message yet. Engage genuinely with 1–2 of their recent posts:

• Add a thoughtful comment that disagrees politely or extends their argument
• Like their last 2–3 posts so your name shows up in notifications
• Share one of their posts with a one-line endorsement

Goal: become a familiar face before the next outreach. The next email lands warmer because they've seen you twice in their feed.`,
      },
      {
        day: 11, channel: 'phone', type: 'Second call — no voicemail',
        body: `Different time of day than your first call (morning → afternoon or vice versa).

If they answer, run the same 30-second script as Day 4.

Don't leave a voicemail — two voicemails in two weeks reads as desperate. Just hang up and let the missed-call notification do the work.`,
      },
      {
        day: 14, channel: 'email', type: 'Pattern interrupt',
        subject: 'wrong person?',
        body: `[FIRST NAME] — getting the sense I might be barking up the wrong tree here.

If [PROBLEM] isn't on your plate, who would I chat to instead? Or just tell me to buzz off and I'll mark this one closed.

Either way, no hard feelings.

[YOUR NAME]`,
      },
      {
        day: 17, channel: 'email', type: 'Breakup',
        subject: 'closing the loop',
        body: `[FIRST NAME] — last one from me.

Going to close this one out on my end. If [PROBLEM] becomes a priority later, just reply to this thread and I'll pick it up.

Wishing you a great quarter.

[YOUR NAME]`,
        note: 'The breakup email gets the highest reply rate in the sequence — often 2–3× the opener. Never apologise. Just close the loop.',
      },
    ],
  },
  {
    id: 2,
    name: 'The Trigger-Event Sprint',
    tagline: '5 touches · 8 business days · funding / hire / news',
    when: 'Speed beats polish here. Use within 14 days of a trigger event (funding round, senior hire, acquisition, leadership change). Spot triggers in LinkedIn Sales Navigator, news alerts, or press releases.',
    touches: [
      {
        day: 1, channel: 'email', type: 'Trigger opener',
        subject: '[TRIGGER in 3 words] — quick thought',
        body: `Hi [FIRST NAME],

Saw the news about [TRIGGER — e.g., the Series C raise / [NAME] joining as VP / the [COMPETITOR] acquisition]. Congrats / interesting timing.

Reason I'm reaching out: when [SIMILAR COMPANY] went through the same thing last year, the first thing they hit was [SPECIFIC PROBLEM YOUR PRODUCT SOLVES]. We helped them [CUSTOMER STORY in 1 line].

Worth 15 minutes to talk through what we saw, even if you're not buying anything?

[YOUR NAME]`,
        note: 'Send the same day as the trigger event. Window of relevance is 14 days max.',
      },
      {
        day: 1, channel: 'linkedin', type: 'Connection note',
        body: `Hi [FIRST NAME] — saw [TRIGGER]. Reaching out because [SIMILAR COMPANY] hit a specific bottleneck right after the same move. Happy to share what worked. Open to connecting?`,
      },
      {
        day: 3, channel: 'phone', type: 'Call + Voicemail',
        body: `CALL SCRIPT (if they pick up):
Hi [FIRST NAME], [YOUR NAME] from [YOUR COMPANY]. Saw [TRIGGER] — figured this is the moment to call. Reason I'm dialling: when [SIMILAR COMPANY] went through it, the bottleneck was [PROBLEM]. Worth 15 minutes to compare notes?

───

VOICEMAIL:
Hi [FIRST NAME], [YOUR NAME] here. Saw [TRIGGER] — congrats. Quick one — when [SIMILAR COMPANY] went through it, we helped them [CUSTOMER STORY]. Sending a follow-up email now. Cheers.`,
      },
      {
        day: 5, channel: 'email', type: 'Customer mirror',
        subject: 'what [SIMILAR COMPANY] did',
        body: `[FIRST NAME] — quick story.

When [SIMILAR COMPANY] [HAD THE SAME TRIGGER] last year, here's exactly what happened:

• Month 1: [PROBLEM EMERGED]
• Month 3: [DECIDED TO ACT]
• Month 6: [OUTCOME WITH METRIC — e.g., 40% faster onboarding, $400K saved, 2 weeks earlier go-live]

Not saying you'll hit the same beats. But the timing of [TRIGGER] is when most teams either get ahead of this or fall behind on it.

15 mins next week?

[YOUR NAME]`,
      },
      {
        day: 8, channel: 'email', type: 'Soft close',
        subject: 'your call',
        body: `[FIRST NAME] — not going to keep emailing.

If the timing's wrong I get it. If [TRIGGER] gets you thinking about [PROBLEM] in the next few weeks, just reply to this thread.

[YOUR NAME]`,
      },
    ],
  },
  {
    id: 3,
    name: 'The Executive Patience Play',
    tagline: '5 touches · 4 weeks · CXO / VP level',
    when: 'Executives get hundreds of cold emails a week. Slower (5 touches over 4 weeks), each one more substantive. Designed to make the executive want to take the call.',
    tip: 'The 2-page brief on Day 28 takes 2–3 hours to write. Most reps will not do this. That is precisely why it works.',
    touches: [
      {
        day: 1, channel: 'email', type: 'Insight opener',
        subject: 'an observation about [THEIR INDUSTRY]',
        body: `[FIRST NAME],

We're seeing something across [THEIR INDUSTRY/SEGMENT] right now that's worth flagging.

[SPECIFIC INSIGHT — e.g., "CFOs at Series C SaaS companies are pulling forward their FP&A automation projects by 6–9 months because of the rate environment"].

Most people we talk to are surprised when they see the data. I'm not pitching — happy to send the full breakdown if useful, no strings.

[YOUR NAME]
[YOUR COMPANY]`,
        note: 'Under 100 words, but more substantive than the Workhorse opener.',
      },
      {
        day: 7, channel: 'linkedin', type: 'Connection note',
        body: `Hi [FIRST NAME] — emailed you last week about [INSIGHT TOPIC]. No pressure to reply — just figured we should be connected given how much overlap there is. [Optional: "Your post on [TOPIC] last week was sharp."]`,
      },
      {
        day: 14, channel: 'email', type: 'Peer name-drop',
        subject: '[PEER 1], [PEER 2], [PEER 3]',
        body: `[FIRST NAME],

Sending this one because I noticed [PEER 1] at [SIMILAR COMPANY 1], [PEER 2] at [SIMILAR COMPANY 2], and [PEER 3] at [SIMILAR COMPANY 3] are all working with us on [SPECIFIC PROBLEM].

Three peers in the same role at the same stage of company is a pattern worth a 20-minute conversation.

Happy to send what we did with each of them first if you'd rather scan than meet.

[YOUR NAME]`,
        note: 'Executives buy on social proof more than any other buyer category. Three named peers at peer-level companies is the highest-converting hook for CXO outreach.',
      },
      {
        day: 21, channel: 'phone', type: 'Call (often EA)',
        body: `IF AN EA PICKS UP:
Hi, this is [YOUR NAME] from [YOUR COMPANY]. I've been emailing [FIRST NAME] over the past few weeks about [TOPIC]. I know they're slammed — could you let me know the best way to get 15 minutes on their calendar, or who I should be coordinating with?

───

VOICEMAIL (if direct line):
Hi [FIRST NAME], [YOUR NAME] from [YOUR COMPANY]. Quick voicemail. I've sent a couple of emails over the past few weeks — happy to wait for the right time. If [TOPIC] is genuinely on the priority list this quarter, just reply to my last email and I'll work around your calendar.`,
      },
      {
        day: 28, channel: 'email', type: 'Tailored research piece',
        subject: 'two pages on [SPECIFIC TOPIC] for [COMPANY]',
        body: `[FIRST NAME],

Spent a couple of hours putting together a 2-page brief specifically on [SPECIFIC TOPIC] for [COMPANY]. Three observations:

1. [SPECIFIC INSIGHT 1 — referencing public data about their company]
2. [SPECIFIC INSIGHT 2 — connecting to their industry]
3. [SPECIFIC INSIGHT 3 — implication for their role]

Attaching the full brief. Not asking for a meeting — if anything in there sparks a conversation, just reply.

[YOUR NAME]`,
        note: 'Attach a real 2-page PDF. This touch takes 2–3 hours. Not asking for anything. The effort IS the message.',
      },
    ],
  },
  {
    id: 4,
    name: 'The Inbound Accelerator',
    tagline: '5 touches · 8 days · after a signal',
    when: 'When a prospect downloads a whitepaper, signs up for a trial, attends a webinar, or hits a high-value page. Speed-to-lead matters more here than anywhere else. A 5-minute response is 9× more likely to convert than a 30-minute one.',
    tip: 'Multiple-choice openers win inbound. Open-ended questions ("What are you working on?") feel like work. Multiple-choice feels like an opt-in.',
    touches: [
      {
        day: 0, channel: 'email', type: 'Signal acknowledgement',
        subject: 'saw you grabbed [CONTENT/TRIAL]',
        body: `Hi [FIRST NAME],

Saw you [SPECIFIC SIGNAL — e.g., downloaded our buyer's guide / signed up for the trial / registered for the webinar].

Most people who [DID THE SAME THING] are usually wrestling with one of three problems: [PROBLEM A], [PROBLEM B], or [PROBLEM C]. Which one's closest for you?

Happy to skip the demo and just answer the actual question if it's easier.

[YOUR NAME]`,
        note: 'Send within 5 minutes of the signal.',
      },
      {
        day: 0, channel: 'phone', type: 'Speed-to-lead call',
        body: `CALL SCRIPT (within 1 hour of signal):
Hi [FIRST NAME] — [YOUR NAME] from [YOUR COMPANY]. Saw you [DID SIGNAL] in the last hour, figured I'd just call rather than play email tag. Got 2 minutes to tell me what you're trying to figure out, and I can either help directly or save us both time?

───

VOICEMAIL:
Hi [FIRST NAME], [YOUR NAME] from [YOUR COMPANY]. Saw you [DID SIGNAL]. Just emailed you with three common questions — easier to reply there. If one matches, I'll have you a real answer in an hour. Cheers.`,
      },
      {
        day: 2, channel: 'linkedin', type: 'Connection note',
        body: `Hi [FIRST NAME] — saw you [DID SIGNAL] yesterday. Sent an email already. Adding here in case email isn't your channel. Whatever's easier for you.`,
      },
      {
        day: 4, channel: 'email', type: 'Get to the real question',
        subject: 'honest question',
        body: `[FIRST NAME] — different angle.

Forget the demo for a sec. What's the actual thing you're trying to figure out — like, the question your boss asked you to answer, or the project that landed on your plate?

If you tell me, I can either send you something useful in 5 minutes, or tell you we're not the right fit and free up your inbox.

[YOUR NAME]`,
      },
      {
        day: 8, channel: 'email', type: 'Soft close',
        subject: 'still relevant?',
        body: `[FIRST NAME] — quick check.

Sometimes [SIGNAL — e.g., "the trial" / "the download"] was just casual research. If that's you, no problem at all — I'll close this out.

If it's actually live, just reply with a thumbs up and I'll work around your week.

[YOUR NAME]`,
      },
    ],
  },
  {
    id: 5,
    name: 'The Multithread',
    tagline: '3 parallel lanes · active deals or enterprise accounts',
    when: 'When you have an active deal or want to start one. Run three parallel mini-sequences across Champion, Economic Buyer, and Technical stakeholder simultaneously. Always loop in your Champion that you\'re reaching out to others — never multithread behind their back.',
    tip: 'Coordinate touches so they don\'t all land on the same day. The goal is to walk into a meeting where 3+ people are already nodding.',
    touches: [
      {
        day: 1, channel: 'email', type: 'Champion lane — opener',
        subject: 'your day, faster',
        body: `Hi [FIRST NAME],

Direct one — most [THEIR ROLE] we work with at [SIMILAR COMPANY TYPE] are spending [X HOURS/WEEK] on [SPECIFIC TASK]. After they roll us out, that drops to [Y HOURS/WEEK].

Not pitching, just curious — is that a fair description of how your week looks too?

If yes, worth 15 mins to show you what changed. If not, no harm done.

[YOUR NAME]`,
      },
      {
        day: 1, channel: 'email', type: 'Economic Buyer lane — opener',
        subject: '[CUSTOMER 1], [CUSTOMER 2], and [COMPANY]',
        body: `[FIRST NAME],

Two of your peers — [PEER 1] at [CUSTOMER 1] and [PEER 2] at [CUSTOMER 2] — are running [PRODUCT] across their teams.

The number that matters: [METRIC FROM THE EB'S PERSPECTIVE — e.g., "$1.2M of recovered productivity over 12 months at [CUSTOMER 1]"].

Worth 20 minutes to walk through how they got there, even if [COMPANY] isn't ready to move?

[YOUR NAME]`,
      },
      {
        day: 1, channel: 'email', type: 'Technical lane — opener',
        subject: 'architecture question',
        body: `Hi [FIRST NAME],

Talking to [CHAMPION NAME] at [COMPANY] about [PRODUCT]. Wanted to loop you in early because the technical questions usually come up before the commercial ones.

Quick context on us: [INTEGRATION/SECURITY DETAILS in 1–2 lines — e.g., "SOC 2 Type II, native [CRM] integration via [METHOD], runs in your VPC"].

Happy to send architecture diagrams or set up 15 mins with our SE — whatever works for how you like to evaluate.

[YOUR NAME]`,
        note: 'Always tell your Champion you\'re reaching out to the technical contact. Frame it as a courtesy to move faster.',
      },
    ],
  },
  {
    id: 6,
    name: 'The Resurrection',
    tagline: '4 touches · closed-lost deals 6–18 months ago',
    when: 'Closed-lost deals from 6+ months ago, dormant pipeline, or conversations that went quiet. Run on every closed-lost deal from 6–18 months ago every 2 quarters. These prospects already know who you are.',
    touches: [
      {
        day: 1, channel: 'email', type: 'Reopen the conversation',
        subject: 'circling back from [LAST CONVERSATION TIMING]',
        body: `[FIRST NAME] — long time.

Last we spoke was around [TIMING — e.g., "March last year"] when [COMPANY] was [REASON FOR THE NO — e.g., "mid-implementation with [COMPETITOR]" / "waiting on a new VP" / "focused on a different priority"].

Just thought to check in — has that situation changed? No agenda either way.

[YOUR NAME]`,
      },
      {
        day: 4, channel: 'linkedin', type: 'Casual DM',
        body: `Hey [FIRST NAME] — hope you're well. Sent you an email a few days ago. Genuinely just a check-in, not a pitch. If now's a wrong time entirely, totally fine — just curious how things are tracking after [LAST PROJECT/SITUATION YOU DISCUSSED].`,
        note: 'You\'re already connected, so this is a DM, not a connection request.',
      },
      {
        day: 8, channel: 'email', type: 'What\'s different now',
        subject: 'a few things changed on our end',
        body: `[FIRST NAME] — for what it's worth.

Three things that are materially different from when we last spoke:

1. [PRODUCT CHANGE — e.g., "We shipped [FEATURE] that closes the gap you raised"]
2. [COMMERCIAL CHANGE — e.g., "Pricing now starts at [X] for teams under [SIZE]"]
3. [PROOF CHANGE — e.g., "[CUSTOMER 1] and [CUSTOMER 2] joined since we last spoke — both your size, both faced [SAME PROBLEM]"]

If any of those changes the answer, happy to grab 15 mins. If not, all good.

[YOUR NAME]`,
      },
      {
        day: 14, channel: 'email', type: 'Open door',
        subject: 'leaving the door open',
        body: `[FIRST NAME] — last note.

Won't keep pinging. Whenever the timing's right, just reply to this thread and I'll pick straight back up.

Wishing [COMPANY] a strong [CURRENT QUARTER].

[YOUR NAME]`,
      },
    ],
  },
  {
    id: 7,
    name: 'The A/B Test Sequence',
    tagline: 'Overlay on any sequence · 100+ prospects per variant',
    when: 'Not a separate cadence — a methodology you run on top of any sequence. Split-test one variable at a time. Track reply rate AND meeting booked rate (higher replies that don\'t convert to meetings is fool\'s gold).',
    tip: 'Test the opener, the proof, and the CTA. Ignore everything else. Run each variant for at least 100 prospects before drawing conclusions.',
    touches: [
      {
        day: 0, channel: 'note', type: 'How to set up',
        body: `1. Duplicate your sequence and tag it clearly (e.g., "Workhorse — Variant A" / "Workhorse — Variant B")
2. Change ONE thing only between variants. Subject line, opener, or CTA. Never change two things at once.
3. Run for at least 100 prospects per variant before drawing conclusions. Below that, the data is noise.
4. Compare reply rate AND meeting booked rate. Higher replies that don't convert = fool's gold.
5. Adopt the winner. Test the next variable. This is a continuous habit, not a one-off.`,
      },
      {
        day: 0, channel: 'email', type: 'Variant A — Trigger-led opener',
        subject: 'saw the [SERIES C] news',
        body: `Hi [FIRST NAME] — saw the news. Congrats.

Reason I'm reaching out: [SIMILAR COMPANY] hit the same milestone last year and immediately ran into [PROBLEM]. We helped them [CUSTOMER STORY in 1 line].

Worth comparing notes for 15 minutes?

[YOUR NAME]`,
      },
      {
        day: 0, channel: 'email', type: 'Variant B — Insight-led opener',
        subject: 'a pattern at [STAGE] companies',
        body: `Hi [FIRST NAME],

We're seeing a consistent pattern at [STAGE] companies right now — [SPECIFIC INSIGHT, e.g., "the ones that scale through Series C without hitting [PROBLEM] all do one thing differently in the first 90 days post-raise"].

Happy to send the breakdown if useful, no strings.

[YOUR NAME]`,
        note: 'Run both for two weeks across 100+ prospects each. The data will tell you which one your buyers respond to.',
      },
    ],
  },
  {
    id: 8,
    name: 'The Sniper',
    tagline: '8 touches · 6 weeks · top 5–10 strategic accounts only',
    when: 'Reserve for accounts where (1) the deal would be in the top 10% of your book and (2) the prospect is genuinely a fit. Maximum 10 prospects in this sequence at any time. Almost no automation — each touch is hand-crafted.',
    tip: 'The investment is what separates peer-level outreach from rep-style spam. Most reps will not do this. That is precisely why it works.',
    touches: [
      {
        day: 1, channel: 'email', type: 'Hand-crafted opener',
        subject: '[SOMETHING SPECIFIC YOU NOTICED]',
        body: `[FIRST NAME],

Spent some time looking at [COMPANY] before reaching out. Three things stood out:

1. [SPECIFIC OBSERVATION 1 — about their product, market, recent news]
2. [SPECIFIC OBSERVATION 2 — about their team or a specific role]
3. [SPECIFIC OBSERVATION 3 — connecting to your value prop]

I'm not going to ask for a meeting yet. I just wanted to land in your inbox so when I do, you'll know I've actually done the work.

More to come.

[YOUR NAME]`,
        note: 'No CTA on this touch. The non-ask is the hook.',
      },
      {
        day: 7, channel: 'linkedin', type: 'Engagement + Connection',
        body: `Engage with 2–3 of their recent posts before sending a connection request.

Connection note: Hi [FIRST NAME] — left a comment on your post about [TOPIC]. Sent you an email last week. Figured we should be connected — I think there's a real reason for [COMPANY] and [YOUR COMPANY] to talk.`,
      },
      {
        day: 10, channel: 'video', type: 'Personalised video (Loom/Vidyard)',
        subject: '90 seconds for [FIRST NAME]',
        body: `VIDEO STRUCTURE (under 90 seconds):

0–10 sec: Wave at camera. Say their name and company. "Hi [FIRST NAME] — quick one for you specifically."

10–40 sec: Share your screen showing something specific to them — their product page, a screenshot of their job posting, a slide from their latest investor deck. Reference one thing that connects to your value prop.

40–80 sec: "Here's why I think we should talk: [SPECIFIC HYPOTHESIS]. I could be totally wrong — but if I'm 60% right, it's worth a 15-minute call."

80–90 sec: "Hit reply with a thumbs up or a thumbs down — I'll respect either."`,
        note: 'Embed the Loom link in an email. Subject: "90 seconds for [FIRST NAME]"',
      },
      {
        day: 18, channel: 'email', type: 'Follow-up to video',
        subject: 'Re: 90 seconds for [FIRST NAME]',
        body: `[FIRST NAME] — following up on the video I sent last week.

Curious whether the hypothesis I laid out resonated or whether I'm off-base. Either answer is genuinely useful.

Worth 15 minutes to find out which one?

[YOUR NAME]`,
      },
      {
        day: 21, channel: 'phone', type: 'Direct dial (they know who you are)',
        body: `CALL SCRIPT (they've seen 4 touches — they know your name):
Hi [FIRST NAME], it's [YOUR NAME] from [YOUR COMPANY]. You may or may not have seen my emails and the video over the last few weeks. I'm not going to surprise you with a pitch — I called because I think there's a specific reason we should talk, and I'd rather give you 30 seconds on it than another email. Got 30 seconds?

[Wait for yes]

[SPECIFIC HYPOTHESIS ABOUT THEIR BUSINESS IN 2 SENTENCES]. If I'm wrong about that, I'll back off for the rest of the year and you've lost a minute. If I'm right, it's worth a real conversation. Worth scheduling 20 minutes next week to find out which one it is?`,
      },
      {
        day: 25, channel: 'linkedin', type: 'DM — genuine check-in',
        body: `Hey [FIRST NAME] — called you a few days ago, no luck catching you. Not going to leave another voicemail. If the timing's genuinely wrong, just tell me and I'll step back. If there's something in what I've sent that's worth 15 minutes, happy to work around your calendar.`,
      },
      {
        day: 28, channel: 'email', type: 'Synthesis email',
        subject: 'what I think I know about [COMPANY]',
        body: `[FIRST NAME] — last substantive note from me.

Over the last 5 weeks I've put together a working theory about [COMPANY] from your earnings call, the careers page, [SPECIFIC SOURCE], and conversations with [PEER COMPANY 1] and [PEER COMPANY 2]:

[PARAGRAPH 1: What they're trying to build]

[PARAGRAPH 2: What's likely getting in the way]

[PARAGRAPH 3: Where you think you fit]

I might be wildly off. But this is the level of work I'd put in if you became a customer. Want to find out if I'm right?

[YOUR NAME]`,
        note: 'This email takes 2–3 hours to write. Do not shortcut it.',
      },
      {
        day: 35, channel: 'email', type: 'Open-door close',
        subject: 'stepping back',
        body: `[FIRST NAME] — stepping out of your inbox.

If the synthesis I sent last week landed wrong or just not at the right time, that's fair. The door is open whenever you want it to be — just reply to that thread and I'll pick straight back up where we left off.

Best of luck this quarter.

[YOUR NAME]`,
      },
    ],
  },
]

const GOLDEN_RULES = [
  { num: '01', rule: 'Subject lines under 5 words.', detail: 'Lowercase outperforms Title Case — they look human, not marketed.' },
  { num: '02', rule: 'First emails under 75 words.', detail: 'Every word over 75 reduces reply rate.' },
  { num: '03', rule: 'One CTA per touch.', detail: 'Two CTAs equals zero CTAs.' },
  { num: '04', rule: 'Mobile preview every email.', detail: '70% of B2B email opens are on phones.' },
  { num: '05', rule: 'Multi-channel beats single channel by 3×.', detail: 'Never run an email-only sequence.' },
]

const CHANNEL_CONFIG: Record<Channel, { label: string; color: string; bg: string }> = {
  email:    { label: 'Email',    color: 'text-indigo-300', bg: 'bg-indigo-500/15 border-indigo-500/30' },
  linkedin: { label: 'LinkedIn', color: 'text-sky-300',    bg: 'bg-sky-500/15 border-sky-500/30' },
  phone:    { label: 'Phone',    color: 'text-emerald-300', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  video:    { label: 'Video',    color: 'text-amber-300',  bg: 'bg-amber-500/15 border-amber-500/30' },
  note:     { label: 'Note',     color: 'text-slate-300',  bg: 'bg-slate-500/15 border-slate-500/30' },
}

// ── Component ─────────────────────────────────────────────────────────────

export default function OutreachPage() {
  const [activeSeq, setActiveSeq] = useState(0)
  const [rulesOpen, setRulesOpen] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [copiedHtml, setCopiedHtml] = useState<string | null>(null)
  const seq = SEQUENCES[activeSeq]

  function copyTouch(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

function buildEmailHtml(touch: Touch): string {
    const bodyHtml = touch.body
      .split('\n')
      .map(line => line.trim() === ''
        ? '<tr><td style="height:14px;"></td></tr>'
        : `<tr><td style="font-size:15px;line-height:1.6;color:#1F2937;font-family:Arial,Helvetica,sans-serif;">${line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td></tr>`
      )
      .join('\n')

    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr><td style="background:#0A0F1E;border-radius:10px 10px 0 0;padding:22px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="vertical-align:middle;">
        <a href="https://webf5.com.au" style="font-size:20px;font-weight:700;color:#6366F1;letter-spacing:-0.5px;font-family:Arial,Helvetica,sans-serif;text-decoration:none;">Web F5</a>
        <span style="font-size:10px;color:#F5A623;text-transform:uppercase;letter-spacing:1.5px;margin-left:10px;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;">Professional Web Development Services</span>
      </td>
      <td align="right" style="vertical-align:middle;">
        <a href="https://webf5.com.au"><img src="https://webf5.com.au/apple-touch-icon.png" width="48" height="48" alt="Web F5" style="border-radius:50%;display:block;border:0;"></a>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="background:#6366F1;height:2px;"></td></tr>

  <!-- Body -->
  <tr><td style="padding:32px 32px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${bodyHtml}
    </table>
  </td></tr>

  <!-- Signature divider -->
  <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"></td></tr>

  <!-- Signature -->
  <tr><td style="padding:20px 32px 24px;">
    <table cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding-right:16px;border-right:3px solid #6366F1;vertical-align:top;white-space:nowrap;">
          <a href="https://webf5.com.au" style="font-size:19px;font-weight:700;color:#6366F1;letter-spacing:-0.5px;line-height:1.2;font-family:Arial,Helvetica,sans-serif;text-decoration:none;display:block;">Web F5</a>
          <div style="font-size:9px;color:#F5A623;text-transform:uppercase;letter-spacing:1.2px;margin-top:5px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Professional<br>Web Development<br>Agency</div>
          <a href="https://webf5.com.au"><img src="https://webf5.com.au/images/Web-F5-logo-bw.png" width="48" height="48" alt="Web F5" style="display:block;margin-top:10px;border:0;border-radius:50%;"></a>
        </td>
        <td style="padding-left:16px;vertical-align:top;">
          <div style="font-size:14px;font-weight:700;color:#111827;font-family:Arial,Helvetica,sans-serif;">Josh Ekberg</div>
          <div style="font-size:12px;color:#6366F1;margin-bottom:6px;font-family:Arial,Helvetica,sans-serif;">Account Executive</div>
          <div style="font-size:12px;color:#4B5563;line-height:1.8;font-family:Arial,Helvetica,sans-serif;">
            <a href="tel:0419510206" style="color:#4B5563;text-decoration:none;">0419 510 206</a><br>
            <a href="mailto:contact@webf5.au" style="color:#6366F1;text-decoration:none;">contact@webf5.au</a><br>
            <a href="https://webf5.com.au" style="color:#6366F1;text-decoration:none;">webf5.com.au</a><br>
            <a href="https://linkedin.com/in/joshua-ekberg-b148a094" style="color:#6366F1;text-decoration:none;">LinkedIn</a><br>
            <span style="color:#6B7280;">Belmont, VIC, Australia</span>
          </div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f9fafb;border-radius:0 0 10px 10px;padding:14px 32px;border-top:1px solid #e5e7eb;">
    <p style="font-size:11px;color:#9CA3AF;margin:0;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Web F5 &#183; Belmont VIC 3216 &#183; ABN&#160;23&#160;626&#160;640&#160;650<br>
    You're receiving this because we think we could help your business. <a href="#" style="color:#9CA3AF;">Unsubscribe</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
  }

  function copyHtmlTouch(touch: Touch, id: string) {
    navigator.clipboard.writeText(buildEmailHtml(touch)).then(() => {
      setCopiedHtml(id)
      setTimeout(() => setCopiedHtml(null), 2000)
    })
  }

  // Highlight [PLACEHOLDERS] in text
  function renderBody(text: string) {
    const parts = text.split(/(\[[^\]]+\])/g)
    return parts.map((part, i) =>
      part.startsWith('[') && part.endsWith(']')
        ? <span key={i} className="bg-amber-500/20 text-amber-300 rounded px-0.5 font-medium">{part}</span>
        : <span key={i}>{part}</span>
    )
  }

  return (
    <div className="text-white px-4 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Outreach Sequences</h1>
          <p className="text-slate-400 text-sm mt-1">
            8 plug-and-play cadences from the Double Triple course · email, LinkedIn, phone, voicemail, and A/B variants
          </p>
        </div>

        {/* Golden Rules */}
        <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => setRulesOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-white/5 transition-colors"
          >
            <span className="text-sm font-semibold text-amber-300 flex items-center gap-2">
              <span>⚡</span> Golden Rules Before You Send Anything
            </span>
            <span className="text-slate-500 text-xs">{rulesOpen ? '▲ collapse' : '▼ expand'}</span>
          </button>
          {rulesOpen && (
            <div className="px-5 pb-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-white/10 pt-4">
              {GOLDEN_RULES.map(r => (
                <div key={r.num} className="flex gap-3">
                  <span className="text-amber-500/60 font-mono text-xs mt-0.5 shrink-0">{r.num}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{r.rule}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{r.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main layout */}
        <div className="grid lg:grid-cols-[260px_1fr] gap-5 items-start">

          {/* Sequence list */}
          <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Sequences
            </div>
            {SEQUENCES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveSeq(i)}
                className={`w-full text-left px-4 py-3.5 border-b border-white/5 last:border-0 transition-colors ${
                  i === activeSeq
                    ? 'bg-indigo-500/20 border-l-2 border-l-indigo-500'
                    : 'hover:bg-white/5 border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500 w-5 shrink-0">{s.id}</span>
                  <span className={`text-sm font-medium ${i === activeSeq ? 'text-white' : 'text-slate-300'}`}>
                    {s.name}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 ml-7 leading-tight">{s.tagline}</p>
              </button>
            ))}
          </div>

          {/* Sequence detail */}
          <div className="space-y-4">

            {/* Sequence header */}
            <div className="bg-[#111827] border border-white/10 rounded-xl px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-slate-500">SEQ {seq.id}</span>
                    <h2 className="text-xl font-bold">{seq.name}</h2>
                  </div>
                  <p className="text-sm text-indigo-300 mb-3">{seq.tagline}</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{seq.when}</p>
                </div>
              </div>
              {seq.tip && (
                <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                  <p className="text-xs text-amber-200 leading-relaxed">
                    <span className="font-semibold">Pro tip: </span>{seq.tip}
                  </p>
                </div>
              )}
            </div>

            {/* Touches */}
            {seq.touches.map((touch, ti) => {
              const ch = CHANNEL_CONFIG[touch.channel]
              const touchId = `${seq.id}-${ti}`
              const isCopied = copied === touchId
              return (
                <div key={ti} className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
                  {/* Touch header */}
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                        Day {touch.day === 0 ? '1' : touch.day}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ch.bg} ${ch.color}`}>
                        {ch.label}
                      </span>
                      <span className="text-sm font-medium text-white">{touch.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {touch.channel === 'email' && (
                        <button
                          onClick={() => copyHtmlTouch(touch, touchId + '-html')}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                            copiedHtml === touchId + '-html'
                              ? 'bg-indigo-500/30 border-indigo-500/50 text-indigo-200'
                              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:text-indigo-200 hover:border-indigo-500/40'
                          }`}
                        >
                          {copiedHtml === touchId + '-html' ? '✓ HTML' : 'HTML'}
                        </button>
                      )}
                      <button
                        onClick={() => copyTouch(touch.body, touchId)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                          isCopied
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {isCopied ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Subject line */}
                  {touch.subject && (
                    <div className="flex items-baseline gap-3 px-5 py-2.5 border-b border-white/5 bg-white/[0.02]">
                      <span className="text-xs text-slate-500 font-medium w-14 shrink-0">Subject</span>
                      <span className="text-sm font-mono text-slate-200">{renderBody(touch.subject)}</span>
                    </div>
                  )}

                  {/* Body */}
                  <div className="px-5 py-4">
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {renderBody(touch.body)}
                    </pre>
                  </div>

                  {/* Note */}
                  {touch.note && (
                    <div className="px-5 pb-4">
                      <p className="text-xs text-slate-500 border-t border-white/5 pt-3 leading-relaxed">
                        <span className="text-slate-400 font-medium">Note: </span>{touch.note}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}

          </div>
        </div>

        {/* Decision matrix */}
        <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <h3 className="font-semibold">Picking the Right Sequence</h3>
            <p className="text-sm text-slate-400 mt-1">Match prospect situation to sequence. Most reps run one sequence on everyone — top reps don't.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Situation</th>
                  <th className="px-5 py-3 text-left">Use</th>
                  <th className="px-5 py-3 text-left">Why</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ['Cold mid-market AE / manager level', 'Sequence 1 — The Workhorse', 'Default cadence, mixes channels, 17 days of coverage'],
                  ['Account had funding, hire, or news event', 'Sequence 2 — Trigger-Event Sprint', 'Speed matters; 8-day window of relevance'],
                  ['CXO or VP-level cold prospect', 'Sequence 3 — Executive Patience Play', 'Slower, more substantive; respects their time'],
                  ['Inbound signal (download, trial, webinar)', 'Sequence 4 — Inbound Accelerator', 'Speed-to-lead matters more than anything else'],
                  ['Active deal that needs more stakeholders', 'Sequence 5 — Multithread', '3-lane parallel cadence across the buying committee'],
                  ['Closed-lost deal from 6+ months ago', 'Sequence 6 — Resurrection', 'Warmest "cold" list you have; new context likely'],
                  ['Any sequence running for 30+ days', 'Sequence 7 — A/B Test', 'Ongoing optimisation, not a one-off'],
                  ['Top 5–10 strategic accounts of the year', 'Sequence 8 — The Sniper', 'Hand-crafted; the deal would change your year'],
                ].map(([sit, use, why]) => (
                  <tr key={sit} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-3 text-slate-300">{sit}</td>
                    <td className="px-5 py-3 text-indigo-300 font-medium">{use}</td>
                    <td className="px-5 py-3 text-slate-400">{why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 48-hour action */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-6 py-5">
          <h3 className="font-semibold text-indigo-200 mb-2">Your 48-Hour Action</h3>
          <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
            <li>Pick one sequence — start with The Workhorse if unsure.</li>
            <li>Replace every <span className="bg-amber-500/20 text-amber-300 rounded px-1 font-mono text-xs">[PLACEHOLDER]</span> with your own customer stories, your value prop, your CTA.</li>
            <li>Read every email out loud. If you'd be embarrassed to say a line out loud, rewrite it.</li>
            <li>Load 25 prospects from your target list and turn it on.</li>
            <li>Track reply rate and meeting booked rate for two weeks. Bring the numbers to your next review.</li>
          </ol>
        </div>

      </div>
    </div>
  )
}
