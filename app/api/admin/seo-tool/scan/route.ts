import { NextRequest, NextResponse } from 'next/server'
import { db, appSettings } from '@/lib/db'

export type FindingType =
  | 'missing_metadata'
  | 'missing_title'
  | 'missing_description'
  | 'missing_og'
  | 'missing_alt'
  | 'missing_robots'
  | 'missing_sitemap'

export type Finding = {
  id: string
  file: string
  type: FindingType
  severity: 'error' | 'warning'
  message: string
  fixable: boolean
  fix?: {
    newContent: string
    sha: string
    commitMessage: string
  }
}

async function getSettings() {
  const rows = await db.select().from(appSettings)
  const map: Record<string, string> = {}
  for (const r of rows) map[r.key] = r.value
  return { repo: map.github_repo ?? '', token: map.github_token ?? '' }
}

function parseOwnerRepo(repoUrl: string) {
  const m = repoUrl.match(/github\.com\/([^/\s]+)\/([^/\s]+?)(?:\.git)?$/)
    ?? repoUrl.match(/^([^/\s]+)\/([^/\s]+)$/)
  if (!m) return null
  return { owner: m[1], repo: m[2] }
}

async function ghFetch(path: string, token: string) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`)
  return res.json()
}

function pageNameFromPath(filePath: string): string {
  const seg = filePath.replace(/^app\//, '').replace(/\/page\.tsx$/, '')
  if (!seg || seg === 'page.tsx') return 'Home'
  return seg.split('/').pop()!
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function generateMetadataBlock(pageName: string): string {
  return `\nexport const metadata = {\n  title: '${pageName}',\n  description: 'TODO: Add a description for the ${pageName} page.',\n  openGraph: {\n    title: '${pageName}',\n    description: 'TODO: Add a description for the ${pageName} page.',\n  },\n}\n`
}

function injectMetadata(content: string, pageName: string): string {
  const block = generateMetadataBlock(pageName)
  // Insert after last import line
  const imports = [...content.matchAll(/^import\s.+$/gm)]
  if (imports.length > 0) {
    const last = imports[imports.length - 1]
    const pos = last.index! + last[0].length
    return content.slice(0, pos) + '\n' + block + content.slice(pos)
  }
  return block + content
}

function injectOpenGraph(content: string, pageName: string): string {
  const titleMatch = content.match(/title\s*:\s*[`'"]([^`'"]+)[`'"]/)
  const descMatch  = content.match(/description\s*:\s*[`'"]([^`'"]+)[`'"]/)
  const title = titleMatch?.[1] ?? pageName
  const desc  = descMatch?.[1]  ?? `Learn more about ${pageName}.`

  const ogBlock = `  openGraph: {\n    title: '${title.replace(/'/g, "\\'")}',\n    description: '${desc.replace(/'/g, "\\'")}',\n  },\n`

  // Insert before the last closing } of the metadata export
  const metaMatch = content.match(/(export\s+const\s+metadata[\s\S]*?)\n(\})/m)
  if (metaMatch?.index != null) {
    const insertAt = metaMatch.index + metaMatch[1].length + 1
    return content.slice(0, insertAt) + ogBlock + content.slice(insertAt)
  }
  return content
}

