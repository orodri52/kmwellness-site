// Google review snapshot for KM Wellness Center — used by ReviewsSection.astro
// and Schema.astro (Review / AggregateRating structured data).
//
// This is a hand-maintained, periodically-refreshed SNAPSHOT, not a live API
// call. Refresh it from the Google Business Profile (Places API "Place
// Details" request — Place ID ChIJ3Uv_h49D54YRiZSajtiqBic — or the dashboard)
// every few months so the numbers shown in the UI stay reasonably current,
// then update `lastVerified` below.
//
// Never invent reviews or ratings. The two testimonials that used to live
// here (Karen D. Martinez Franco, Amber Mejia) were removed because both are
// now KM Wellness staff and shouldn't be presented as outside reviewers.
// Leave the arrays empty if this ever needs resetting — the ReviewsSection
// component renders nothing when `fallbackReviews` is empty, so an empty
// snapshot is always safe to ship.
export const lastVerified = '2026-07-20';

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
];
