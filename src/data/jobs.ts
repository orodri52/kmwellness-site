/**
 * Reusable careers catalog.
 *
 * To publish another position, duplicate an entry, give it a unique `id`, and
 * replace the content. Set `status` to `closed` to remove a position from the
 * public list without deleting its copy.
 */
export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  workArrangement: string;
  summary: string;
  description: readonly string[];
  responsibilities?: readonly string[];
  requirements: readonly string[];
  preferred?: readonly string[];
  status: 'open' | 'closed';
}

export const jobs = [
  {
    id: 'registered-dietitian',
    title: 'Registered Dietitian',
    department: 'Nutrition Care',
    location: 'Remote',
    employmentType: 'PRN / Part-time / Full-time',
    workArrangement: 'Remote',
    summary:
      'Provide personalized virtual nutrition counseling that helps clients build sustainable habits, manage health conditions, and reach their wellness goals.',
    description: [
      'KM Wellness Center is seeking a motivated, compassionate, and knowledgeable Registered Dietitian to join our growing team in a remote role.',
      'The Registered Dietitian will guide clients toward better health through individualized nutrition care, practical education, and ongoing support tailored to each person’s goals and medical needs.',
    ],
    responsibilities: [
      'Conduct comprehensive nutrition assessments and create individualized nutrition plans',
      'Provide nutrition counseling and education based on each client’s goals and health needs',
      'Support clients with weight management, eating habits, and nutrition-related health conditions',
      'Monitor progress and adjust nutrition plans as needed',
      'Review lab results, body-composition data, and other health measures when appropriate',
      'Collaborate with kinesiologists, trainers, and other healthcare professionals',
      'Complete accurate, timely client documentation',
      'Provide ongoing education, accountability, and encouragement',
      'Participate in wellness programs, seminars, workshops, and community or corporate initiatives as needed',
    ],
    requirements: [
      'Active Registered Dietitian credential',
      'Current state licensure where required',
      'Strong communication and interpersonal skills',
      'Ability to build positive, supportive relationships with clients',
      'Ability to work independently and collaborate with a multidisciplinary team',
      'Reliable access to a computer and internet or Wi-Fi connection',
      'Bilingual fluency in English and Spanish',
      'Availability during evenings and Saturdays, with flexibility for other days or hours as needs evolve',
    ],
    preferred: [
      'Experience in weight management, medical nutrition therapy, sports nutrition, or wellness coaching',
    ],
    status: 'open',
  },
] satisfies readonly Job[];
