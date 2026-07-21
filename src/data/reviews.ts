// Google review snapshot for KM Wellness Center — used by ReviewsSection.astro
// and Schema.astro (Review / AggregateRating structured data).
//
// This is a hand-maintained, periodically-refreshed SNAPSHOT, not a live API
// call. Refresh it from the Google Business Profile (Maps data ID
// 0x86e7438f87ff4bdd:0x2706aad88e9a9489 — or the dashboard)
// every few months so the numbers shown in the UI stay reasonably current,
// then update `lastVerified` below.
//
// Never invent reviews or ratings. The two testimonials that used to live
// here (Karen D. Martinez Franco, Amber Mejia) were removed because both are
// now KM Wellness staff and shouldn't be presented as outside reviewers.
// Leave the arrays empty if this ever needs resetting — the ReviewsSection
// component renders nothing when `fallbackReviews` is empty, so an empty
// snapshot is always safe to ship.
export const lastVerified = '2026-07-21';

export type Review = {
  authorName: string;
  rating: number; // 1-5
  text: string;
  relativePublishTimeDescription?: string; // e.g. "8 months ago"
};

export const aggregateRating: { ratingValue: string; reviewCount: number } | null = {
  ratingValue: '5.0',
  reviewCount: 27,
};

export const fallbackReviews: Review[] = [
  {
    authorName: 'Veronica Chancey',
    rating: 5,
    text: "I highly recommend my personal trainer BRENDA! She has a great training style that is both motivating and supportive. One thing I really appreciate is that she pays close attention to my form and corrects me whenever I'm doing an exercise incorrectly, which helps me stay safe and get the best results. She is very patient, respectful, and never makes me feel uncomfortable when I'm learning something new. She takes the time to explain each exercise and makes sure I understand what I'm doing. Her positive attitude and professionalism make every session enjoyable. I'm very happy with my experience and look forward to continuing my fitness journey with her.",
    relativePublishTimeDescription: 'a month ago',
  },
  {
    authorName: 'Stephanie Carreon',
    rating: 5,
    text: 'I have been coming to KM Wellness for almost a year now and have made more progress with my health and weight loss journey than I have in past attempts. Everyone here is so supportive and helpful, Karen is amazing with anything insurance and billing, and Brenda is a top tier trainer!',
    relativePublishTimeDescription: '2 months ago',
  },
  {
    authorName: 'Venessa',
    rating: 5,
    text: 'I absolutely love this place!! The KM wellness team have not only helped me with my weight loss and physical strength training goals but also my mental health! Karen is always there to help me with any questions I have, Daniels guidance on nutrition has helped me so much prioritize my health, and I absolutely love my trainers Brenda and Aaron for welcoming me and taking there time with me and because of that I have seen so much progress in my training! They are the best in the field!!',
    relativePublishTimeDescription: '10 months ago',
  },
  {
    authorName: 'Elizabeth Deshaies',
    rating: 5,
    text: 'This is my one year anniversary as a client of Daniel Chavez. My experience continues to be motivating, positive, and supportive. It’s hard to name a favorite because imo they each bring their “A” game to group sessions.',
    relativePublishTimeDescription: '7 months ago',
  },
  {
    authorName: 'Jasmine Reyes',
    rating: 5,
    text: 'I really like and enjoy going to KM wellness. The whole staff is very polite, welcoming, and work very well with your schedule. They make you feel at home and very easy to feel comfortable. Any questions I have are answered in a very timely manner. I go with Daniel for dietician counseling and do strength training with both Brenda and Aaron and I have nothing but good and positive things to say about them. Karen is very patient with me when I try to schedule my trainings as my schedule during the week can be a little hectic.',
    relativePublishTimeDescription: '7 months ago',
  },
  {
    authorName: 'Luis Morita',
    rating: 5,
    text: 'KML Wellness Center deserves every one of its five stars! From the moment you connect, Admin Karen provides exceptional flexibility, always accommodating last-minute scheduling changes with ease. Daniel Chavez RD, the nutriologist, is simply outstanding; under his expert guidance, I, a 5\'10" male, went from 190 lbs to 174 lbs in just two months, gaining invaluable knowledge for sustainable health. Meanwhile, Brenda, our kinesiologist, crafts awesome, personalized workouts that have helped me build strength and muscle properly, without any pain or injury. This incredible team works together seamlessly to deliver truly transformative results, making KML Wellness the ultimate destination for holistic well-being.',
    relativePublishTimeDescription: '9 months ago',
  },
  {
    authorName: 'Christopher Matos',
    rating: 5,
    text: 'I’ve been working with Dr. Chavez since early 2024, he’s been incredible. He created a super easy-to-follow diet plan that I can actually stick to. He’s really taken the time to understand my specific goals and teach me about nutrition so I can achieve my goals. He’s tailored his care to me and the best part is that he’s set me up with systems in place so I’m more likely to reach my goals. I highly recommend Dr. Chavez to anyone looking to lose weight and feel their best.',
    relativePublishTimeDescription: 'a year ago',
  },
  {
    authorName: 'Joana Flores',
    rating: 5,
    text: 'I can’t recommend this place enough! From the moment you walk in, you’re greeted by Karen at the front desk, who is always friendly and welcoming. Daniel, the nutritionist, is incredibly knowledgeable and always provides science-based recommendations that truly make a difference. His guidance has not only helped me make meaningful changes to my diet but has also played a huge role in reducing my anxiety through proper nutrition. I appreciate how dedicated he is to his clients’ overall well-being, not just their diet. The personal training here is also outstanding. Aaron and Pablo are both incredibly knowledgeable and genuinely care about their clients. They take the time to create workouts that fit my needs, push me to improve, and ensure I’m training safely. I’ve seen amazing progress and feel stronger every day! 😁 The facility itself is clean, well-equipped, and has a motivating atmosphere that keeps me coming back! If you’re looking for EXPERT nutrition advice combined with TOP-TIER personal training in a supportive environment, this is the place to be. Highly recommend!',
    relativePublishTimeDescription: 'a year ago',
  },
  {
    authorName: 'Blanca Rodarte',
    rating: 5,
    text: 'Started working with Dan back in July and I officially lost 20lbs!! 100% recommend! Started working with Bianca-NP almost a year ago and we have come a long way from where I started ♥️ and the staff has been great too! Forever grateful to all of them for working with me to get my health back on track ♥️',
  },
  {
    authorName: 'Daniel Martinez',
    rating: 5,
    text: 'Friendly staff. The dietician is very passionate about teaching you the proper way to have a healthy diet without unrealistic restrictions. Highly recommend!',
  },
];
