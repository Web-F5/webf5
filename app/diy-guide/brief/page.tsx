import dynamic from 'next/dynamic'

const DiyWizard = dynamic(() => import('@/components/diy-wizard/DiyWizard'), { ssr: false })

export const metadata = {
  title: 'DIY Brief — Build Your Trade Website',
  description: 'Complete your website brief and get a personalised Claude prompt to build your site this weekend.',
}

export default function DiyBriefPage() {
  return (
    <main className="min-h-screen bg-[#090B14] py-16 px-4">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-400 mb-2">DIY Guide</p>
          <h1 className="text-3xl font-bold text-white mb-3">
            Let&apos;s build your brief
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Answer a few questions and we&apos;ll generate a personalised Claude prompt
            so you can build your site in a weekend.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
          <DiyWizard />
        </div>
      </div>
    </main>
  )
}
