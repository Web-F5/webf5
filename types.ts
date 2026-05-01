export interface WizardData {
  // Step 1 - Starting point
  startType: 'fresh' | 'rebuild' | 'refresh' | ''
  existingUrl: string
  siteLike: string
  siteDislike: string

  // Step 2 - Domain
  domainStatus: 'have' | 'new' | 'unsure' | ''
  domainName: string
  domainRegistrar: string
  domainIdeas: string
  domainExtension: string

  // Step 3 - Business info
  contactName: string
  bizEmail: string
  bizPhone: string
  bizName: string
  bizTagline: string
  bizReg: string
  bizYear: string
  bizDesc: string
  bizUsp: string
  bizAudience: string
  
  // Step 4 - Location
  bizAddress: string
  serviceReach: 'local' | 'national' | 'international' | ''
  localArea: string
  visitType: string
  onlineServices: string

  // Step 5 - Digital presence
  googleBusiness: string
  socialMedia: string[]
  crm: string
  adAccounts: string
  
  // Step 6 - Branding
  designStyle: string
  brandColours: string
  sitesLove: string
  sitesDislike: string
  logoFiles: File[]
  photoFiles: File[]
  logoUrls: string[]
  photoUrls: string[]

  // Step 7 - Pages & content
  pages: string[]
  contentAuthor: string
  existingCopy: string
  multilingual: string
  languages: string

  // Step 8 - Features
  hasEcommerce: boolean
  productType: string
  productCount: string
  paymentGateways: string
  inventoryMgmt: string
  hasBookings: boolean
  bookingPayment: string
  staffCount: string
  features: string[]
  integrations: string

  // Step 9 - Add-ons
  addOns: string[]

  // Step 10 - Timeline & budget
  budget: string
  hasDeadline: string
  launchDate: string
  deadlineReason: string
  buildApproach: string
  internalResources: string
  extraNotes: string
}

export const defaultWizardData: WizardData = {
  startType: '',
  existingUrl: '',
  siteLike: '',
  siteDislike: '',
  domainStatus: '',
  domainName: '',
  domainRegistrar: '',
  domainIdeas: '',
  domainExtension: '.com',
  contactName: '',
  bizName: '',
  bizTagline: '',
  bizReg: '',
  bizYear: '',
  bizDesc: '',
  bizUsp: '',
  bizAudience: '',
  bizAddress: '',
  serviceReach: '',
  localArea: '',
  visitType: '',
  onlineServices: '',
  googleBusiness: '',
  socialMedia: [],
  crm: '',
  adAccounts: '',
  bizEmail: '',
  bizPhone: '',
  designStyle: '',
  brandColours: '',
  sitesLove: '',
  sitesDislike: '',
  logoFiles: [],
  photoFiles: [],
  logoUrls: [],
  photoUrls: [],
  pages: ['home'],
  contentAuthor: '',
  existingCopy: '',
  multilingual: '',
  languages: '',
  hasEcommerce: false,
  productType: '',
  productCount: '',
  paymentGateways: '',
  inventoryMgmt: '',
  hasBookings: false,
  bookingPayment: '',
  staffCount: '',
  features: [],
  integrations: '',
  addOns: [],
  budget: '',
  hasDeadline: '',
  launchDate: '',
  deadlineReason: '',
  buildApproach: '',
  internalResources: '',
  extraNotes: '',
}

export interface AddOn {
  id: string
  name: string
  description: string
  price: string
  priceNum: number
  recurring?: boolean
}

export const ADD_ONS: AddOn[] = [
  { id: 'reviews', name: 'Google Reviews integration', description: 'Display your Google reviews on your website. Manual setup process required.', price: '+$149', priceNum: 149 },
  { id: 'logo-design', name: 'Logo design', description: 'Professional logo designed for your brand, delivered in all formats.', price: '+$349', priceNum: 349 },
  { id: 'copywriting', name: 'Copywriting & content', description: 'Professional web copy written for all your pages by our team.', price: 'From $249/page', priceNum: 249 },
  { id: 'seo', name: 'SEO setup', description: 'Keyword research, on-page optimisation, Google Search Console, sitemap & schema.', price: '+$299', priceNum: 299 },
  { id: 'biz-email', name: 'Business email setup', description: 'Professional email addresses at your domain (e.g. hello@yourbusiness.com).', price: '+$99', priceNum: 99 },
  { id: 'gbp', name: 'Google Business Profile setup', description: 'Create or optimise your Google Business Profile for local search.', price: '+$149', priceNum: 149 },
  { id: 'care', name: 'Website care plan', description: 'Monthly updates, backups, security monitoring and support.', price: 'From $79/mo', priceNum: 79, recurring: true },
  { id: 'training', name: 'CMS training session', description: '1-hour walkthrough so you can manage your own content confidently.', price: '+$99', priceNum: 99 },
]

export const SOCIAL_OPTIONS = [
  'Facebook', 'Instagram', 'LinkedIn', 'TikTok', 'YouTube', 'X (Twitter)', 'Pinterest', 'None yet'
]

export const PAGE_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About us' },
  { value: 'services', label: 'Services' },
  { value: 'portfolio', label: 'Portfolio / gallery' },
  { value: 'team', label: 'Team / staff' },
  { value: 'blog', label: 'Blog / news' },
  { value: 'faq', label: 'FAQ' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'contact', label: 'Contact' },
  { value: 'careers', label: 'Careers' },
]

export const FEATURE_OPTIONS = [
  { value: 'newsletter', label: 'Email newsletter signup' },
  { value: 'livechat', label: 'Live chat or chatbot' },
  { value: 'popup', label: 'Pop-ups / lead magnets' },
  { value: 'whatsapp', label: 'WhatsApp / SMS integration' },
  { value: 'referral', label: 'Referral or loyalty program' },
  { value: 'members', label: 'Members area / login portal' },
  { value: 'multiloc', label: 'Multiple locations' },
]
