import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Web design tips, local SEO advice, and real talk for tradies and small businesses across Central Victoria.',
  alternates: { canonical: 'https://webf5.com.au/blog' },
  openGraph: {
    title: 'Blog | Web F5',
    description: 'Web design tips, local SEO advice, and real talk for tradies and small businesses across Central Victoria.',
    url: 'https://webf5.com.au/blog',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3">Articles</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Web design & local SEO — straight talk for Victorian tradies
          </h1>
          <p className="text-foreground/60 text-lg">
            Practical advice on getting found, getting calls, and building a site that actually works for your business.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <article key={post.slug} className="border border-border rounded-2xl p-6 bg-card/30 hover:border-primary/40 transition-colors">
              <time className="text-sm text-foreground/40 mb-2 block">
                {new Date(post.date).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
              <h2 className="text-xl font-semibold mb-2 leading-snug">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="text-foreground/60 text-sm mb-4 leading-relaxed">{post.description}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="text-primary text-sm font-medium hover:underline"
              >
                Read article →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
