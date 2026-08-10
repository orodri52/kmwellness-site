import type { APIRoute } from 'astro';
import { PROD_URL } from '../config/site';
import { siteVideos, videoChannel } from '../data/videos';

const escapeXml = (value: string | number) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export const GET: APIRoute = () => {
  const entries = siteVideos
    .map(
      (video) => `  <url>
    <loc>${escapeXml(`${PROD_URL}${video.watchPath}`)}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(video.thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${escapeXml(video.title)}</video:title>
      <video:description>${escapeXml(video.description)}</video:description>
      <video:player_loc allow_embed="yes">${escapeXml(video.embedUrl)}</video:player_loc>
      <video:duration>${video.durationSeconds}</video:duration>
      <video:publication_date>${escapeXml(video.uploadDate)}</video:publication_date>
      <video:uploader info="${escapeXml(videoChannel.url)}">${escapeXml(videoChannel.name)}</video:uploader>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>
  </url>`,
    )
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
>
${entries}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
