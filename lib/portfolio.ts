export type CaseStudy = {
  headline: string
  tagline: string
  problem: string
  solution: string
  services: string[]
  results: { metric: string; label: string }[]
  quote: string
  quoteAuthor: string
  quoteRole: string
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
      tagline: 'From invisible to first page — electrical contractor earns a competitive edge with professional web design and targeted local SEO.',
      problem: "Ben Speechley runs Speechless Electrical out of Seymour, VIC, servicing everything from residential fit-outs to commercial switchboard upgrades. He had a basic website that wasn't ranking locally, no Google Business Profile strategy, and no way to capture leads after hours. Electricians are one of the most searched-for trades in regional Victoria — being invisible on Google means losing work to whoever shows up first.",
      solution: "We built a fast, mobile-first Next.js site from the ground up, prioritising local SEO from day one. Every page was structured around the terms Seymour residents actually search — 'electrician Seymour', 'licensed electrician near me', 'emergency electrical Seymour VIC'. We embedded Google reviews directly on the site to build instant trust and wired up a Formspree contact form for after-hours lead capture. The site also connects to his Google Business Profile, reinforcing location authority across search and maps.",
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
