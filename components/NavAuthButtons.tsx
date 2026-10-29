'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import dynamic from 'next/dynamic'

const BriefAuthButton = dynamic(
  () => import('@/components/BriefAuthButton').then(m => m.BriefAuthButton),
  { ssr: false }
)

export function NavAuthButtons({ isBrief }: { isBrief: boolean }) {
  const { user, isLoaded } = useUser()
  const { signOut, openSignIn } = useClerk()

  if (!isLoaded) {
    return isBrief ? (
      <BriefAuthButton />
    ) : (
      <a href="/brief" className="px-6 py-2 bg-indigo-700 text-white rounded-full text-sm font-semibold hover:bg-indigo-600 hover:shadow-lg hover:shadow-primary/50 transition-all">
        Get Started
      </a>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-400 max-w-[140px] truncate">{user.primaryEmailAddress?.emailAddress}</span>
        <button
          onClick={() => signOut({ redirectUrl: '/' })}
          className="px-4 py-2 border border-white/20 text-white rounded-full text-sm font-semibold hover:border-white/40 transition-all"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => openSignIn()}
        className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
      >
        Sign in
      </button>
      {isBrief ? (
        <BriefAuthButton />
      ) : (
        <a href="/brief" className="px-6 py-2 bg-indigo-700 text-white rounded-full text-sm font-semibold hover:bg-indigo-600 hover:shadow-lg hover:shadow-primary/50 transition-all">
          Get Started
        </a>
      )}
    </div>
  )
}

export function NavAuthButtonsMobile({ closeMobile }: { closeMobile: () => void }) {
  const { user, isLoaded } = useUser()
  const { signOut, openSignIn } = useClerk()

  if (!isLoaded) {
    return (
      <a href="/brief" className="block w-full mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold text-center" onClick={closeMobile}>
        Get Started
      </a>
    )
  }

  if (user) {
    return (
      <div className="border-t border-border/50 pt-3 flex flex-col gap-2">
        <p className="text-xs text-slate-400 truncate">{user.primaryEmailAddress?.emailAddress}</p>
        <button
          onClick={() => { signOut({ redirectUrl: '/' }); closeMobile() }}
          className="block w-full px-6 py-2 border border-white/20 text-white rounded-full text-sm font-semibold text-center"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="border-t border-border/50 pt-3 flex flex-col gap-2">
      <button
        onClick={() => { openSignIn(); closeMobile() }}
        className="block w-full px-6 py-2 border border-white/20 text-white rounded-full text-sm font-semibold text-center"
      >
        Sign in
      </button>
      <a href="/brief" className="block w-full px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold text-center" onClick={closeMobile}>
        Get Started
      </a>
    </div>
  )
}
