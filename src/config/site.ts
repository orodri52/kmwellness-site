// Central business + site configuration. Single source of truth for NAP,
// navigation, and brand data used across SEO, schema, header, and footer.

export const PROD_HOSTNAME = 'kmwellnesscenter.com';
export const PROD_URL = `https://${PROD_HOSTNAME}`;

export const business = {
  // NOTE: site uses both "KM Wellness Center" and "Kingsway Wellness Center".
  // Confirm the canonical name with the client, then keep it consistent here.
  name: 'KM Wellness Center',
  legalName: 'Kingsway Wellness Center',
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
  hours: 'Mo-Sa 09:00-18:00',
  hoursHuman: 'Mon to Sat: 9:00am – 6:00pm · Sun: Closed',
  mapsUrl: 'https://maps.app.goo.gl/y1kCe2foVB62emWr8',
  awards: 'Best of El Paso 2024 & 2025',
  social: {
    facebook: 'https://www.facebook.com/kmwellnesscenter',
    instagram: 'https://www.instagram.com/kmcwellness/',
  },
} as const;

// Primary navigation. `children` render as a nested <ul> (no UI styling here —
// semantic structure only).
export const nav = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/services/',
    children: [
      { label: 'Metabolic Assessment El Paso', href: '/metabolic-assessment-el-paso/' },
      { label: 'Medical Nutrition Therapy', href: '/services/medical-nutrition/' },
      { label: 'Exercise Classes', href: '/services/exercise-classes-and-personal-training/' },
      { label: 'Our Nutritionist', href: '/services/nutritionist-el-paso/' },
      { label: 'Nutrition Counseling', href: '/services/medical-nutrition-therapy-and-nutrition-counseling/' },
      { label: 'Weight Loss Prescription & Meal Preps', href: '/services/weight-loss-prescription-disease-management/' },
      { label: 'Weight Management', href: '/services/weight-management/' },
      { label: 'Personal Training', href: '/personal-training/' },
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
