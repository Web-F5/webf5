import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface EmailSignature {
  senderName?:  string
  senderTitle?: string
  extraLines?:  string  // newline-separated additional lines
}

export function buildEmailSignatureHtml(sig: EmailSignature | null | undefined): string {
  if (!sig?.senderName && !sig?.senderTitle && !sig?.extraLines) return ''
  const extras = (sig.extraLines ?? '').split('\n').map(l => l.trim()).filter(Boolean)
  return `
      <p style="font-size:14px;color:#64748B;line-height:1.6;margin:28px 0 0;">
        Cheers,<br/>
        ${sig.senderName  ? `<strong style="color:#1E293B;">${sig.senderName}</strong><br/>` : ''}
        ${sig.senderTitle ? `<span>${sig.senderTitle}</span><br/>` : ''}
        ${extras.map(l => `<span>${l}</span><br/>`).join('')}
      </p>`
}
