# public/images/

Drop real image assets here. These filenames are referenced by SEO/schema and should exist before launch (otherwise OG previews and the logo 404):

- `og-default.jpg` — default Open Graph / social share image (1200×630). Used site-wide and as the Organization/MedicalBusiness schema image. Regenerate it with `npm run gen:images` after changing the logo.
- `logo.png` — the original client-supplied business logo, used in the header, footer, and Organization schema. This file is intentionally not generated or modified by `npm run gen:images`.
- `contact-og.jpg` — Open Graph image for the Contact page.

The canonical logo source is `Website-Backup/images/downloaded/wellness-logo_KM.png`.
Astro will optimize images placed in `src/` via its image pipeline; files in `public/` are served as-is.
