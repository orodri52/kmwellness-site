// Astro Content Collections config.
//
// A "collection" is a folder of content files (Markdown / MDX) that Astro
// treats as typed data. The `loader` tells Astro where the files live; the
// `schema` defines + validates the frontmatter for every entry. If a post is
// missing a required field (e.g. `title`) or has a bad date, the BUILD FAILS
// with a clear error instead of silently shipping broken SEO.
//
// See src/pages/blog/ for how entries are queried and rendered.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // Load every .md / .mdx file under src/content/blog/. The file name
  // (minus extension) becomes the entry `id`, which we use as the URL slug.
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),

  // Frontmatter contract for every blog post. These map directly onto SEO
  // tags and Article structured data, so they're required where it matters.
  schema: z.object({
    title: z.string().max(70),            // <title> + og:title (keep ~60 chars)
    description: z.string().max(160),     // meta description + og:description
    pubDate: z.coerce.date(),             // datePublished (ISO in JSON-LD)
    updatedDate: z.coerce.date().optional(), // dateModified, if revised
    author: z.string().default('KM Wellness Center'),
    heroImage: z.string().optional(),     // site-relative path, e.g. /images/og-default.jpg
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),    // drafts are excluded from build/sitemap
  }),
});

export const collections = { blog };
