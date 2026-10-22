export type CaseStudy = {
  headline: string
  tagline: string
  problem: string
  solution: string
  services: string[]
  results: { metric: string; label: string }[]
  quote?: string
  quoteAuthor?: string
  quoteRole?: string
}

export type Project = {
  id: string
  name: string
  industry: string
  location: string
  description: string
  features: string[]
  url: string
  image: string
  logo?: string
  caseStudy?: CaseStudy
}

export const projects: Project[] = [
  {
    id: 'chuck-e-electrical',
    name: 'Chuck E Electrical',
    industry: 'Electrical Contractor',
    location: 'Seymour, Victoria',
    description:
      'Local electrical contractor serving Seymour and surrounds. Full-service website with SEO targeting, blog, and Google review integration to drive local leads.',
    features: ['Next.js', 'Mobile-first', 'SEO', 'Sanity Blog', 'Google Reviews', 'GBP Management'],
    url: 'https://chuckelec.com',
    image: '/images/Licensed-Electricians- Chuck-E-Electrical.webp',
    caseStudy: {
      headline: 'Full-service SEO and web presence for Chuck E Electrical in Seymour',
      tagline: 'A fast, lead-ready website with an ongoing SEO and content strategy helping a local electrician stand out in a competitive regional market.',
      problem: "Chuck E Electrical services residential and commercial clients across Seymour and surrounds. Like most trade businesses, their growth was fuelled by referrals but limited by how little visibility they had online. Seymour has no shortage of electricians, and when a homeowner searches at 7pm after a switchboard trips, you either appear or you don't. Without a proper website, blog content, or a managed Google Business Profile, they were handing enquiries to competitors who had invested in their online presence.",
      solution: "We built a fast Next.js website structured around the services Chuck E Electrical actually offers and the suburbs they serve. Local SEO was built in from the foundation: optimised page titles, structured service pages, and schema markup to help Google understand who they are and where they work. A Sanity-powered blog gives them a steady stream of indexable content covering common electrical questions and local topics. Google reviews are displayed on-site for instant credibility, and ongoing GBP management keeps their map listing accurate, active, and competitive.",
      services: ['Website Design & Development', 'Local SEO', 'Sanity CMS Blog', 'Google Review Integration', 'Google Business Profile', 'GBP Management', 'Mobile-First Build'],
      results: [
        { metric: 'SEO-first', label: 'Site architecture built around local search from day one' },
        { metric: 'Ongoing blog', label: 'Regular Sanity CMS content keeping the site fresh and indexed' },
        { metric: 'GBP managed', label: 'Active Google Business Profile driving map and local pack visibility' },
      ],
    },
  },
  {
    id: 'fsm-recycling',
    name: 'F.S.M. Recycling and Demolitions',
    industry: 'Metals & Concrete Recycling',
    location: 'Broadford, Victoria',
    description:
      'Recycling and demolitions business serving Central Victoria. Clean, professional site with SEO services and contact form integration.',
    features: ['Next.js', 'Mobile-first', 'SEO', 'Sanity Blog', 'Formspree'],
    url: 'https://fsmrecycle.com.au',
    image: '/images/FSM-Recycling-and-Demolition.webp',
    logo: '/images/fsm-logo.webp',
    caseStudy: {
      headline: 'A complete digital setup for FSM Recycling and Demolitions',
      tagline: 'Domain, hosting, email, and a professional website delivered end-to-end for a Central Victorian recycling and demolitions business.',
      problem: "FSM Recycling and Demolitions handle scrap metals, concrete recycling, and demolition work across Broadford and Central Victoria. When they came to Web F5, they had no website, no business domain, and no professional email. They needed everything set up from scratch, done right the first time, without having to coordinate multiple providers or figure it all out themselves. The goal was a clean, credible online presence that matched the quality of their on-the-ground operation.",
      solution: "We handled the full setup: registered their domain, configured business email hosting, and built a clean mobile-first Next.js site that presents their services clearly and professionally. SEO foundations were built in from the start, with structured pages targeting the services and locations they serve. A Sanity CMS blog was included to give them the ability to publish content and grow organic reach over time. A Formspree contact form makes it simple for clients to enquire directly from the site.",
      services: ['Domain Registration', 'Email Hosting', 'Website Design & Development', 'Local SEO', 'Sanity CMS Blog', 'Lead Capture Forms', 'Mobile-First Build'],
      results: [
        { metric: 'End-to-end', label: 'Domain, email, hosting and website delivered as one package' },
        { metric: 'SEO-ready', label: 'Structured pages targeting Broadford and Central Victoria' },
        { metric: 'CMS included', label: 'Sanity blog for ongoing content and organic growth' },
      ],
      quote: 'Web F5 designed and developed our website, organised a domain, email and hosting. Very happy with the results. Fantastic service, highly recommend!',
      quoteAuthor: 'Sophie Fair',
      quoteRole: 'FSM Recycling and Demolitions',
    },
  },
  {
    id: 'outright-electrical',
    name: 'Outright Electrical',
    industry: 'Electrical Contractor',
    location: 'Heathcote, Victoria',
    description:
      'Electrical contractor serving Heathcote and surrounds. Mobile-first site with local SEO and lead capture.',
    features: ['Next.js', 'Mobile-first', 'SEO', 'Formspree'],
    url: 'https://outrightelectrical.com.au',
    image: '/images/Outright-Electrical-Heathcote-Victoria.webp',
  },
  {
    id: 'valley-feeds',
    name: 'Valley Feeds and General',
    industry: 'Stock Feeds Supplier',
    location: 'Katandra, Victoria',
    description:
      'Fully customised Shopify Hydrogen/React storefront for a regional stock feeds supplier. Custom front end with Google Merchant Center product management.',
    features: ['Shopify Hydrogen', 'React', 'Google Merchant Center', 'Mobile-first'],
    url: 'https://valleyfeeds.com.au',
    image: '/images/Valley-Feeds-Katandra-West-Victoria.webp',
  },
  {
    id: 'horse-hay',
    name: 'Horse Hay',
    industry: 'Horse Hay Specialist',
    location: 'Invergordon, Victoria',
    description:
      'Horse hay specialist serving regional Victoria. Clean mobile-first site with SEO foundations and contact form.',
    features: ['Next.js', 'Mobile-first', 'SEO', 'Formspree'],
    url: 'https://horsehay.com.au',
    image: '/images/Horse-Hay-Invergordan-Victoria.webp',
  },
  {
    id: 'australian-trenching',
    name: 'Australian Trenching and Excavations',
    industry: 'Trenching & Excavations',
    location: 'Seymour, Victoria',
    description:
      'Civil contracting business with full SEO implementation, location targeting funnels, blog, and community integration to dominate local search.',
    features: ['Next.js', 'Mobile-first', 'SEO', 'Sanity Blog', 'Google Reviews', 'GBP Management'],
    url: 'https://austrenching.com.au',
    image: '/images/Australian-Trenching-and-Excavations-Seymour-Victoria.webp',
    caseStudy: {
      headline: 'How Australian Trenching went from page 7 to page 1 on Google',
      tagline: 'A complete website rebuild and SEO overhaul that pushed a Seymour civil contractor to the top of local search and kept them there.',
      problem: "CJ Ogston's business was doing solid work around Seymour and Central Victoria, but the website wasn't doing its job. It was sitting on page 7 of Google, practically invisible to anyone searching for trenching or excavation services nearby. Without a proper SEO strategy, blog, or Google Business Profile setup, the business was relying entirely on word of mouth while competitors with better online presence were picking up the enquiries.",
      solution: "We rebuilt the site from scratch on Next.js with a mobile-first approach, then built a full local SEO strategy around the services and locations that matter most. Location-specific landing pages target searches across Seymour, Broadford, Euroa, and the Mitchell Shire. A Sanity-powered blog gives the site fresh, indexed content on a regular basis. We integrated Google reviews on-site for social proof and set up Google Business Profile management to reinforce map rankings. The result is a site that works as hard as the team behind it.",
      services: ['Website Design & Development', 'Local SEO', 'Location Landing Pages', 'Sanity CMS Blog', 'Google Business Profile', 'Google Review Integration', 'GBP Management'],
      results: [
        { metric: 'Page 7 to 1', label: 'Google ranking improvement for core search terms' },
        { metric: 'Multi-location', label: 'SEO targeting Seymour, Broadford, Euroa and surrounds' },
        { metric: 'Ongoing', label: 'Blog content and GBP management keeping rankings strong' },
      ],
      quote: 'Web F5 transformed our website. Thanks to their SEO and web design, we now rank on the first page. Highly recommended.',
      quoteAuthor: 'CJ Ogston',
      quoteRole: 'Owner, Australian Trenching and Excavations',
    },
  },
  {
    id: 'appti',
    name: 'Appti',
    industry: 'SaaS / Booking Platform',
    location: 'Australia',
    description:
      'Multi-tenant appointment booking SaaS platform. Built with Next.js, Prisma, Neon Postgres, Resend email, Mobile Message SMS, and Stripe payments.',
    features: ['Next.js', 'SaaS', 'Neon Postgres', 'Stripe', 'SMS Reminders', 'Multi-tenant'],
    url: 'https://appti.net',
    image: '/images/Appti.webp',
  },
  {
    id: 'speechless-electrical',
    name: 'Speechless Electrical',
    industry: 'Electrical Contractor',
    location: 'Seymour, Victoria',
    description:
      'Electrical contractor with mobile-first site, local SEO, and Google review integration to build trust with local clients.',
    features: ['Next.js', 'Mobile-first', 'SEO', 'Google Reviews', 'Formspree'],
    url: 'https://speechlesselec.com',
    image: '/images/Speechless-Electrical-Licensed-Electrician-Seymour.webp',
    logo: '/images/logo-speechless-electrical.webp',
    caseStudy: {
      headline: 'Local SEO that puts Speechless Electrical at the top of Google in Seymour',
      tagline: 'From invisible to first page: electrical contractor earns a competitive edge with professional web design and targeted local SEO.',
      problem: "Ben Speechley runs Speechless Electrical out of Seymour, VIC, servicing everything from residential fit-outs to commercial switchboard upgrades. He had a basic website that wasn't ranking locally, no Google Business Profile strategy, and no way to capture leads after hours. Electricians are one of the most searched-for trades in regional Victoria; being invisible on Google means losing work to whoever shows up first.",
      solution: "We built a fast, mobile-first Next.js site from the ground up, prioritising local SEO from day one. Every page was structured around the terms Seymour residents actually search: 'electrician Seymour', 'licensed electrician near me', 'emergency electrical Seymour VIC'. We embedded Google reviews directly on the site to build instant trust and wired up a Formspree contact form for after-hours lead capture. The site also connects to his Google Business Profile, reinforcing location authority across search and maps.",
      services: ['Website Design & Development', 'Local SEO', 'Google Business Profile', 'Google Review Integration', 'Lead Capture Forms', 'Mobile-First Build'],
      results: [
        { metric: 'First page', label: 'Google ranking for Seymour electrician searches' },
        { metric: 'Mobile-first', label: 'Built to convert on the device most clients use' },
        { metric: '5★ reviews', label: 'Displayed on-site to build local trust immediately' },
      ],
      quote: 'Web F5 helped us with professional web design, and SEO to give us a competitive edge in our local market.',
      quoteAuthor: 'Ben Speechley',
      quoteRole: 'Owner, Speechless Electrical',
    },
  },
  {
    id: 'lets-get-trowled',
    name: "Let's Get Trowled",
    industry: 'Plastering Contractor',
    location: 'Seymour, Victoria',
    description:
      'Plastering contractor with full SEO implementation, location targeting funnels, Sanity CMS blog, and Google Business Profile management.',
    features: ['Next.js', 'Mobile-first', 'SEO', 'Sanity Blog', 'GBP Management'],
    url: 'https://letsgettrowled.com.au',
    image: '/images/Lets-Get-Trowled-Plastering-Services-Seymour.webp',
  },
  {
    id: 'lkf-contracting',
    name: 'LKF Contracting',
    industry: 'Agricultural & Civil Contracting',
    location: 'Invergordon, Victoria',
    description:
      'Agricultural and civil contracting business with full SEO targeting, location funnels, and Sanity CMS blog.',
    features: ['Next.js', 'Mobile-first', 'SEO', 'Sanity Blog', 'Formspree'],
    url: 'https://lkfcontracting.com.au',
    image: '/images/LKF-Contracting-Agricultural-and- -Civil-Contractors-Invergordon.webp',
  },
]
