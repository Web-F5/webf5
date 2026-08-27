export function SchemaOrg() {
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': 'https://www.webf5.com.au/#business',
    name: 'Web F5',
    url: 'https://www.webf5.com.au',
    logo: 'https://www.webf5.com.au/images/logo.webp',
    image: 'https://www.webf5.com.au/images/Web-F5-brief-to-execution-in-minutes.webp',
    description:
      'Web F5 designs and builds websites for trades, local businesses, and ecommerce brands across Central Victoria and nationally. Fixed-price quotes, real people, real builds.',
    email: 'contact@webf5.au',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Central Victoria',
      addressRegion: 'VIC',
      addressCountry: 'AU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -36.9,
      longitude: 144.5,
    },
    areaServed: [
      { '@type': 'State', name: 'Victoria', containedInPlace: { '@type': 'Country', name: 'Australia' } },
      { '@type': 'Country', name: 'Australia' },
    ],
    serviceType: ['Web Design', 'Web Development', 'Ecommerce Development', 'SEO', 'Shopify Development'],
    priceRange: '$$',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '7',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'CJ Ogston' },
        reviewBody:
          'Web F5 transformed our website. Thanks to their SEO and web design, we now rank on the first page. Highly recommended.',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      },
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Ben Speechley' },
        reviewBody:
          'Web F5 helped us with professional web design, and SEO to give us a competitive edge in our local market.',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      },
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Sophie Fair' },
        reviewBody:
          'Web F5 designed and developed our website, organised a domain, email and hosting. Very happy with the results. Fantastic service, highly recommend!',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      },
    ],
    sameAs: [
      'https://www.google.com/maps/search/Web+F5',
    ],
  }

  const services = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Web F5 Services',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Service',
          name: 'Local Business Website Design',
          description:
            'Custom websites for trades and local businesses across Central Victoria. Fixed-price quotes, built around your specific business needs.',
          provider: { '@id': 'https://www.webf5.com.au/#business' },
          areaServed: { '@type': 'State', name: 'Victoria' },
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'Service',
          name: 'Ecommerce Website Development',
          description:
            'Shopify and custom ecommerce builds for Australian businesses. Product catalogues, payment gateways, and inventory management.',
          provider: { '@id': 'https://www.webf5.com.au/#business' },
          areaServed: { '@type': 'Country', name: 'Australia' },
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'Service',
          name: 'SEO & Google Rankings',
          description:
            'Search engine optimisation to rank your business on the first page of Google, including keyword research, on-page SEO, and Google Business Profile setup.',
          provider: { '@id': 'https://www.webf5.com.au/#business' },
          areaServed: { '@type': 'Country', name: 'Australia' },
        },
      },
    ],
  }

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How long does a website take to build?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most local business and trades sites take 2–4 weeks from brief to launch. Ecommerce builds are typically 4–8 weeks depending on catalogue size and complexity. Shopify Hydrogen projects run 8–12 weeks.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer fixed-price quotes?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Always. Once we\'ve reviewed your discovery brief we come back with a fixed-price quote — not a range, not a "starting from." You know exactly what you\'re paying before any work begins.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where are you based?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Central Victoria, Australia. We work with clients across Victoria, WA, and nationally for ecommerce and Shopify projects.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to provide content and images?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We\'ll guide you on both. If you have content and photos, great — we\'ll work with what you have. If not, we can advise on copywriting and sourcing images that suit your brand.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can you take over my existing website?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We handle migrations, redesigns, and platform changes regularly — from WordPress to Shopify, from one host to another, from an old static site to a modern build.',
        },
      },
      {
        '@type': 'Question',
        name: 'What happens after my site launches?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You get full access to everything — hosting, CMS, domain — and we\'re available for ongoing support. We offer monthly hosting and maintenance packages, SEO services, and ad-hoc updates.',
        },
      },
      {
        '@type': 'Question',
        name: 'What do you need from me to get started?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Just 5 minutes in the discovery wizard. Answer the questions as best you can — even rough answers help us scope accurately. We\'ll follow up with any questions before putting together your quote.',
        },
      },
    ],
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://www.webf5.com.au/#website',
    name: 'Web F5',
    url: 'https://www.webf5.com.au',
    publisher: { '@id': 'https://www.webf5.com.au/#business' },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.webf5.com.au/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(services) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  )
}
