# Suraksha — new website (Next.js 16 + Tailwind CSS v4)

## Run
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # production
```

## Change the brand colors (one place)
Open `app/globals.css` and edit the 5 values at the top:

```css
--brand-primary:   #0e7c86;
--brand-secondary: #e5692e;
--brand-accent:    #f6c445;
--brand-ink:       #13293d;  /* text */
--brand-surface:   #fffaf3;  /* background */
```
All shades (50–900), hovers, tints and the text color on top of each brand color
are calculated automatically. Use them in Tailwind as
`bg-primary`, `text-primary-700`, `bg-secondary-50`, `text-on-primary`, `bg-accent` etc.

## Where things live
- `lib/site.ts` – name, address, phones, email, map, team roles, therapies, nav, image URLs
- `data/content.ts` – all 6 programmes, 20 service pages and blog posts (generated from the old site)
- `app/[locale]/` – pages (home, about, services, category, service detail, blog, gallery, contact, appointment)
- `app/api/enquiry/route.ts` – form handler (connect email/SMS here before go-live)
- `next.config.ts` – 301 redirects from every old URL to the new one

## Languages (English + বাংলা)
- English is the default at `/`, Bangla lives at `/bn` (e.g. `/bn/about`). `proxy.ts` rewrites `/…` to `/en/…` internally and redirects `/en/…` back to `/…`.
- UI text: `i18n/en.ts` and `i18n/bn.ts` (same shape — TypeScript flags a missing key). Use `{placeholders}` + `fmt()` for dynamic values.
- Programme / service content: English in `data/content.ts`, Bangla translation in `data/content.bn.ts` (keyed by slug, same block order).
- Blog posts: Bangla original in `data/content.ts`, English translation in `data/posts.en.ts`.
- Always read content through `getContent(locale)` (`lib/content.ts`); link with `localePath(locale, "/about")` (server) or `useLp()` (client).
- Adding a language later: add it to `i18n/config.ts`, create a dictionary + translations, and register it in `i18n/index.ts`.
- After adding a new service/post: add its Bangla (or English) translation too; otherwise that language falls back to the original text.

## Before go-live
1. Download images from the old server into `/public/images` and update URLs in `lib/site.ts` / `data/content.ts`.
2. Connect the enquiry API to email (Resend / SMTP) or their admin.
3. Confirm opening hours, social links, doctor/team profiles and testimonials with the client.

## Database, admin panel, chat & analytics

The public pages work without a database, but the blog, appointment requests, live chat,
analytics and the admin panel need **PostgreSQL**.

### First-time setup

1. Create a Postgres database (free option: [Neon](https://neon.tech)) and put its connection
   string in `.env` as `DATABASE_URL` (see `.env.example`).
2. Set `NEXTAUTH_SECRET` (`openssl rand -base64 32`) and, for the seeded admin,
   `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (min 12 characters).
3. Create the tables and the admin account + starter blog posts:

   ```bash
   npm install
   npm run db:setup      # = prisma migrate deploy + prisma db seed
   npm run dev
   ```

4. Sign in at **/auth/signin** → you land in **/admin**.

`npm run db:seed` is safe to repeat: it never overwrites blog posts you edited, promotes the
admin email to ADMIN if needed, and only resets the password when `SEED_ADMIN_PASSWORD` is set.
In production the seed refuses to run without `SEED_ADMIN_PASSWORD`.

### What is where

| Feature | Public | Admin |
| --- | --- | --- |
| Appointment & contact forms → saved in `enquiries` | `/appointment`, `/contact` | `/admin/enquiries` (status, notes, call/WhatsApp) |
| Live chat (bubble on every page, HTTP polling – works on Vercel) | bottom-right bubble | `/admin/chat` |
| Blog (database, rich-text editor, image upload) | `/blog`, `/blog/<slug>` | `/admin/blog` |
| Analytics (page views, sources, devices, locations) | tracked automatically | `/admin` dashboard |
| WhatsApp button (number in `lib/site.ts` → `whatsapp`) | bottom-left button | – |

Notes
- Blog posts are single-language: the starter data has an English and a Bangla version of the
  inauguration post. Write new posts in whichever language you want; they show on both `/blog` and `/bn/blog`.
- Uploaded images are written to `public/uploads` (admin only). On serverless hosts with a read-only
  disk, paste an image URL instead or move uploads to object storage.
- The staff panel (`/admin`, `/auth`) is English only and has its own root layout (`app/(panel)`);
  the public site lives in `app/(site)/[locale]`.
- Files that came from another project and don't apply here (pricing, demo bookings) were moved to `_unused/`.
