import { db, briefDrafts } from '@/lib/db'
import { desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 60)   return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

function stepLabel(step: number, total = 11) {
  return `Step ${step} / ${total}`
}

export default async function AdminBriefsPage() {
  const drafts = await db
    .select()
    .from(briefDrafts)
    .orderBy(desc(briefDrafts.lastActivityAt))
    .limit(200)

  const stats = {
    total: drafts.length,
    inProgress: drafts.filter(d => d.status === 'in_progress').length,
    submitted: drafts.filter(d => d.status !== 'in_progress').length,
    withEmail: drafts.filter(d => d.guestEmail || (d.data as Record<string, unknown>)?.bizEmail).length,
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Brief drafts</h1>
            <p className="text-slate-400 text-sm mt-1">Most recent activity first · last 200 rows</p>
          </div>
          <a
            href="/api/admin/logout"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Sign out
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total drafts', value: stats.total },
            { label: 'In progress', value: stats.inProgress },
            { label: 'Submitted', value: stats.submitted },
            { label: 'Have email', value: stats.withEmail },
          ].map(s => (
            <div key={s.label} className="bg-[#111827] border border-white/10 rounded-xl px-5 py-4">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-slate-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#111827] text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Business</th>
                <th className="px-4 py-3 text-left">Progress</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Follow-up</th>
                <th className="px-4 py-3 text-left">Last active</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-left">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {drafts.map(draft => {
                const data = (draft.data ?? {}) as Record<string, unknown>
                const name    = (data.contactName as string) || '—'
                const email   = draft.guestEmail || (data.bizEmail as string) || '—'
                const phone   = (data.bizPhone as string) || '—'
                const bizName = (data.bizName as string) || '—'
                const isGuest = !draft.userId

                return (
                  <tr key={draft.id} className="bg-[#0d1421] hover:bg-[#111827] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{name}</p>
                      <p className="text-slate-400 text-xs">{email}</p>
                      <p className="text-slate-500 text-xs">{phone}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{bizName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${(draft.currentStep / 11) * 100}%` }}
                          />
                        </div>
                        <span className="text-slate-400 text-xs whitespace-nowrap">
                          {stepLabel(draft.currentStep)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        draft.status === 'in_progress'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-green-500/15 text-green-400'
                      }`}>
                        {draft.status === 'in_progress' ? 'In progress' : 'Submitted'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {draft.consentFollowupEmail
                        ? <span className="text-green-400 text-xs">✓ Opted in</span>
                        : <span className="text-slate-500 text-xs">No</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {timeAgo(new Date(draft.lastActivityAt))}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(draft.createdAt).toLocaleDateString('en-AU', {
                        day: 'numeric', month: 'short', year: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${isGuest ? 'text-slate-500' : 'text-indigo-400'}`}>
                        {isGuest ? 'Guest' : 'Account'}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {drafts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    No drafts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
