import { db, reviewRatings } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { RatingWidget } from './RatingWidget'

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {children}
      </div>
    </main>
  )
}

function ErrorCard({ message }: { message: string }) {
  return (
    <Shell>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 text-center">
        <div className="text-4xl mb-4">😕</div>
        <h1 className="text-lg font-bold text-slate-800 mb-2">Link not found</h1>
        <p className="text-slate-500 text-sm">{message}</p>
      </div>
    </Shell>
  )
}

function AlreadyRated({ business }: { business: string }) {
  return (
    <Shell>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-lg font-bold text-slate-800 mb-2">Already submitted</h1>
        <p className="text-slate-500 text-sm">
          You've already shared your feedback for {business}. Thanks so much — it means a lot.
        </p>
      </div>
    </Shell>
  )
}

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams

  if (!t) return <ErrorCard message="This review link is invalid or has expired." />

  const [record] = await db
    .select()
    .from(reviewRatings)
    .where(eq(reviewRatings.id, t))
    .limit(1)

  if (!record) return <ErrorCard message="This review link is invalid or has expired." />
  if (record.ratedAt) return <AlreadyRated business={record.fromBusiness} />

  return (
    <Shell>
      <RatingWidget
        token={t}
        recipientName={record.recipientName}
        fromBusiness={record.fromBusiness}
        platform={record.platform}
        reviewUrl={record.reviewUrl}
      />
    </Shell>
  )
}
