import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { db, courseEntitlements } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export default async function GbpBundleSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { session_id } = await searchParams

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id)
      const courseId = session.metadata?.courseId
      const sessionUserId = session.metadata?.userId

      if (
        session.payment_status === 'paid' &&
        courseId &&
        sessionUserId === userId
      ) {
        await db.insert(courseEntitlements).values({
          userId,
          courseId,
          stripePaymentId: session.payment_intent as string ?? session.id,
        }).onConflictDoNothing()
      }
    } catch {
      // Non-fatal: webhook may already have written the row
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="text-5xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Thank you for your payment - you&apos;re in!</h1>
        <p className="text-foreground/60 mb-2">
          Both guides are ready right now.
        </p>
        <p className="text-foreground/40 text-sm mb-8">
          A receipt has been sent to your email. You can return to the guides any time by signing in.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/guides/gbp-setup/content"
            className="inline-block bg-primary text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-colors text-base"
          >
            Start with Guide 1 - Set Up Your GBP →
          </Link>
          <Link
            href="/guides/gbp-optimise/content"
            className="inline-block border border-border text-foreground/80 font-semibold px-8 py-3.5 rounded-xl hover:border-primary/40 transition-colors text-base"
          >
            Jump to Guide 2 - Optimise Your GBP →
          </Link>
        </div>
      </div>
    </main>
  )
}
