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
  ].filter(Boolean),
} as const;

// Client reviews + aggregate rating now live in src/data/reviews.ts (used by
// ReviewsSection.astro and Schema.astro), so they can be refreshed as one
// hand-maintained snapshot without touching this file.

// Canonical service catalog. Single source of truth for schema (hasOfferCatalog)
// and the RelatedServices internal-linking mesh. Order = rough priority.
export const services = [
  { name: 'Nutrition Counseling', href: '/services/medical-nutrition-therapy-and-nutrition-counseling/' },
  { name: 'Medical Nutrition Therapy', href: '/services/medical-nutrition/' },
  { name: 'Nutritionist / Registered Dietitian', href: '/services/nutritionist-el-paso/' },
  { name: 'Weight Management', href: '/services/weight-management/' },
  { name: 'Weight Loss Prescription & Meal Prep', href: '/services/weight-loss-prescription-disease-management/' },
  { name: 'Metabolic Assessment', href: '/metabolic-assessment-el-paso/' },
  { name: 'Exercise Classes & Personal Training', href: '/services/exercise-classes-and-personal-training/' },
  { name: 'Personal Training', href: '/personal-training/' },
  { name: 'Additional Services (Meal Prep, Smoothie Bar, Supplements)', href: '/services/additional-services/' },
] as const;

// Primary navigation. `children` render as a nested <ul> (no UI styling here —
// semantic structure only).
export const nav = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/services/',
    children: [
      { label: 'Medical Nutrition Therapy', href: '/services/medical-nutrition/' },
      { label: 'Nutritional Counseling', href: '/services/medical-nutrition-therapy-and-nutrition-counseling/' },
      { label: 'Personal Training', href: '/personal-training/' },
      { label: 'Exercise Classes', href: '/services/exercise-classes-and-personal-training/' },
      { label: 'Our Nutritionist', href: '/services/nutritionist-el-paso/' },
      { label: 'Weight Loss Prescription & Meal Preps', href: '/services/weight-loss-prescription-disease-management/' },
      { label: 'Weight Management', href: '/services/weight-management/' },
      { label: 'Metabolic & Body Composition Tests', href: '/metabolic-assessment-el-paso/' },
    ],
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
