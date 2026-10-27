'use client'

import dynamic from 'next/dynamic'

const DiyWizard = dynamic(() => import('@/components/diy-wizard/DiyWizard'), { ssr: false })

export default function DiyWizardLoader() {
  return <DiyWizard />
}
