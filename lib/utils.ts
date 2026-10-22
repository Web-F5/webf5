import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface EmailSignature {
  senderName?:    string
  senderTitle?:   string
  senderCompany?: string
  senderSlogan?:  string
  senderPhone?:   string
  senderWebsite?: string
}

export function buildEmailSignatureHtml(sig: EmailSignature | null | undefined): string {
  if (!sig) return ''
  const { senderName, senderTitle, senderCompany, senderSlogan, senderPhone, senderWebsite } = sig
  if (!senderName && !senderTitle && !senderCompany && !senderSlogan && !senderPhone && !senderWebsite) return ''

  const websiteHref = senderWebsite
    ? (senderWebsite.startsWith('http') ? senderWebsite : `https://${senderWebsite}`)
    : ''
  const telHref = senderPhone ? `tel:${senderPhone.replace(/\s/g, '')}` : ''

  return `
      <p style="font-size:14px;color:#64748B;line-height:1.9;margin:28px 0 0;">
        <span style="color:#64748B;font-style:italic;">Cheers,</span><br/>
        ${senderName    ? `<strong style="color:#1E293B;font-style:normal;">${senderName}</strong><br/>` : ''}
        ${senderTitle   ? `<span style="color:#6366F1;">${senderTitle}</span><br/>` : ''}
        ${senderCompany ? `<span style="color:#6366F1;">${senderCompany}</span><br/>` : ''}
        ${senderSlogan  ? `<span style="color:#F5A623;font-style:italic;">${senderSlogan}</span><br/>` : ''}
        ${senderPhone   ? `<a href="${telHref}" style="color:#64748B;text-decoration:none;">${senderPhone}</a><br/>` : ''}
        ${websiteHref   ? `<a href="${websiteHref}" style="color:#64748B;text-decoration:none;">${senderWebsite}</a><br/>` : ''}
      </p>`
}
