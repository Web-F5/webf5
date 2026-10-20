import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db, crmAccounts, crmContacts } from '@/lib/db'

async function isAdmin(): Promise<boolean> {
  const jar = await cookies()
  return jar.get('admin_session')?.value === process.env.ADMIN_SECRET
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { company, tier, name, title, linkedin, notes, website, phone, address, email } = await req.json()
  if (!company?.trim() || !tier) return NextResponse.json({ error: 'company and tier required' }, { status: 400 })

  // Build account notes from whatever we collected
  const noteParts: string[] = []
  if (address) noteParts.push(`Address: ${address}`)
  if (phone)   noteParts.push(`Phone: ${phone}`)
  if (website) noteParts.push(`Website: ${website}`)
  if (email)   noteParts.push(`Email: ${email}`)
  if (notes)   noteParts.push(notes)

  const [account] = await db.insert(crmAccounts).values({
    name: company.trim(),
    tier: (tier as 'A' | 'B' | 'C'),
    notes: noteParts.join('\n') || null,
    currentStage: 1,
  }).returning()

  // Create a contact if we have a name
  if (name?.trim()) {
    await db.insert(crmContacts).values({
      accountId: account.id,
      name:      name.trim(),
      title:     title?.trim() || null,
      linkedIn:  linkedin?.trim() || null,
      role:      'champion',
    })
  }

  return NextResponse.json({ accountId: account.id, success: true })
}
