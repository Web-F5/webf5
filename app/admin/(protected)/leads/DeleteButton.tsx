'use client'

import { useTransition } from 'react'
import { deleteAuditLead, deleteChecklistLead } from './actions'

export function DeleteAuditLead({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      onClick={() => {
        if (!confirm('Delete this lead?')) return
        startTransition(() => deleteAuditLead(id))
      }}
      disabled={pending}
      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors"
    >
      {pending ? '…' : 'Delete'}
    </button>
  )
}

export function DeleteChecklistLead({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      onClick={() => {
        if (!confirm('Delete this lead?')) return
        startTransition(() => deleteChecklistLead(id))
      }}
      disabled={pending}
      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors"
    >
      {pending ? '…' : 'Delete'}
    </button>
  )
}
