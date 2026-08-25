'use client'

import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs'

export function BriefAuthButton() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return null

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 hidden sm:block">Signed in</span>
        <UserButton />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <SignInButton mode="modal">
        <button className="text-sm text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500">
          Sign in
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors">
          Create account
        </button>
      </SignUpButton>
    </div>
  )
}
