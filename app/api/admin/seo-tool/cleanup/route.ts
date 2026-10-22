import { NextRequest, NextResponse } from 'next/server'
import { db, appSettings } from '@/lib/db'

async function getToken(): Promise<string | null> {
  const rows = await db.select().from(appSettings)
  for (const r of rows) if (r.key === 'github_token') return r.value
  return null
}

async function ghFetch(path: string, token: string, options?: RequestInit) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`)
  return res.json()
}

// Strip the metadata block the SEO tool injected into use client files
function removeInjectedMetadata(content: string): string | null {
  // Match the block we inject: export const metadata = { ... }\n
  const pattern = /\nexport const metadata = \{\n  title: '[^']*',\n  description: 'TODO:[^']*',\n  openGraph: \{\n    title: '[^']*',\n    description: 'TODO:[^']*',\n  \},\n\}\n/

  if (!pattern.test(content)) return null // nothing to remove
  return content.replace(pattern, '\n')
}

export async function POST(req: NextRequest) {
  try {
    const { repos } = await req.json() as { repos: string[] }

    if (!repos?.length) {
      return NextResponse.json({ error: 'repos array required' }, { status: 400 })
    }

    const token = await getToken()
    if (!token) {
      return NextResponse.json({ error: 'GitHub token not configured in Settings.' }, { status: 400 })
    }

    const results: { repo: string; status: 'fixed' | 'clean' | 'not_found' | 'error'; detail?: string }[] = []

    for (const ownerRepo of repos) {
      const studioPath = 'app/studio/[[...tool]]/page.tsx'

      try {
        let fileData: { content: string; sha: string }
        try {
          fileData = await ghFetch(`/repos/${ownerRepo}/contents/${encodeURIComponent(studioPath)}`, token)
        } catch {
          results.push({ repo: ownerRepo, status: 'not_found' })
          continue
        }

        const original = Buffer.from(fileData.content, 'base64').toString('utf-8')
        const cleaned  = removeInjectedMetadata(original)

        if (!cleaned) {
          results.push({ repo: ownerRepo, status: 'clean' })
          continue
        }

        const encoded = Buffer.from(cleaned, 'utf-8').toString('base64')

        await ghFetch(`/repos/${ownerRepo}/contents/${encodeURIComponent(studioPath)}`, token, {
          method: 'PUT',
          body: JSON.stringify({
            message: 'revert: remove bad metadata export from studio page',
            content: encoded,
            sha: fileData.sha,
          }),
        })

        results.push({ repo: ownerRepo, status: 'fixed' })
      } catch (err) {
        results.push({ repo: ownerRepo, status: 'error', detail: String(err) })
      }
    }

    return NextResponse.json({ results })
  } catch (err) {
    console.error('SEO cleanup error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
