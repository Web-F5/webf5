import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DiyGuideSuccessPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="text-5xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">You're in.</h1>
        <p className="text-foreground/60 mb-2">
          Payment confirmed. Your guide is ready right now.
        </p>
        <p className="text-foreground/40 text-sm mb-8">
          A receipt has been sent to your email. You can return to the guide any time by signing in.
        </p>
        <Link
          href="/diy-guide/content"
          className="inline-block bg-primary text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-colors text-base"
        >
          Read the guide →
        </Link>
      </div>
    </main>
  )
}
