// Full sequence data used by CRM (dropdown + scheduling) and calendar (expandable script)

export interface FullTouch {
  day:      number
  channel:  'email' | 'linkedin' | 'phone' | 'video' | 'note'
  name:     string
  subject?: string
  body:     string
  note?:    string
}

export interface FullSequence {
  name:    string
  tagline: string
  touches: FullTouch[]
}

export const FULL_SEQUENCES: FullSequence[] = [
  {
    name:    'The Workhorse',
    tagline: '8 touches - 17 business days - cold mid-market',
    touches: [
      {
        day: 1, channel: 'email', name: 'Opener',
        subject: 'quick idea for [COMPANY]',
        body: `Hi [FIRST NAME],

Saw [TRIGGER] and figured it was worth a note.

We work with teams like [CUSTOMER 1], [CUSTOMER 2] and [CUSTOMER 3] who were running into [SPECIFIC PROBLEM YOUR PRODUCT SOLVES]. After [TIMEFRAME] with us, [CUSTOMER STORY].

Worth 15 minutes next Tue or Wed to compare notes?

[YOUR NAME]`,
      },
      {
        day: 2, channel: 'linkedin', name: 'Connection Request',
        body: `Hi [FIRST NAME] - emailed you yesterday but figured I'd connect here too. We help [SIMILAR ROLE] teams at [SIMILAR COMPANY TYPE] with [PROBLEM]. Open to connecting either way?`,
        note: 'Under 200 characters.',
      },
      {
        day: 4, channel: 'phone', name: 'Call + Voicemail',
        body: `CALL SCRIPT (if they pick up - under 30 seconds):
Hi [FIRST NAME], it's [YOUR NAME] from [COMPANY]. I know this is a cold call - gimme 30 seconds, then you can hang up if it's not relevant?
[Wait for yes]
We're working with [CUSTOMER 1] and [CUSTOMER 2] on [PROBLEM]. Reason I called you specifically - [SPECIFIC TRIGGER ABOUT THEIR COMPANY]. Worth comparing notes for 15 minutes next week?

VOICEMAIL (under 25 seconds):
Hi [FIRST NAME], [YOUR NAME] from [YOUR COMPANY]. Quick one - we just helped [CUSTOMER STORY in 1 line]. Thought it'd be worth comparing notes given [TRIGGER]. I'll send a follow-up email - easier to reply there. Cheers.`,
      },
      {
        day: 6, channel: 'email', name: 'Bump with proof',
        subject: 'Re: quick idea for [COMPANY]',
        body: `[FIRST NAME] - bumping this up.

Quick number that might be relevant: [CUSTOMER STORY with hard metric].

Worth 15 min?

[YOUR NAME]`,
        note: 'Reply to the original thread.',
      },
      {
        day: 9, channel: 'linkedin', name: 'Engagement (no DM)',
        body: `Don't message yet. Engage genuinely with 1-2 of their recent posts:

- Add a thoughtful comment that disagrees politely or extends their argument
- Like their last 2-3 posts so your name shows up in notifications
- Share one of their posts with a one-line endorsement

Goal: become a familiar face before the next outreach.`,
      },
      {
        day: 11, channel: 'phone', name: 'Second call - no voicemail',
        body: `Different time of day than your first call (morning to afternoon or vice versa).

If they answer, run the same 30-second script as Day 4.

Don't leave a voicemail - two voicemails in two weeks reads as desperate. Just hang up and let the missed-call notification do the work.`,
      },
      {
        day: 14, channel: 'email', name: 'Pattern interrupt',
        subject: 'wrong person?',
        body: `[FIRST NAME] - getting the sense I might be barking up the wrong tree here.

If [PROBLEM] isn't on your plate, who would I chat to instead? Or just tell me to buzz off and I'll mark this one closed.

Either way, no hard feelings.

[YOUR NAME]`,
      },
      {
        day: 17, channel: 'email', name: 'Breakup',
        subject: 'closing the loop',
        body: `[FIRST NAME] - last one from me.

Going to close this one out on my end. If [PROBLEM] becomes a priority later, just reply to this thread and I'll pick it up.

Wishing you a great quarter.

[YOUR NAME]`,
        note: 'The breakup email gets the highest reply rate in the sequence - often 2-3x the opener. Never apologise. Just close the loop.',
      },
    ],
  },
  {
    name:    'The Trigger-Event Sprint',
    tagline: '5 touches - 8 business days - funding / hire / news',
    touches: [
      {
        day: 1, channel: 'email', name: 'Trigger opener',
        subject: '[TRIGGER in 3 words] - quick thought',
        body: `Hi [FIRST NAME],

Saw the news about [TRIGGER - e.g., the Series C raise / [NAME] joining as VP / the [COMPETITOR] acquisition]. Congrats / interesting timing.

Reason I'm reaching out: when [SIMILAR COMPANY] went through the same thing last year, the first thing they hit was [SPECIFIC PROBLEM YOUR PRODUCT SOLVES]. We helped them [CUSTOMER STORY in 1 line].

Worth 15 minutes to talk through what we saw, even if you're not buying anything?

[YOUR NAME]`,
        note: 'Send the same day as the trigger event. Window of relevance is 14 days max.',
      },
      {
        day: 1, channel: 'linkedin', name: 'Connection note',
        body: `Hi [FIRST NAME] - saw [TRIGGER]. Reaching out because [SIMILAR COMPANY] hit a specific bottleneck right after the same move. Happy to share what worked. Open to connecting?`,
      },
      {
        day: 3, channel: 'phone', name: 'Call + Voicemail',
        body: `CALL SCRIPT (if they pick up):
Hi [FIRST NAME], [YOUR NAME] from [YOUR COMPANY]. Saw [TRIGGER] - figured this is the moment to call. Reason I'm dialling: when [SIMILAR COMPANY] went through it, the bottleneck was [PROBLEM]. Worth 15 minutes to compare notes?

VOICEMAIL:
Hi [FIRST NAME], [YOUR NAME] here. Saw [TRIGGER] - congrats. Quick one - when [SIMILAR COMPANY] went through it, we helped them [CUSTOMER STORY]. Sending a follow-up email now. Cheers.`,
      },
      {
        day: 5, channel: 'email', name: 'Customer mirror',
        subject: 'what [SIMILAR COMPANY] did',
        body: `[FIRST NAME] - quick story.

When [SIMILAR COMPANY] [HAD THE SAME TRIGGER] last year, here's exactly what happened:

- Month 1: [PROBLEM EMERGED]
- Month 3: [DECIDED TO ACT]
- Month 6: [OUTCOME WITH METRIC - e.g., 40% faster onboarding, $400K saved, 2 weeks earlier go-live]

Not saying you'll hit the same beats. But the timing of [TRIGGER] is when most teams either get ahead of this or fall behind on it.

15 mins next week?

[YOUR NAME]`,
      },
      {
        day: 8, channel: 'email', name: 'Soft close',
        subject: 'your call',
        body: `[FIRST NAME] - not going to keep emailing.

If the timing's wrong I get it. If [TRIGGER] gets you thinking about [PROBLEM] in the next few weeks, just reply to this thread.

[YOUR NAME]`,
      },
    ],
  },
  {
    name:    'The Executive Patience Play',
    tagline: '5 touches - 4 weeks - CXO / VP level',
    touches: [
      {
        day: 1, channel: 'email', name: 'Insight opener',
        subject: 'an observation about [THEIR INDUSTRY]',
        body: `[FIRST NAME],

We're seeing something across [THEIR INDUSTRY/SEGMENT] right now that's worth flagging.

[SPECIFIC INSIGHT - e.g., "CFOs at Series C SaaS companies are pulling forward their FP&A automation projects by 6-9 months because of the rate environment"].

Most people we talk to are surprised when they see the data. I'm not pitching - happy to send the full breakdown if useful, no strings.

[YOUR NAME]
[YOUR COMPANY]`,
        note: 'Under 100 words, but more substantive than the Workhorse opener.',
      },
      {
        day: 7, channel: 'linkedin', name: 'Connection note',
        body: `Hi [FIRST NAME] - emailed you last week about [INSIGHT TOPIC]. No pressure to reply - just figured we should be connected given how much overlap there is. [Optional: "Your post on [TOPIC] last week was sharp."]`,
      },
      {
        day: 14, channel: 'email', name: 'Peer name-drop',
        subject: '[PEER 1], [PEER 2], [PEER 3]',
        body: `[FIRST NAME],

Sending this one because I noticed [PEER 1] at [SIMILAR COMPANY 1], [PEER 2] at [SIMILAR COMPANY 2], and [PEER 3] at [SIMILAR COMPANY 3] are all working with us on [SPECIFIC PROBLEM].

Three peers in the same role at the same stage of company is a pattern worth a 20-minute conversation.

Happy to send what we did with each of them first if you'd rather scan than meet.

[YOUR NAME]`,
        note: 'Executives buy on social proof more than any other buyer category. Three named peers at peer-level companies is the highest-converting hook for CXO outreach.',
      },
      {
        day: 21, channel: 'phone', name: 'Call (often EA)',
        body: `IF AN EA PICKS UP:
Hi, this is [YOUR NAME] from [YOUR COMPANY]. I've been emailing [FIRST NAME] over the past few weeks about [TOPIC]. I know they're slammed - could you let me know the best way to get 15 minutes on their calendar, or who I should be coordinating with?

VOICEMAIL (if direct line):
Hi [FIRST NAME], [YOUR NAME] from [YOUR COMPANY]. Quick voicemail. I've sent a couple of emails over the past few weeks - happy to wait for the right time. If [TOPIC] is genuinely on the priority list this quarter, just reply to my last email and I'll work around your calendar.`,
      },
      {
        day: 28, channel: 'email', name: 'Tailored research piece',
        subject: 'two pages on [SPECIFIC TOPIC] for [COMPANY]',
        body: `[FIRST NAME],

Spent a couple of hours putting together a 2-page brief specifically on [SPECIFIC TOPIC] for [COMPANY]. Three observations:

1. [SPECIFIC INSIGHT 1 - referencing public data about their company]
2. [SPECIFIC INSIGHT 2 - connecting to their industry]
3. [SPECIFIC INSIGHT 3 - implication for their role]

Attaching the full brief. Not asking for a meeting - if anything in there sparks a conversation, just reply.

[YOUR NAME]`,
        note: 'Attach a real 2-page PDF. This touch takes 2-3 hours. Not asking for anything. The effort IS the message.',
      },
    ],
  },
  {
    name:    'The Inbound Accelerator',
    tagline: '5 touches - 8 days - after a signal',
    touches: [
      {
        day: 1, channel: 'email', name: 'Signal acknowledgement',
        subject: 'saw you grabbed [CONTENT/TRIAL]',
        body: `Hi [FIRST NAME],

Saw you [SPECIFIC SIGNAL - e.g., downloaded our buyer's guide / signed up for the trial / registered for the webinar].

Most people who [DID THE SAME THING] are usually wrestling with one of three problems: [PROBLEM A], [PROBLEM B], or [PROBLEM C]. Which one's closest for you?

Happy to skip the demo and just answer the actual question if it's easier.

[YOUR NAME]`,
        note: 'Send within 5 minutes of the signal.',
      },
      {
        day: 1, channel: 'phone', name: 'Speed-to-lead call',
        body: `CALL SCRIPT (within 1 hour of signal):
Hi [FIRST NAME] - [YOUR NAME] from [YOUR COMPANY]. Saw you [DID SIGNAL] in the last hour, figured I'd just call rather than play email tag. Got 2 minutes to tell me what you're trying to figure out, and I can either help directly or save us both time?

VOICEMAIL:
Hi [FIRST NAME], [YOUR NAME] from [YOUR COMPANY]. Saw you [DID SIGNAL]. Just emailed you with three common questions - easier to reply there. If one matches, I'll have you a real answer in an hour. Cheers.`,
      },
      {
        day: 2, channel: 'linkedin', name: 'Connection note',
        body: `Hi [FIRST NAME] - saw you [DID SIGNAL] yesterday. Sent an email already. Adding here in case email isn't your channel. Whatever's easier for you.`,
      },
      {
        day: 4, channel: 'email', name: 'Get to the real question',
        subject: 'honest question',
        body: `[FIRST NAME] - different angle.

Forget the demo for a sec. What's the actual thing you're trying to figure out - like, the question your boss asked you to answer, or the project that landed on your plate?

If you tell me, I can either send you something useful in 5 minutes, or tell you we're not the right fit and free up your inbox.

[YOUR NAME]`,
      },
      {
        day: 8, channel: 'email', name: 'Soft close',
        subject: 'still relevant?',
        body: `[FIRST NAME] - quick check.

Sometimes [SIGNAL - e.g., "the trial" / "the download"] was just casual research. If that's you, no problem at all - I'll close this out.

If it's actually live, just reply with a thumbs up and I'll work around your week.

[YOUR NAME]`,
      },
    ],
  },
  {
    name:    'The Multithread',
    tagline: '3 parallel lanes - active deals or enterprise accounts',
    touches: [
      {
        day: 1, channel: 'email', name: 'Champion lane opener',
        subject: 'your day, faster',
        body: `Hi [FIRST NAME],

Direct one - most [THEIR ROLE] we work with at [SIMILAR COMPANY TYPE] are spending [X HOURS/WEEK] on [SPECIFIC TASK]. After they roll us out, that drops to [Y HOURS/WEEK].

Not pitching, just curious - is that a fair description of how your week looks too?

If yes, worth 15 mins to show you what changed. If not, no harm done.

[YOUR NAME]`,
      },
      {
        day: 1, channel: 'email', name: 'Economic Buyer lane opener',
        subject: '[CUSTOMER 1], [CUSTOMER 2], and [COMPANY]',
        body: `[FIRST NAME],

Two of your peers - [PEER 1] at [CUSTOMER 1] and [PEER 2] at [CUSTOMER 2] - are running [PRODUCT] across their teams.

The number that matters: [METRIC FROM THE EB'S PERSPECTIVE - e.g., "$1.2M of recovered productivity over 12 months at [CUSTOMER 1]"].

Worth 20 minutes to walk through how they got there, even if [COMPANY] isn't ready to move?

[YOUR NAME]`,
      },
      {
        day: 1, channel: 'email', name: 'Technical lane opener',
        subject: 'architecture question',
        body: `Hi [FIRST NAME],

Talking to [CHAMPION NAME] at [COMPANY] about [PRODUCT]. Wanted to loop you in early because the technical questions usually come up before the commercial ones.

Quick context on us: [INTEGRATION/SECURITY DETAILS in 1-2 lines - e.g., "SOC 2 Type II, native [CRM] integration via [METHOD], runs in your VPC"].

Happy to send architecture diagrams or set up 15 mins with our SE - whatever works for how you like to evaluate.

[YOUR NAME]`,
        note: 'Always tell your Champion you\'re reaching out to the technical contact. Frame it as a courtesy to move faster.',
      },
    ],
  },
  {
    name:    'The Resurrection',
    tagline: '4 touches - closed-lost deals 6-18 months ago',
    touches: [
      {
        day: 1, channel: 'email', name: 'Reopen the conversation',
        subject: 'circling back from [LAST CONVERSATION TIMING]',
        body: `[FIRST NAME] - long time.

Last we spoke was around [TIMING - e.g., "March last year"] when [COMPANY] was [REASON FOR THE NO - e.g., "mid-implementation with [COMPETITOR]" / "waiting on a new VP" / "focused on a different priority"].

Just thought to check in - has that situation changed? No agenda either way.

[YOUR NAME]`,
      },
      {
        day: 4, channel: 'linkedin', name: 'Casual DM',
        body: `Hey [FIRST NAME] - hope you're well. Sent you an email a few days ago. Genuinely just a check-in, not a pitch. If now's a wrong time entirely, totally fine - just curious how things are tracking after [LAST PROJECT/SITUATION YOU DISCUSSED].`,
        note: 'You\'re already connected, so this is a DM, not a connection request.',
      },
      {
        day: 8, channel: 'email', name: 'What\'s different now',
        subject: 'a few things changed on our end',
        body: `[FIRST NAME] - for what it's worth.

Three things that are materially different from when we last spoke:

1. [PRODUCT CHANGE - e.g., "We shipped [FEATURE] that closes the gap you raised"]
2. [COMMERCIAL CHANGE - e.g., "Pricing now starts at [X] for teams under [SIZE]"]
3. [PROOF CHANGE - e.g., "[CUSTOMER 1] and [CUSTOMER 2] joined since we last spoke - both your size, both faced [SAME PROBLEM]"]

If any of those changes the answer, happy to grab 15 mins. If not, all good.

[YOUR NAME]`,
      },
      {
        day: 14, channel: 'email', name: 'Open door',
        subject: 'leaving the door open',
        body: `[FIRST NAME] - last note.

Won't keep pinging. Whenever the timing's right, just reply to this thread and I'll pick straight back up.

Wishing [COMPANY] a strong [CURRENT QUARTER].

[YOUR NAME]`,
      },
    ],
  },
  {
    name:    'The A/B Test Sequence',
    tagline: 'Overlay on any sequence - 100+ prospects per variant',
    touches: [
      {
        day: 1, channel: 'note', name: 'How to set up',
        body: `1. Duplicate your sequence and tag it clearly (e.g., "Workhorse - Variant A" / "Workhorse - Variant B")
2. Change ONE thing only between variants. Subject line, opener, or CTA. Never change two things at once.
3. Run for at least 100 prospects per variant before drawing conclusions. Below that, the data is noise.
4. Compare reply rate AND meeting booked rate. Higher replies that don't convert = fool's gold.
5. Adopt the winner. Test the next variable. This is a continuous habit, not a one-off.`,
      },
      {
        day: 1, channel: 'email', name: 'Variant A - Trigger-led opener',
        subject: 'saw the [SERIES C] news',
        body: `Hi [FIRST NAME] - saw the news. Congrats.

Reason I'm reaching out: [SIMILAR COMPANY] hit the same milestone last year and immediately ran into [PROBLEM]. We helped them [CUSTOMER STORY in 1 line].

Worth comparing notes for 15 minutes?

[YOUR NAME]`,
      },
      {
        day: 1, channel: 'email', name: 'Variant B - Insight-led opener',
        subject: 'a pattern at [STAGE] companies',
        body: `Hi [FIRST NAME],

We're seeing a consistent pattern at [STAGE] companies right now - [SPECIFIC INSIGHT, e.g., "the ones that scale through Series C without hitting [PROBLEM] all do one thing differently in the first 90 days post-raise"].

Happy to send the breakdown if useful, no strings.

[YOUR NAME]`,
        note: 'Run both for two weeks across 100+ prospects each. The data will tell you which one your buyers respond to.',
      },
    ],
  },
  {
    name:    'The Sniper',
    tagline: '8 touches - 6 weeks - top 5-10 strategic accounts only',
    touches: [
      {
        day: 1, channel: 'email', name: 'Hand-crafted opener',
        subject: '[SOMETHING SPECIFIC YOU NOTICED]',
        body: `[FIRST NAME],

Spent some time looking at [COMPANY] before reaching out. Three things stood out:

1. [SPECIFIC OBSERVATION 1 - about their product, market, recent news]
2. [SPECIFIC OBSERVATION 2 - about their team or a specific role]
3. [SPECIFIC OBSERVATION 3 - connecting to your value prop]

I'm not going to ask for a meeting yet. I just wanted to land in your inbox so when I do, you'll know I've actually done the work.

More to come.

[YOUR NAME]`,
        note: 'No CTA on this touch. The non-ask is the hook.',
      },
      {
        day: 7, channel: 'linkedin', name: 'Engagement + Connection',
        body: `Engage with 2-3 of their recent posts before sending a connection request.

Connection note: Hi [FIRST NAME] - left a comment on your post about [TOPIC]. Sent you an email last week. Figured we should be connected - I think there's a real reason for [COMPANY] and [YOUR COMPANY] to talk.`,
      },
      {
        day: 10, channel: 'video', name: 'Personalised video (Loom/Vidyard)',
        subject: '90 seconds for [FIRST NAME]',
        body: `VIDEO STRUCTURE (under 90 seconds):

0-10 sec: Wave at camera. Say their name and company. "Hi [FIRST NAME] - quick one for you specifically."

10-40 sec: Share your screen showing something specific to them - their product page, a screenshot of their job posting, a slide from their latest investor deck. Reference one thing that connects to your value prop.

40-80 sec: "Here's why I think we should talk: [SPECIFIC HYPOTHESIS]. I could be totally wrong - but if I'm 60% right, it's worth a 15-minute call."

80-90 sec: "Hit reply with a thumbs up or a thumbs down - I'll respect either."`,
        note: 'Embed the Loom link in an email. Subject: "90 seconds for [FIRST NAME]"',
      },
      {
        day: 18, channel: 'email', name: 'Follow-up to video',
        subject: 'Re: 90 seconds for [FIRST NAME]',
        body: `[FIRST NAME] - following up on the video I sent last week.

Curious whether the hypothesis I laid out resonated or whether I'm off-base. Either answer is genuinely useful.

Worth 15 minutes to find out which one?

[YOUR NAME]`,
      },
      {
        day: 21, channel: 'phone', name: 'Direct dial (they know who you are)',
        body: `CALL SCRIPT (they've seen 4 touches - they know your name):
Hi [FIRST NAME], it's [YOUR NAME] from [YOUR COMPANY]. You may or may not have seen my emails and the video over the last few weeks. I'm not going to surprise you with a pitch - I called because I think there's a specific reason we should talk, and I'd rather give you 30 seconds on it than another email. Got 30 seconds?

[Wait for yes]

[SPECIFIC HYPOTHESIS ABOUT THEIR BUSINESS IN 2 SENTENCES]. If I'm wrong about that, I'll back off for the rest of the year and you've lost a minute. If I'm right, it's worth a real conversation. Worth scheduling 20 minutes next week to find out which one it is?`,
      },
      {
        day: 25, channel: 'linkedin', name: 'DM - genuine check-in',
        body: `Hey [FIRST NAME] - called you a few days ago, no luck catching you. Not going to leave another voicemail. If the timing's genuinely wrong, just tell me and I'll step back. If there's something in what I've sent that's worth 15 minutes, happy to work around your calendar.`,
      },
      {
        day: 28, channel: 'email', name: 'Synthesis email',
        subject: 'what I think I know about [COMPANY]',
        body: `[FIRST NAME] - last substantive note from me.

Over the last 5 weeks I've put together a working theory about [COMPANY] from your earnings call, the careers page, [SPECIFIC SOURCE], and conversations with [PEER COMPANY 1] and [PEER COMPANY 2]:

[PARAGRAPH 1: What they're trying to build]

[PARAGRAPH 2: What's likely getting in the way]

[PARAGRAPH 3: Where you think you fit]

I might be wildly off. But this is the level of work I'd put in if you became a customer. Want to find out if I'm right?

[YOUR NAME]`,
        note: 'This email takes 2-3 hours to write. Do not shortcut it.',
      },
      {
        day: 35, channel: 'email', name: 'Open-door close',
        subject: 'stepping back',
        body: `[FIRST NAME] - stepping out of your inbox.

If the synthesis I sent last week landed wrong or just not at the right time, that's fair. The door is open whenever you want it to be - just reply to that thread and I'll pick straight back up where we left off.

Best of luck this quarter.

[YOUR NAME]`,
      },
    ],
  },
]

export function findTouch(sequenceName: string, touchNumber: number): FullTouch | null {
  const seq = FULL_SEQUENCES.find(s => s.name === sequenceName)
  if (!seq) return null
  return seq.touches[touchNumber - 1] ?? null
}
