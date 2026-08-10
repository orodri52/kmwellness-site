// Central business + site configuration. Single source of truth for NAP,
// navigation, and brand data used across SEO, schema, header, and footer.

export const PROD_HOSTNAME = 'kmwellnesscenter.com';
export const PROD_URL = `https://${PROD_HOSTNAME}`;

// Analytics. Reuses the existing Google Tag Manager container from the current
// live site, so the GA4 + Meta Pixel tags configured inside it carry over.
// Only loads on the production host (previews/localhost stay clean). Set to ''
// to disable entirely.
export const analytics = {
  gtmId: 'GTM-5ZSWHWBG',
} as const;

export const business = {
  name: 'KM Wellness Center',
  tagline: 'Holistic Weight Loss Clinic in El Paso',
  description:
    'KM Wellness Center is a holistic weight loss and nutrition clinic in El Paso, TX, offering medical nutrition therapy, personalized weight management, metabolic assessments, and personal training.',
  phone: '(915) 444-5110',
  phoneRaw: '+19154445110',
  email: 'info@kmwellnesscenter.com',
  address: {
    street: '8623 N Loop Dr., Ste B',
    locality: 'El Paso',
    region: 'TX',
    postalCode: '79907',
    country: 'US',
    plaza: 'Kingsway Plaza',
  },
  // Approx. coordinates for 8623 N Loop Dr, El Paso, TX — verify before launch.
  geo: { latitude: 31.6904, longitude: -106.3372 },
  hours: 'Mo-Fr 08:00-17:00',
  hoursHuman: 'Monday–Friday: 8:00 AM–5:00 PM · Personal training hours by appointment.',
  mapsUrl: 'https://maps.app.goo.gl/y1kCe2foVB62emWr8',
  awards: 'Best of El Paso 2024 & 2025',
  social: {
    facebook: 'https://www.facebook.com/kmwellnesscenter',
    instagram: 'https://www.instagram.com/kmcwellness/',
  },
} as const;

// Lead practitioner & co-founder. Drives E-E-A-T: a named, credentialed expert
// is critical for a medical (YMYL) site. Emitted as a Person node in the schema
// graph and referenced from /about-us/ + /as-featured-in/.
//
// NOTE: Daniel also co-owns Texas Dietetics (texasdietetics.com). `sameAs` links
// his ONE identity across both businesses so KM inherits his authority (Forbes,
// GQ, etc.). Keep KM's NAP separate from Texas Dietetics' — never mix them.
export const practitioner = {
  name: 'Daniel Chavez',
  honorificSuffix: 'RD, LD, CSCS, CISSN',
  role: 'Co-Founder & Registered Dietitian',
  jobTitle: 'Registered & Licensed Dietitian, Certified Strength & Conditioning Specialist, Certified Sports Nutritionist',
  alumniOf: ['University of Alabama', 'University of Texas at El Paso'],
  award: 'Best Dietitian in El Paso (2024 & 2025)',
  knowsAbout: [
    'Medical Nutrition Therapy',
    'Weight Management',
    'Metabolic Assessment',
    'Sports Nutrition',
    'Bariatric Nutrition',
    'Diabetes Management',
    'Nutrition Counseling',
  ],
  // Consolidates his ONE identity across businesses/directories so KM inherits
  // his authority. All verified URLs. Add his LinkedIn here if he has one.
  sameAs: [
    'https://www.texasdietetics.com/about',
    'https://www.instagram.com/texasdietetics/',
    'https://www.healthprofs.com/us/nutritionists-dietitians/daniel-chavez-el-paso-tx/1205157',
    'https://www.healthgrades.com/providers/daniel-chavez-uppj26',
    'https://www.linkedin.com/in/daniel-chavez-rd-ld-cscs-cissn-880894149/',
  ].filter(Boolean),
} as const;

// Client reviews + aggregate rating now live in src/data/reviews.ts (used by
// ReviewsSection.astro and Schema.astro), so they can be refreshed as one
// hand-maintained snapshot without touching this file.

// Ordered list of category labels — drives the nav mega-menu column order.
export const serviceCategories = [
  'Nutrition Counseling',
  'Weight Management & Medical',
  'Condition-Specific Nutrition',
  'Fitness, Testing & Programs',
] as const;

