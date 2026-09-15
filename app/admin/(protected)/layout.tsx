import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminNav } from './AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  const secret = process.env.ADMIN_SECRET

  if (!secret || session !== secret) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      <AdminNav />
      {children}
    </div>
  )
}
