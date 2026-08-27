import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db, briefDrafts } from '@/lib/db'
import { eq } from 'drizzle-orm'

async function verifyAdmin() {
  const jar = await cookies()
  return jar.get('admin_session')?.value === process.env.ADMIN_SECRET
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await db.delete(briefDrafts).where(eq(briefDrafts.id, id))
  return NextResponse.json({ ok: true })
}
