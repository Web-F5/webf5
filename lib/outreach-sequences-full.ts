// Full sequence data (name, subject, body, note) for each touch
// Used by CRM page (template paste) and calendar (expandable script)

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
]

export function findTouch(sequenceName: string, touchNumber: number): FullTouch | null {
  const seq = FULL_SEQUENCES.find(s => s.name === sequenceName)
  if (!seq) return null
  return seq.touches[touchNumber - 1] ?? null
}
