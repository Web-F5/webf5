import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllPosts, getPostBySlug } from '@/lib/blog'

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://webf5.com.au/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://webf5.com.au/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'Web F5', url: 'https://webf5.com.au' },
    publisher: { '@type': 'Organization', name: 'Web F5', url: 'https://webf5.com.au' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/blog" className="text-sm text-foreground/50 hover:text-foreground transition-colors mb-8 inline-block">
            ← All articles
          </Link>

          <time className="text-sm text-foreground/40 block mb-4">
            {new Date(post.date).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight text-balance">
            {post.title}
          </h1>

          <article
            className="prose-blog"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-16 border border-primary/20 rounded-2xl p-6 bg-primary/5">
            <p className="text-sm text-foreground/60 mb-1">Ready to fix your site?</p>
            <p className="font-semibold mb-4">Web F5 builds custom websites for Victorian tradies and local businesses — fixed price, no lock-in.</p>
            <Link
              href="/contact"
              className="inline-block bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Get in touch →
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
