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
    logo: '/images/logo-chuckelec2.webp',
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
      quote: 'Josh from Web F5 worked with us closely to completely rebuild our website from the ground up, making sure everything was exactly how we wanted it, while at the same time optimising everything to maximise ranking & exposure. Highly recommend Web F5.',
      quoteAuthor: 'Chris Evans',
      quoteRole: 'Owner, Chuck E Electrical',
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
    logo: '/images/valley-feeds-logo.webp',
    caseStudy: {
      headline: 'A custom Shopify Hydrogen storefront for Valley Feeds and General',
      tagline: 'A fully bespoke React-powered Shopify storefront replacing an off-the-shelf theme, giving a regional stock feeds supplier a fast, professional online store built exactly to their needs.',
      problem: "Valley Feeds and General supply stock feed, farm supplies, and general merchandise to farmers and rural households across the Katandra and Goulburn Valley region. They had an existing Shopify store running on a generic theme that didn't reflect the business or perform the way they needed it to. The out-of-the-box look wasn't matching the quality of their products or their reputation in the region, and managing product visibility across Google Shopping was adding unnecessary friction to their day.",
      solution: "We built a fully custom Shopify Hydrogen storefront using React, replacing the generic theme entirely with a frontend designed specifically for Valley Feeds. Hydrogen gives the store the performance of a modern React app while keeping all of Shopify's backend commerce tools in place. Google Merchant Center was integrated to manage product feeds and keep stock visible across Google Shopping, driving additional traffic beyond organic search. The result is a fast, mobile-first store that feels like Valley Feeds, not a Shopify template.",
      services: ['Shopify Hydrogen Development', 'Custom React Frontend', 'Google Merchant Center', 'Product Feed Management', 'Mobile-First Build'],
      results: [
        { metric: 'Fully custom', label: 'Bespoke React frontend replacing the off-the-shelf Shopify theme' },
        { metric: 'Hydrogen-powered', label: 'Modern storefront performance with Shopify commerce backend' },
        { metric: 'Google Shopping', label: 'Merchant Center integration driving product visibility across search' },
      ],
      quote: 'Josh has been a wealth of knowledge and done an amazing job creating our new website. I highly recommend him!!',
      quoteAuthor: 'Melissa Blair',
      quoteRole: 'Valley Feeds and General, Katandra VIC',
    },
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
    logo: '/images/ATE-logo.webp',
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
    logo: '/images/Appti-logo.webp',
    caseStudy: {
      headline: 'Appti: a multi-tenant appointment booking SaaS built from the ground up',
      tagline: 'From domain and hosting to a fully functional SaaS platform with Stripe payments, SMS reminders, and multi-tenant business accounts.',
      problem: "The idea behind Appti was straightforward: give small service businesses a simple, affordable way to take bookings online without paying for bloated scheduling software. The challenge was building it properly. A multi-tenant architecture means every business gets their own isolated account, their own booking page, and their own client data — all on a single platform. It also needed automated email confirmations, SMS reminders to reduce no-shows, Stripe for subscription billing, and a system that could scale without requiring a developer on call.",
      solution: "We built Appti end-to-end on Next.js with a Neon Postgres database managed through Prisma ORM. Multi-tenancy is handled at the data layer, keeping each business account fully isolated. Resend powers transactional email for booking confirmations and notifications, while Mobile Message handles SMS reminders sent to clients ahead of their appointments. Stripe is integrated for subscription billing, with plans managed per tenant. The whole platform was set up from scratch: domain, hosting, infrastructure, and application layer delivered as one complete product.",
      services: ['SaaS Architecture & Development', 'Multi-Tenant System Design', 'Stripe Subscription Billing', 'SMS Reminders via Mobile Message', 'Transactional Email via Resend', 'Neon Postgres & Prisma ORM', 'Domain & Hosting Setup'],
      results: [
        { metric: 'Multi-tenant', label: 'Isolated business accounts on a shared platform infrastructure' },
        { metric: 'Stripe billing', label: 'Subscription management built in from day one' },
        { metric: 'SMS + email', label: 'Automated reminders cutting no-shows for every business on the platform' },
      ],
      quote: 'Web F5 helped us from start to finish. We started with a website, they organised hosting a domain at a competitive rate, definitely recommend them.',
      quoteAuthor: 'Rebecca Austin',
      quoteRole: 'Appti',
    },
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
    logo: '/images/logo-lets-get-trowled.webp',
    caseStudy: {
      headline: "Putting Let's Get Trowled on the map for plastering in Seymour and Central Victoria",
      tagline: 'A professional web presence, targeted local SEO, and ongoing content strategy helping a Seymour plastering contractor win work across the region.',
      problem: "Plastering is a competitive trade, and most clients go with whoever they find first online. Let's Get Trowled were doing quality work across Seymour and Central Victoria but had no real digital presence to show for it. Without a website structured for local search, a Google Business Profile strategy, or any regular content, they were relying on word of mouth while potential clients were finding other plasterers through Google. The opportunity was clear: build something that reflects the quality of their work and puts them in front of the right people.",
      solution: "We designed and built a mobile-first Next.js site that positions Let's Get Trowled as the go-to plastering contractor in the region. Location-specific pages target searches across Seymour, Broadford, Kilmore, and the broader Mitchell Shire. A Sanity CMS blog gives them a platform to publish helpful content covering plastering tips, renovation prep, and project spotlights — content that builds authority and gets indexed. Ongoing Google Business Profile management keeps their listing accurate and competitive, helping them appear in the local map pack when it matters most.",
      services: ['Website Design & Development', 'Local SEO', 'Location Landing Pages', 'Sanity CMS Blog', 'Google Business Profile', 'GBP Management', 'Mobile-First Build'],
      results: [
        { metric: 'Multi-location', label: 'SEO targeting Seymour, Broadford, Kilmore and surrounds' },
        { metric: 'CMS blog', label: 'Ongoing Sanity content building topical authority in plastering' },
        { metric: 'GBP managed', label: 'Active local map presence driving enquiries from the region' },
      ],
    },
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
    logo: '/images/LKF-logo.webp',
    caseStudy: {
      headline: 'A professional online presence for LKF Contracting across agricultural and civil work',
      tagline: 'Local SEO, targeted location pages, and a Sanity blog helping an Invergordon contractor get found across regional Victoria.',
      problem: "LKF Contracting operate across agricultural and civil contracting in and around Invergordon and the Goulburn Valley — earthworks, fencing, land clearing, and more. The work speaks for itself, but without a website built to rank locally, clients searching for contractors in the region had no way of finding them. Agricultural and civil contracting is a niche with real search demand from farmers and developers who need reliable operators. Being absent online meant leaving that demand entirely to others.",
      solution: "We built a clean, mobile-first Next.js site that presents LKF Contracting's services clearly and professionally. Location-targeted pages cover the key areas they operate across: Invergordon, Shepparton, Nagambie, and the broader Goulburn Valley region. A Sanity CMS blog provides a platform for publishing content around agricultural contracting topics, building topical authority over time. A Formspree contact form makes it straightforward for clients and landowners to get in touch directly from any device.",
      services: ['Website Design & Development', 'Local SEO', 'Location Landing Pages', 'Sanity CMS Blog', 'Lead Capture Forms', 'Mobile-First Build'],
      results: [
        { metric: 'Regional reach', label: 'Location pages covering Invergordon, Shepparton, Nagambie and beyond' },
        { metric: 'CMS blog', label: 'Sanity content platform for agricultural and civil topics' },
        { metric: 'Lead-ready', label: 'Formspree contact form converting visitors on any device' },
      ],
    },
  },
]
