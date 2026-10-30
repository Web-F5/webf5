import { NextRequest, NextResponse } from 'next/server'
import { db, crmContacts } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get('accountId')
  if (!accountId) return NextResponse.json([])
  const contacts = await db.select().from(crmContacts).where(eq(crmContacts.accountId, accountId))
  return NextResponse.json(contacts)
}

export async function POST(req: NextRequest) {
  const { accountId, name, title, linkedIn, email, phone, role, notes } = await req.json()
  if (!accountId || !name?.trim() || !role) {
    return NextResponse.json({ error: 'accountId, name and role required' }, { status: 400 })
  }
  const [contact] = await db.insert(crmContacts).values({
    accountId,
    name:     name.trim(),
    title:    title?.trim()    || null,
    linkedIn: linkedIn?.trim() || null,
    email:    email?.trim()    || null,
    phone:    phone?.trim()    || null,
    role,
    notes:    notes?.trim()    || null,
  }).returning()
  return NextResponse.json(contact)
}

export async function PATCH(req: NextRequest) {
  const { id, name, title, linkedIn, email, phone, role, notes } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const [contact] = await db.update(crmContacts)
    .set({
      name:     name?.trim()     || undefined,
      title:    title?.trim()    || null,
      linkedIn: linkedIn?.trim() || null,
      email:    email?.trim()    || null,
      phone:    phone?.trim()    || null,
      role:     role              || undefined,
      notes:    notes?.trim()    || null,
    })
    .where(eq(crmContacts.id, id))
    .returning()
  return NextResponse.json(contact)
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await db.delete(crmContacts).where(eq(crmContacts.id, id))
  return NextResponse.json({ ok: true })
}
