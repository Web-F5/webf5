export type TouchChannel = 'email' | 'phone' | 'linkedin' | 'video' | 'note'

export interface SequenceTouch {
  day:     number
  channel: TouchChannel
  name:    string
}

export interface OutreachSequence {
  name:        string
  description: string
  touches:     SequenceTouch[]
}

export const SEQUENCES: OutreachSequence[] = [
  {
    name: 'The Workhorse',
    description: '8 touches · 17 days · cold mid-market',
    touches: [
      { day: 1,  channel: 'email',    name: 'Opener' },
      { day: 2,  channel: 'linkedin', name: 'Connection Request' },
      { day: 4,  channel: 'phone',    name: 'Call + Voicemail' },
      { day: 6,  channel: 'email',    name: 'Bump with Proof' },
      { day: 9,  channel: 'linkedin', name: 'Engagement' },
      { day: 11, channel: 'phone',    name: 'Second Call' },
      { day: 14, channel: 'email',    name: 'Pattern Interrupt' },
      { day: 17, channel: 'email',    name: 'Break-up' },
    ],
  },
  {
    name: 'The Trigger-Event Sprint',
    description: '5 touches · 8 days · warm trigger',
    touches: [
      { day: 1, channel: 'email',    name: 'Trigger Opener' },
      { day: 2, channel: 'linkedin', name: 'Connect' },
      { day: 4, channel: 'email',    name: 'Proof + Ask' },
      { day: 6, channel: 'phone',    name: 'Call' },
      { day: 8, channel: 'email',    name: 'Break-up' },
    ],
  },
  {
    name: 'The Executive Patience Play',
    description: '6 touches · 30 days · C-suite',
    touches: [
      { day: 1,  channel: 'email',    name: 'Executive Opener' },
      { day: 3,  channel: 'linkedin', name: 'Personalised Connect' },
      { day: 7,  channel: 'email',    name: 'Insight Share' },
      { day: 14, channel: 'phone',    name: 'Call' },
      { day: 21, channel: 'email',    name: 'Peer Benchmark' },
      { day: 30, channel: 'email',    name: 'Long-term Break-up' },
    ],
  },
  {
    name: 'The Inbound Accelerator',
    description: '5 touches · 7 days · warm inbound',
    touches: [
      { day: 0, channel: 'email',    name: 'Immediate Follow-up' },
      { day: 1, channel: 'phone',    name: 'Call' },
      { day: 3, channel: 'email',    name: 'Value Follow-up' },
      { day: 5, channel: 'linkedin', name: 'Connect' },
      { day: 7, channel: 'email',    name: 'Break-up' },
    ],
  },
  {
    name: 'The Multithread',
    description: '5 touches · 8 days · champion + economic buyer',
    touches: [
      { day: 1, channel: 'email',    name: 'Champion Opener' },
      { day: 2, channel: 'email',    name: 'EB Opener' },
      { day: 4, channel: 'linkedin', name: 'Connect to Both' },
      { day: 6, channel: 'phone',    name: 'Call Champion' },
      { day: 8, channel: 'email',    name: 'Break-up' },
    ],
  },
  {
    name: 'The Resurrection',
    description: '3 touches · 4 days · re-engage gone cold',
    touches: [
      { day: 1, channel: 'email',    name: 'Re-engage' },
      { day: 2, channel: 'linkedin', name: 'Engagement' },
      { day: 4, channel: 'email',    name: 'Final Close' },
    ],
  },
  {
    name: 'The Sniper',
    description: '1 ultra-personalised email · highly targeted',
    touches: [
      { day: 1, channel: 'email', name: 'Ultra-personalised Opener' },
    ],
  },
]