// Canonical service catalog. Single source of truth for schema (hasOfferCatalog),
// the nav mega-menu (grouped by `category`), and the RelatedServices
// internal-linking mesh (filtered to same-category pages). Order = rough
// priority within each category.
export const services = [
  { name: 'Nutrition Counseling', href: '/services/medical-nutrition-therapy-and-nutrition-counseling/', category: 'Nutrition Counseling' },
  { name: 'Medical Nutrition Therapy', href: '/services/medical-nutrition/', category: 'Nutrition Counseling' },
  { name: 'Nutritionist / Registered Dietitian', href: '/services/nutritionist-el-paso/', category: 'Nutrition Counseling' },
  { name: 'Additional Services (Meal Prep, Smoothie Bar, Supplements)', href: '/services/additional-services/', category: 'Nutrition Counseling' },
  { name: 'Weight Management', href: '/services/weight-management/', category: 'Weight Management & Medical' },
  { name: 'Weight Loss Prescription & Meal Prep', href: '/services/weight-loss-prescription-disease-management/', category: 'Weight Management & Medical' },
  { name: 'GLP-1 Weight Loss Counseling', href: '/services/glp-1-weight-loss-el-paso/', category: 'Weight Management & Medical' },
  { name: 'Diabetes Nutrition', href: '/services/diabetes-nutrition-el-paso/', category: 'Condition-Specific Nutrition' },
  { name: "Women's Health Nutrition", href: '/services/womens-health-nutrition-el-paso/', category: 'Condition-Specific Nutrition' },
  { name: 'PCOS Nutrition', href: '/services/pcos-nutrition-el-paso/', category: 'Condition-Specific Nutrition' },
  { name: 'Digestive Health Nutrition', href: '/services/digestive-health-nutrition-el-paso/', category: 'Condition-Specific Nutrition' },
  { name: 'Bariatric Nutrition', href: '/services/bariatric-nutrition-el-paso/', category: 'Condition-Specific Nutrition' },
  { name: 'Pediatric Nutrition', href: '/services/pediatric-nutrition-el-paso/', category: 'Condition-Specific Nutrition' },
  { name: 'Sports Nutrition', href: '/services/sports-nutrition-el-paso/', category: 'Condition-Specific Nutrition' },
  { name: 'Fatty Liver (NAFLD) Nutrition', href: '/services/fatty-liver-nutrition-el-paso/', category: 'Condition-Specific Nutrition' },
  { name: 'Kidney Disease Nutrition', href: '/services/kidney-disease-nutrition-el-paso/', category: 'Condition-Specific Nutrition' },
  { name: 'Cholesterol & Heart Health Nutrition', href: '/services/cholesterol-heart-health-nutrition-el-paso/', category: 'Condition-Specific Nutrition' },
  { name: 'Exercise Classes & Personal Training', href: '/services/exercise-classes-and-personal-training/', category: 'Fitness, Testing & Programs' },
  { name: 'Personal Training', href: '/personal-training/', category: 'Fitness, Testing & Programs' },
  { name: 'Metabolic Assessment', href: '/metabolic-assessment-el-paso/', category: 'Fitness, Testing & Programs' },
  { name: 'Corporate Wellness Programs', href: '/services/corporate-wellness-el-paso/', category: 'Fitness, Testing & Programs' },
] as const;

// Primary navigation. `children` render as a nested <ul> (no UI styling here —
// semantic structure only).
export const nav = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/services/',
    // Rendered as a grouped mega-menu by Header.astro, sourced live from
    // `services` + `serviceCategories` above — no separate list to keep in sync.
    mega: true,
  },
  { label: 'Success Stories', href: '/success-stories/' },
  { label: 'Blog', href: '/blog/' },
  {
    label: 'About',
    href: '/about-us/',
    children: [
      { label: 'As Featured In', href: '/as-featured-in/' },
      { label: 'Insurances we Accept', href: '/insurances-we-accept/' },
    ],
  },
  { label: 'Contact Us', href: '/contact-us/' },
] as const;
