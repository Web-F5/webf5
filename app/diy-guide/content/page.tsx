import CopyPromptButton from './CopyPromptButton'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { courseEntitlements } from '@/lib/db/schema'
import { and, eq, isNull } from 'drizzle-orm'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Build Your Trade Website in a Weekend',
  robots: { index: false },
}

export default async function DiyGuideContentPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=/diy-guide/content')

  const [entitlement] = await db
    .select()
    .from(courseEntitlements)
    .where(and(
      eq(courseEntitlements.userId, userId),
      eq(courseEntitlements.courseId, 'diy-guide'),
      isNull(courseEntitlements.refundedAt),
    ))
    .limit(1)

  if (!entitlement) redirect('/diy-guide')

  return (
    <main className="min-h-screen pt-16 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Guide header */}
        <div className="mb-12 pt-8">
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3">Web F5 · DIY Guide</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight text-balance">
            Build Your Trade Website in a Weekend
          </h1>
          <p className="text-foreground/60 text-base">
            8 modules · 4–6 hours total · No coding experience needed
          </p>
        </div>

        {/* Module nav */}
        <nav className="mb-12 flex flex-wrap gap-2">
          {[
            ['#mod-0', '0 · Before You Start'],
            ['#mod-1', '1 · Your Brief'],
            ['#mod-2', '2 · Set Up Accounts'],
            ['#mod-3', '3 · Build with Claude'],
            ['#mod-4', '4 · Your Domain'],
            ['#mod-5', '5 · Email Routing'],
            ['#mod-6', '6 · Get Found on Google'],
            ['#mod-7', '7 · Go-Live Checklist'],
            ['#mod-8', '8 · After Launch'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="text-xs font-medium bg-card/50 border border-border rounded-lg px-3 py-1.5 text-foreground/60 hover:text-foreground hover:border-primary/30 transition-colors">
              {label}
            </a>
          ))}
        </nav>

        <div className="guide-content">

          {/* MODULE 0 */}
          <section id="mod-0" className="guide-module">
            <ModuleHeader num="00" label="Getting started" title="Before You Start" />
            <p className="guide-intro">Read this first. Five minutes here will save you two hours of confusion later.</p>

            <h3 className="guide-h3">What you'll have when you're done</h3>
            <ul className="guide-list">
              <li>A live website with your business name, services, and contact details</li>
              <li>A real .com.au domain (e.g. smithelectrical.com.au)</li>
              <li>Enquiries from your site forwarded to your existing email inbox</li>
              <li>Your business visible in Google Search and on Google Maps</li>
            </ul>

            <h3 className="guide-h3">What you need</h3>
            <ul className="guide-list">
              <li>A Google account (Gmail is fine, you likely already have one)</li>
              <li>A credit card for the domain (~$25/year for .com.au)</li>
              <li>4–6 hours, ideally spread across a weekend</li>
              <li>A few photos of your work (phone photos are fine)</li>
              <li>2–3 real customer reviews you can quote</li>
            </ul>

            <h3 className="guide-h3">What you don't need</h3>
            <ul className="guide-list">
              <li>Any coding experience</li>
              <li>A developer</li>
              <li>Expensive software or monthly subscriptions</li>
              <li>Technical knowledge of servers, databases, or hosting</li>
            </ul>

            <Callout type="tip" title="How this guide is structured">
              Complete modules in order, as some steps depend on the one before. If you get stuck, jump to the <a href="#stc" className="text-primary underline underline-offset-2">Subject to Change</a> section at the bottom to check whether a third-party service has updated its interface.
            </Callout>
          </section>

          {/* MODULE 1 */}
          <section id="mod-1" className="guide-module">
            <ModuleHeader num="01" label="The foundation" title="Your Brief: The Foundation Everything Else is Built On" />
            <p className="guide-intro">Most DIY sites fail before they're built because there's no brief. You end up with a generic site that says nothing specific. The Web F5 discovery wizard fixes this. It takes 15 minutes and produces a document that drives every decision from here on.</p>

            <Steps items={[
              {
                n: 1,
                title: 'Run the Web F5 discovery wizard',
                body: <>
                  <p>Go to <strong><a href="https://webf5.com.au/brief" target="_blank" rel="noopener" className="text-primary underline underline-offset-2">webf5.com.au/brief</a></strong> and click "Start Your Discovery." The wizard will ask about your business: what you do, where you work, who your best customers are, and what makes you different.</p>
                  <p>Answer specifically. "Bendigo and surrounding towns" is better than "Central Victoria." "Hot water repairs and solar hot water installation" is better than "plumbing."</p>
                </>,
              },
              {
                n: 2,
                title: 'Download your brief',
                body: <>
                  <p>At the end of the wizard, download or copy your brief. Save it somewhere you can find it. You'll paste it into Claude in Module 3.</p>
                  <p>The brief will include: your business name, services, target suburbs, tone of voice, and a suggested site structure.</p>
                </>,
              },
              {
                n: 3,
                title: 'Add your three best customer reviews',
                body: <>
                  <p>Open your brief and add a section at the bottom called "Customer Reviews." Paste in 2–3 real reviews from Google, Facebook, or word-of-mouth. Include the customer's first name and suburb if you have it.</p>
                  <p>These will appear on your site as social proof. They're more convincing than anything you write about yourself.</p>
                </>,
              },
              {
                n: 4,
                title: 'Read the brief back to yourself',
                body: <>
                  <p>Does it sound like you? Does it mention the actual suburbs you work in? Does it say what you do better than the next tradie on Google?</p>
                  <p>If the answer to any of those is no, go back and add more detail. The better your brief, the better your site.</p>
                </>,
              },
            ]} />
          </section>

          {/* MODULE 2 */}
          <section id="mod-2" className="guide-module">
            <ModuleHeader num="02" label="Set these up once" title="Accounts You'll Need" />
            <p className="guide-intro">Five accounts, all free. Set them up before you start building. You'll need all of them by Module 6 at the latest.</p>

            <Steps items={[
              {
                n: 1,
                title: 'Claude account (claude.ai)',
                body: <>
                  <p>Go to <strong>claude.ai</strong> and create a free account. You'll use this to generate your site code in Module 3.</p>
                  <p>The free tier is enough to build your initial site. Claude Pro (~$28 AUD/month) is worth considering if you make lots of changes later. Don't pay for it until you actually need it.</p>
                  <Callout type="warn" title="Subject to change">Claude's free tier limits can change. See the <a href="#stc" className="underline underline-offset-2">Subject to Change</a> section for the latest.</Callout>
                </>,
              },
              {
                n: 2,
                title: 'GitHub account + GitHub Desktop (github.com)',
                body: <>
                  <p>Go to <strong>github.com</strong> and create a free account. GitHub is where your site's code is stored.</p>
                  <p>Then download <strong>GitHub Desktop</strong> from desktop.github.com. It is a simple app that lets you manage your code without using the command line. Think of it as a file manager for your website. Sign into GitHub Desktop with your new account.</p>
                </>,
              },
              {
                n: 3,
                title: 'Vercel account (vercel.com)',
                body: <>
                  <p>Go to <strong>vercel.com</strong> and sign up. Choose "Continue with GitHub" so the two accounts are connected automatically.</p>
                  <p>Vercel takes your code from GitHub and turns it into a live website. When you update your code, Vercel automatically rebuilds the site. The free Hobby plan is enough for a small business site.</p>
                  <Callout type="warn" title="Subject to change">Vercel's free Hobby plan limits are subject to change. See the <a href="#stc" className="underline underline-offset-2">Subject to Change</a> section.</Callout>
                </>,
              },
              {
                n: 4,
                title: 'Cloudflare account (cloudflare.com)',
                body: <>
                  <p>Go to <strong>cloudflare.com</strong> and create a free account. Cloudflare handles two things: connecting your domain to Vercel, and routing emails from your site to your inbox. You don't need to do anything with Cloudflare yet. Just create the account.</p>
                </>,
              },
              {
                n: 5,
                title: 'Formspree account (formspree.io)',
                body: <>
                  <p>Go to <strong>formspree.io</strong> and sign up for a free account. Formspree handles your contact form. It receives submissions from your site and forwards them to your email, without you needing to set up a server.</p>
                  <p>You'll get a form endpoint URL (e.g. <code className="text-xs bg-secondary/50 px-1.5 py-0.5 rounded">https://formspree.io/f/xxxxx</code>) that goes into your site's contact form. Keep it handy for Module 3.</p>
                </>,
              },
            ]} />
          </section>

          {/* MODULE 3 */}
          <section id="mod-3" className="guide-module">
            <ModuleHeader num="03" label="The build" title="Building the Site with Claude" />
            <p className="guide-intro">This is the main event. You're going to paste your brief into a carefully structured prompt, and Claude will write you a complete website. You don't need to understand the code. Just follow the steps to get it into GitHub and live on Vercel.</p>

            <Steps items={[
              {
                n: 1,
                title: 'Open Claude and start a new conversation',
                body: <p>Go to <strong>claude.ai</strong>, sign in, and click "New conversation." Don't type anything yet. You're going to paste a complete prompt in the next step.</p>,
              },
              {
                n: 2,
                title: 'Use the Web F5 prompt template',
                body: <>
                  <p>Copy the prompt below. Replace the two placeholder sections with your actual brief and your Formspree URL from Module 2. Then send it to Claude.</p>
                  <CopyPromptButton />
                  <Callout type="tip" title="What makes this prompt work">
                    The specific instructions about page structure, outcomes vs. features, and schema markup are what separate a generic AI site from one that actually ranks and converts. Don't shorten or simplify the prompt.
                  </Callout>
                </>,
              },
              {
                n: 3,
                title: 'What good output looks like',
                body: <>
                  <p>Claude should return a folder structure followed by the full content of each file — your actual business name, suburb, and phone number used throughout. If it uses generic placeholder text instead, type: <em>"Please redo this using the specific details from my brief: business name, suburbs, services, and reviews."</em></p>
                </>,
              },
              {
                n: 4,
                title: 'Save the files using GitHub Desktop',
                body: <>
                  <p>Open GitHub Desktop. Click <strong>File → New Repository</strong>. Give it a name (e.g. <code className="text-xs bg-secondary/50 px-1.5 py-0.5 rounded">my-trade-website</code>), choose a location on your computer, and click Create Repository.</p>
                  <p>Create the file and folder structure Claude gave you inside that folder on your computer. Copy the code from each Claude code block into its matching file. Save each file.</p>
                  <p>Back in GitHub Desktop, you'll see all the new files listed. Add a summary (e.g. "Initial site build") and click <strong>Commit to main</strong>, then <strong>Publish repository</strong>.</p>
                </>,
              },
              {
                n: 5,
                title: 'Deploy to Vercel',
                body: <>
                  <p>Go to <strong>vercel.com</strong> and sign in. Click <strong>Add New → Project</strong>. You'll see your GitHub repository listed. Click Import.</p>
                  <p>Vercel will detect it's a Next.js project automatically. Leave all settings as they are and click <strong>Deploy</strong>. In about 60 seconds, Vercel will give you a live URL. From this point on, any update pushed to GitHub automatically rebuilds the site.</p>
                </>,
              },
            ]} />
          </section>

          {/* MODULE 4 */}
          <section id="mod-4" className="guide-module">
            <ModuleHeader num="04" label="Your real address on the web" title="Your Domain" />
            <p className="guide-intro">Your site is live on a Vercel URL nobody will remember. This module gives you a real .com.au domain and connects it to your site.</p>

            <Steps items={[
              {
                n: 1,
                title: 'Choose a domain name',
                body: <>
                  <p>Good .com.au domain names follow a simple pattern: <strong>[trade or name] + [suburb or region] + .com.au</strong></p>
                  <ul className="guide-list mt-2">
                    <li>smithelectricalbendigo.com.au</li>
                    <li>bendigoplumbing.com.au</li>
                    <li>castlemainebuilders.com.au</li>
                  </ul>
                  <p>Keep it short. If your first choice is taken, try adding your suburb before choosing a longer alternative.</p>
                </>,
              },
              {
                n: 2,
                title: 'Purchase through Web F5',
                body: <>
                  <p>Go to <strong><a href="https://webf5.au/domain-names/domain-search/" target="_blank" rel="noopener" className="text-primary underline underline-offset-2">webf5.au/domain-names/domain-search/</a></strong> and purchase your chosen domain. Annual cost is approximately $25–$35 for a .com.au domain.</p>
                </>,
              },
              {
                n: 3,
                title: 'Add your domain to Cloudflare',
                body: <>
                  <p>Sign into <strong>cloudflare.com</strong>. Click <strong>Add a Site</strong> and enter your domain name. Choose the Free plan. Cloudflare will show you two nameserver addresses. Copy these.</p>
                  <p>If Web F5 registered your domain, email the nameservers to <strong>contact@webf5.au</strong> and they'll update them for you. Nameserver changes can take up to 24 hours but usually happen within an hour.</p>
                </>,
              },
              {
                n: 4,
                title: 'Add your domain to Vercel',
                body: <>
                  <p>In Vercel, go to your project → <strong>Settings → Domains</strong>. Click Add and type your domain name. Vercel will give you a CNAME or A record to add in Cloudflare DNS. Add it and save. Within a few minutes your real domain will load your site, with SSL handled automatically.</p>
                </>,
              },
            ]} />
          </section>

          {/* MODULE 5 */}
          <section id="mod-5" className="guide-module">
            <ModuleHeader num="05" label="No mail server required" title="Email Routing" />
            <p className="guide-intro">You want enquiries from your site going to your existing Gmail or Outlook inbox. You don't need to set up a separate email server. Cloudflare handles this for free.</p>

            <Steps items={[
              {
                n: 1,
                title: 'Enable Cloudflare Email Routing',
                body: <p>In Cloudflare, go to your domain → <strong>Email → Email Routing</strong>. Click <strong>Get Started</strong>. Cloudflare will ask you to add MX records to your DNS. Click the button to add them automatically.</p>,
              },
              {
                n: 2,
                title: 'Set up a forwarding rule',
                body: <>
                  <p>Under <strong>Routing Rules</strong>, click <strong>Create address</strong>:</p>
                  <ul className="guide-list mt-2">
                    <li><strong>Custom address:</strong> <code className="text-xs bg-secondary/50 px-1.5 py-0.5 rounded">contact@yourdomain.com.au</code></li>
                    <li><strong>Action:</strong> Send to</li>
                    <li><strong>Destination:</strong> your personal Gmail or Outlook address</li>
                  </ul>
                  <p>Save the rule. Cloudflare will send a verification email to your personal inbox. Click the link in that email to confirm it.</p>
                </>,
              },
              {
                n: 3,
                title: 'Test your contact form',
                body: <>
                  <p>Go to your live website and fill in the contact form with your own details. Submit it. You should receive the enquiry in your inbox within a minute or two. If it doesn't arrive, check your spam folder first, then check that your Formspree email address is confirmed.</p>
                </>,
              },
            ]} />
            <Callout type="warn" title="Subject to change">Cloudflare Email Routing is free but its availability and limits can change. See the <a href="#stc" className="underline underline-offset-2">Subject to Change</a> section for the latest.</Callout>
          </section>

          {/* MODULE 6 */}
          <section id="mod-6" className="guide-module">
            <ModuleHeader num="06" label="Google visibility" title="Getting Found on Google" />
            <p className="guide-intro">A well-built site that Google can't find is useless. These four steps tell Google your site exists, what you do, and where you are. They take about 45 minutes total.</p>

            <Steps items={[
              {
                n: 1,
                title: 'Google Search Console: tell Google your site exists',
                body: <>
                  <p>Go to <strong>search.google.com/search-console</strong> and sign in. Click <strong>Add Property</strong> and enter your domain. Choose the <strong>HTML tag</strong> method to verify ownership: it gives you a small piece of code to add to your site's <code className="text-xs bg-secondary/50 px-1.5 py-0.5 rounded">&lt;head&gt;</code>. Add it to your layout file in GitHub and push the change. Vercel will redeploy automatically.</p>
                  <p>Once verified, click <strong>Sitemaps</strong> and enter <code className="text-xs bg-secondary/50 px-1.5 py-0.5 rounded">sitemap.xml</code>. Next.js generates this automatically.</p>
                </>,
              },
              {
                n: 2,
                title: 'Google Analytics: see who\'s visiting',
                body: <>
                  <p>Go to <strong>analytics.google.com</strong> and set up a new property for your domain. Google will give you a Measurement ID (e.g. <code className="text-xs bg-secondary/50 px-1.5 py-0.5 rounded">G-XXXXXXXXXX</code>). Add this to your layout file's <code className="text-xs bg-secondary/50 px-1.5 py-0.5 rounded">&lt;head&gt;</code> and push the change.</p>
                </>,
              },
              {
                n: 3,
                title: 'Google Business Profile: appear on Google Maps',
                body: <>
                  <p>Go to <strong>business.google.com</strong> and sign in. Search for your business name. If it exists, claim it. If not, create a new profile.</p>
                  <p>Fill in every field: business name, category (be specific: "Electrician" not just "Contractor"), phone number, website, service areas, and hours. Add photos of yourself or your team and a few completed jobs.</p>
                  <p>Google will post a verification postcard to your address, arriving in 5–14 days. Until then your profile will be limited.</p>
                  <Callout type="tip" title="Critical: NAP consistency">Your business Name, Address, and Phone number must be <strong>identical</strong> on your Google Business Profile and on your website. Even small differences ("St" vs "Street") can hurt local rankings. Copy and paste from one to the other.</Callout>
                </>,
              },
              {
                n: 4,
                title: 'Run PageSpeed Insights',
                body: <>
                  <p>Go to <strong>pagespeed.web.dev</strong> and enter your site URL. Run the test on Mobile. Aim for a Performance score above 70. If yours is below that, compress your images first using <strong>squoosh.app</strong> — it can reduce file sizes by 70–90% with no visible quality loss.</p>
                </>,
              },
            ]} />
          </section>

          {/* MODULE 7 */}
          <section id="mod-7" className="guide-module">
            <ModuleHeader num="07" label="Before you tell anyone" title="Go-Live Checklist" />
            <p className="guide-intro">Run through this on your phone, not your desktop. That's where most of your visitors will arrive from.</p>

            <ul className="flex flex-col gap-3 my-6">
              {[
                'Site loads on your phone without errors',
                'Phone number is visible above the fold (without scrolling)',
                'Phone number taps to call when you click it',
                'Your actual suburb and services appear in the hero (not placeholder text)',
                'The contact form submits and you receive the email in your inbox',
                'The SSL padlock appears in the browser address bar (https://)',
                'All navigation links go to real pages (nothing returns a 404 error)',
                'At least one customer review appears on the homepage',
                'Footer shows business name, phone, and suburb on every page',
                'Google Search Console: sitemap submitted',
                'Google Business Profile: all fields filled in, photos added',
                'Sent the URL to five people and asked: "Is it clear what I do and where?"',
              ].map((item) => (
                <li key={item} className="flex gap-3 items-start text-sm text-foreground/70">
                  <span className="mt-0.5 w-4 h-4 rounded border border-border flex-shrink-0 inline-block" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* MODULE 8 */}
          <section id="mod-8" className="guide-module">
            <ModuleHeader num="08" label="The long game" title="After Launch: Keeping It Alive" />
            <p className="guide-intro">A site that never changes slowly loses ground to competitors who update theirs. Here's how to make changes without needing a developer.</p>

            <Steps items={[
              {
                n: 1,
                title: 'Editing text: the GitHub web editor',
                body: <>
                  <p>Go to <strong>github.com</strong> and open your repository. Click on the file you want to edit. Click the pencil icon to edit it. Make your change, then click <strong>Commit changes</strong>. Vercel will automatically pick up the change and rebuild your site within about 60 seconds. No GitHub Desktop needed for small edits.</p>
                </>,
              },
              {
                n: 2,
                title: 'Adding a new service or suburb page',
                body: <>
                  <p>Go back to Claude with a new conversation. Describe the new page you want: the service name, the suburb, and any specific details. Ask Claude to write the file in the same format as your existing pages. Copy the file into your GitHub repository. Vercel deploys it automatically.</p>
                </>,
              },
              {
                n: 3,
                title: 'Keeping Google Business Profile active',
                body: <>
                  <ul className="guide-list">
                    <li>Post a Google Post once a fortnight (a job photo with a short description)</li>
                    <li>Reply to every Google review within a day or two</li>
                    <li>Ask happy customers to leave a review. The more you have, the better you rank</li>
                  </ul>
                </>,
              },
              {
                n: 4,
                title: 'When to upgrade to Web F5',
                body: <>
                  <ul className="guide-list">
                    <li>You're getting traffic but enquiries aren't converting</li>
                    <li>Competitors with worse reputations are ranking above you consistently</li>
                    <li>You want a booking system, online quotes, or client portal</li>
                    <li>You don't have time to manage the site yourself anymore</li>
                  </ul>
                  <p><Link href="/contact" className="text-primary underline underline-offset-2">Get in touch with Web F5.</Link> We can take over what you've built, or rebuild it properly on the same stack. You won't lose your domain or your Google rankings.</p>
                </>,
              },
            ]} />
          </section>

          {/* SUBJECT TO CHANGE */}
          <section id="stc" className="guide-module">
            <div className="bg-card/50 border border-border rounded-2xl p-6">
              <h2 className="text-base font-bold mb-4">Subject to Change</h2>
              <p className="text-sm text-foreground/50 mb-6">This guide references third-party services whose free tier limits, interfaces, and pricing can change without notice.</p>
              <div className="flex flex-col divide-y divide-border">
                {[
                  ['Claude (claude.ai)', 'The free tier allows a limited number of messages per day. For the initial site build (one large prompt), this is usually sufficient. Claude Pro is ~$28 AUD/month. Check anthropic.com/claude for current plan details.'],
                  ['Vercel Hobby Plan', "The free Hobby plan supports personal and hobby projects. For a small business site with low traffic it is typically fine, but Vercel has updated its commercial use policy in the past. Check vercel.com/pricing for the latest terms."],
                  ['Cloudflare Free Plan + Email Routing', "Cloudflare's free plan includes DNS management and Email Routing at no cost. Email Routing currently supports up to 200 destination addresses. Check cloudflare.com/plans for current limits."],
                  ['Formspree Free Plan', "The free plan currently allows 50 submissions per month, sufficient for most starting sites. Paid plans start at a few dollars per month. Check formspree.io/plans for current limits."],
                  ['GitHub Free Plan', "GitHub's free tier supports unlimited public and private repositories for individuals. Check github.com/pricing for current details."],
                ].map(([service, detail]) => (
                  <div key={service} className="py-4">
                    <p className="font-semibold text-sm mb-1">{service}</p>
                    <p className="text-sm text-foreground/50 leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="mt-12 border border-primary/20 rounded-2xl p-6 bg-primary/5 text-center">
            <p className="font-semibold mb-2">Ready for someone to do this for you?</p>
            <p className="text-sm text-foreground/50 mb-4">Web F5 builds custom trade websites across Central Victoria. Fixed price, no lock-in.</p>
            <Link href="/contact" className="inline-block bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">Talk to Web F5 →</Link>
          </div>

        </div>
      </div>
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ModuleHeader({ num, label, title }: { num: string; label: string; title: string }) {
  return (
    <div className="flex items-start gap-4 mb-6 pb-5 border-b border-border">
      <span className="font-bold text-2xl text-primary/20 tabular-nums flex-shrink-0 w-12 text-right">{num}</span>
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-1">{label}</p>
        <h2 className="text-xl font-bold leading-snug text-balance">{title}</h2>
      </div>
    </div>
  )
}

function Steps({ items }: { items: { n: number; title: string; body: React.ReactNode }[] }) {
  return (
    <div className="flex flex-col">
      {items.map((item, i) => (
        <div key={item.n} className="grid grid-cols-[36px_1fr] gap-4 pb-7">
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">{item.n}</div>
            {i < items.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
          </div>
          <div className="pt-1.5">
            <p className="font-semibold mb-2">{item.title}</p>
            <div className="text-sm text-foreground/70 leading-relaxed [&_p+p]:mt-2 [&_p]:leading-relaxed">{item.body}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function Callout({ type, title, children }: { type: 'tip' | 'warn'; title: string; children: React.ReactNode }) {
  const styles = type === 'tip'
    ? 'bg-primary/5 border-primary/30 [&_.ct]:text-primary'
    : 'bg-amber-500/5 border-amber-500/30 [&_.ct]:text-amber-400'
  return (
    <div className={`border-l-2 rounded-r-lg px-4 py-3 mt-4 mb-2 text-sm ${styles}`}>
      <p className="ct font-semibold text-xs uppercase tracking-wide mb-1">{title}</p>
      <div className="text-foreground/60 leading-relaxed">{children}</div>
    </div>
  )
}

