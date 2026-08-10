export interface SiteVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  durationSeconds: number;
  durationLabel: string;
  uploadDate: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  embedUrl: string;
  watchPath: string;
}

const channel = {
  name: 'KM Wellness Center',
  url: 'https://www.youtube.com/@KMWelllnessCenter',
} as const;

export const medicalNutritionTherapyVideo = {
  id: 'tufPm0hcFdc',
  title: 'Medical Nutrition Therapy',
  description:
    'A brief look at personalized, dietitian-led medical nutrition therapy at KM Wellness Center in El Paso, TX.',
  duration: 'PT33S',
  durationSeconds: 33,
  durationLabel: '0:33',
  uploadDate: '2024-11-25T13:41:40-08:00',
  thumbnailUrl: 'https://i.ytimg.com/vi/tufPm0hcFdc/maxresdefault.jpg',
  youtubeUrl: 'https://www.youtube.com/watch?v=tufPm0hcFdc',
  embedUrl: 'https://www.youtube.com/embed/tufPm0hcFdc',
  watchPath: '/watch/medical-nutrition-therapy/',
} as const satisfies SiteVideo;

export const exerciseClassesVideo = {
  id: '-lfESjOvP2A',
  title: 'Exercise Classes and Personal Training',
  description:
    'A brief look at personalized exercise classes and personal training at KM Wellness Center in El Paso, TX.',
  duration: 'PT35S',
  durationSeconds: 35,
  durationLabel: '0:35',
  uploadDate: '2024-11-25T13:43:30-08:00',
  thumbnailUrl: 'https://i.ytimg.com/vi/-lfESjOvP2A/maxresdefault.jpg',
  youtubeUrl: 'https://www.youtube.com/watch?v=-lfESjOvP2A',
  embedUrl: 'https://www.youtube.com/embed/-lfESjOvP2A',
  watchPath: '/watch/exercise-classes-and-personal-training/',
} as const satisfies SiteVideo;

export const siteVideos = [
  medicalNutritionTherapyVideo,
  exerciseClassesVideo,
] as const;

export const videoChannel = channel;
