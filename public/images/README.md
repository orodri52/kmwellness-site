# public/images/

Drop real image assets here. These filenames are referenced by SEO/schema and should exist before launch (otherwise OG previews and the logo 404):

- `og-default.jpg` — default Open Graph / social share image (1200×630 recommended). Used site-wide and as the Organization/MedicalBusiness schema image.
- `logo.png` — business logo, used in Organization schema.
- `contact-og.jpg` — Open Graph image for the Contact page.

To pull the originals from the current site, run `Website-Backup/images/downloaded/download-all-images.sh`
(e.g. `wellness-logo_KM.png`, `DJI_0902-scaled.jpg`) and rename/optimize them to the names above.
Astro will optimize images placed in `src/` via its image pipeline; files in `public/` are served as-is.
