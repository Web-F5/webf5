'use server'

import { db, auditLeads, checklistLeads } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function deleteAuditLead(id: string) {
  await db.delete(auditLeads).where(eq(auditLeads.id, id))
  revalidatePath('/admin/leads')
}

export async function deleteChecklistLead(id: string) {
  await db.delete(checklistLeads).where(eq(checklistLeads.id, id))
  revalidatePath('/admin/leads')
}
