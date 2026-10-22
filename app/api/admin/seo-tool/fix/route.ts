import { NextRequest, NextResponse } from 'next/server'
import { db, appSettings } from '@/lib/db'

async function getToken(): Promise<string | null> {
  const rows = await db.select().from(appSettings)
  for (const r of rows) {
    if (r.key === 'github_token') return r.value
  }
  return null
}

async function getRepoUrl(): Promise<string | null> {
  const rows = await db.select().from(appSettings)
  for (const r of rows) {
    if (r.key === 'github_repo') return r.value
  }
  return null
}

function parseOwnerRepo(repoUrl: string) {
  const m = repoUrl.match(/github\.com\/([^/\s]+)\/([^/\s]+?)(?:\.git)?$/)
    ?? repoUrl.match(/^([^/\s]+)\/([^/\s]+)$/)
  if (!m) return null
  return { owner: m[1], repo: m[2] }
}

export async function POST(req: NextRequest) {
  try {
    const { path, newContent, sha, commitMessage } = await req.json() as {
      path: string
      newContent: string
      sha: string
      commitMessage: string
    }

    if (!path || !newContent || !sha) {
      return NextResponse.json({ error: 'path, newContent and sha required' }, { status: 400 })
    }

    const token   = await getToken()
    const repoUrl = await getRepoUrl()

    if (!token || !repoUrl) {
      return NextResponse.json({ error: 'GitHub token or repo not configured in Settings.' }, { status: 400 })
    }

    const parsed = parseOwnerRepo(repoUrl)
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid repo URL in Settings.' }, { status: 400 })
    }

    const { owner, repo } = parsed
    const encoded = Buffer.from(newContent, 'utf-8').toString('base64')

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: commitMessage || `seo: fix ${path}`,
          content: encoded,
          sha,
        }),
      },
    )

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `GitHub error: ${text}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({
      success: true,
      commit: (data.commit as { sha: string; html_url: string } | undefined)?.sha,
      url:    (data.commit as { sha: string; html_url: string } | undefined)?.html_url,
    })
  } catch (err) {
    console.error('SEO fix error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
