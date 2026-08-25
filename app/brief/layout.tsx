import { ClerkProvider } from '@clerk/nextjs'

export default function BriefLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>
}
