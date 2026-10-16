// Re-exports the TRIPLE method seed data for server-side use only.
// The source JSON lives in data/ (not public/) — copyrighted course material.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const seedJson = require('../data/triple-seed.json')

export interface TaskField {
  id:    string
  label: string
}

export interface Task {
  id:     string
  text:   string
  fields: TaskField[]
}

export interface Block {
  type:   'group' | 'gate'
  title:  string
  tasks:  Task[]
  note?:  string
}

export interface Stage {
  n:        number
  name:     string
  job:      string
  blocks:   Block[]
  pitfalls: string[]
}

export interface TripleSeed {
  stages:          Stage[]
  laws:            string[]
  double_rule:     { name: string; text: string }[]
  deal_inspection: string[]
}

export const TRIPLE = seedJson as TripleSeed

export const STAGE_NAMES = ['Target', 'Reach', 'Investigate', 'Prove', 'Lock', 'Expand']

export const STAGE_COLORS: Record<number, string> = {
  1: '#6366F1', // indigo
  2: '#3B82F6', // blue
  3: '#8B5CF6', // violet
  4: '#EC4899', // pink
  5: '#F59E0B', // amber
  6: '#22C55E', // green
}

export const TIER_COLORS: Record<string, string> = {
  A: '#22C55E',
  B: '#F59E0B',
  C: '#64748B',
}

export const ROLE_LABELS: Record<string, string> = {
  economic_buyer: 'Economic Buyer',
  champion:       'Champion',
  user:           'Day-to-day User',
  blocker:        'Likely Blocker',
  coach:          'Coach',
}