function analyzeFile(content: string, filePath: string, sha: string): Finding[] {
  const findings: Finding[] = []
  const pageName = pageNameFromPath(filePath)

  const hasMetadataExport =
    /export\s+const\s+metadata\s*[=:]/m.test(content) ||
    /export\s+(async\s+)?function\s+generateMetadata\b/m.test(content)

  if (!hasMetadataExport) {
    const fixed = injectMetadata(content, pageName)
    findings.push({
      id: `${filePath}:missing_metadata`,
      file: filePath,
      type: 'missing_metadata',
      severity: 'error',
      message: 'No metadata export. This page has no title or description for search engines.',
      fixable: true,
      fix: {
        newContent: fixed,
        sha,
        commitMessage: `seo: add metadata export to ${filePath}`,
      },
    })
    return findings
  }

  if (!/\btitle\s*:/.test(content)) {
    findings.push({
      id: `${filePath}:missing_title`,
      file: filePath,
      type: 'missing_title',
      severity: 'error',
      message: 'Metadata exists but has no title field.',
      fixable: false,
    })
  }

  if (!/\bdescription\s*:/.test(content)) {
    findings.push({
      id: `${filePath}:missing_description`,
      file: filePath,
      type: 'missing_description',
      severity: 'warning',
      message: 'Metadata exists but has no description field.',
      fixable: false,
    })
  }

  if (!/\bopenGraph\s*:/.test(content)) {
    const fixed = injectOpenGraph(content, pageName)
    findings.push({
      id: `${filePath}:missing_og`,
      file: filePath,
      type: 'missing_og',
      severity: 'warning',
      message: 'No openGraph metadata. Social sharing previews will use browser defaults.',
      fixable: true,
      fix: {
        newContent: fixed,
        sha,
        commitMessage: `seo: add openGraph to metadata in ${filePath}`,
      },
    })
  }

  // Check next/image and plain img tags for missing alt
  // Use [^>]* to stay on one line — multiline tags will be caught by the outer check
  const imgPattern = /<(?:Image|img)\b([^>]*?)(?:\/>|>)/g
  let missing = 0
  for (const m of content.matchAll(imgPattern)) {
    if (!/\balt\s*=/.test(m[1])) missing++
  }
  if (missing > 0) {
    findings.push({
      id: `${filePath}:missing_alt`,
      file: filePath,
      type: 'missing_alt',
      severity: 'warning',
      message: `${missing} image${missing > 1 ? 's' : ''} missing alt text.`,
      fixable: false,
    })
  }

  return findings
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const stored = await getSettings()

    const repoUrl = (body.repoUrl as string | undefined) || stored.repo
    const token   = (body.token   as string | undefined) || stored.token

    if (!repoUrl || !token) {
      return NextResponse.json(
        { error: 'GitHub repo and token required. Add them in Settings.' },
        { status: 400 },
      )
    }

    const parsed = parseOwnerRepo(repoUrl)
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid GitHub repo URL or owner/repo format.' }, { status: 400 })
    }

    const { owner, repo } = parsed

    const tree: { tree: { path: string; type: string; sha: string }[] } =
      await ghFetch(`/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, token)

    const pageFiles = tree.tree.filter(
      f => f.type === 'blob' && /^app\/.*\/page\.tsx$/.test(f.path),
    )

    const hasRobots  = tree.tree.some(f => f.path === 'public/robots.txt')
    const hasSitemap = tree.tree.some(
      f => /^(public\/sitemap\.xml|app\/sitemap\.(ts|js))$/.test(f.path),
    )

    const findings: Finding[] = []

    if (!hasRobots) {
      findings.push({
        id: 'global:missing_robots',
        file: 'public/robots.txt',
        type: 'missing_robots',
        severity: 'warning',
        message: 'No robots.txt in public/. Search engines may crawl unintended paths.',
        fixable: false,
      })
    }

    if (!hasSitemap) {
      findings.push({
        id: 'global:missing_sitemap',
        file: 'app/sitemap.ts',
        type: 'missing_sitemap',
        severity: 'warning',
        message: 'No sitemap found. Create app/sitemap.ts or public/sitemap.xml.',
        fixable: false,
      })
    }

    // Fetch and analyse up to 30 page files
    const toCheck = pageFiles.slice(0, 30)

    const results = await Promise.allSettled(
      toCheck.map(async file => {
        const data = await ghFetch(`/repos/${owner}/${repo}/contents/${file.path}`, token)
        const content = Buffer.from(data.content as string, 'base64').toString('utf-8')
        return analyzeFile(content, file.path, data.sha as string)
      }),
    )

    for (const result of results) {
      if (result.status === 'fulfilled') {
        findings.push(...result.value)
      }
    }

    return NextResponse.json({
      findings,
      stats: {
        files:   pageFiles.length,
        issues:  findings.length,
        fixable: findings.filter(f => f.fixable).length,
      },
      owner,
      repo,
    })
  } catch (err) {
    console.error('SEO scan error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
