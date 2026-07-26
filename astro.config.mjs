// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

import cloudflare from "@astrojs/cloudflare";

// Production canonical domain. Override per-environment with PUBLIC_SITE_URL
// (e.g. set it to your *.pages.dev preview URL while testing).
// Non-production hosts are auto-noindexed — see src/components/SEO.astro.
const SITE = process.env.PUBLIC_SITE_URL || 'https://kmwellnesscenter.com';

export default defineConfig({
  site: SITE,

  // Existing site uses trailing-slash URLs (/about-us/). Keep them identical
  // so we preserve ranking/link equity. Cloudflare Pages serves these via
  // directory-format output (about-us/index.html).
  trailingSlash: 'always',

  build: { format: 'directory' },

  integrations: [
    react(),
    mdx(),
    sitemap({
      // Keep utility/confirmation pages out of the sitemap.
      filter: (page) => !page.includes('/thank-you'),
    }),
  ],

  adapter: cloudflare()
});