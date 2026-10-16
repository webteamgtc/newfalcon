# Golden Falcon Night

A Next.js 14 (App Router) site for the Golden Falcon Night awards gala, with full English/Arabic
multi-language support (RTL for Arabic) powered by `next-intl`.

## Getting started

```bash
npm install
npm run dev
```

Visit:
- http://localhost:3000/en — English
- http://localhost:3000/ar — Arabic (RTL)

Visiting `/` redirects to the default locale (`en`).

## Project structure

```
messages/
  en.json          <- ALL site copy lives here. Edit this file to change any text.
  ar.json          <- Arabic translation, same structure as en.json.

src/
  app/
    [locale]/
      layout.tsx       <- Root layout per locale (sets <html lang dir>, header/footer)
      page.tsx          <- Home page (composes all homepage sections)
      gallery/page.tsx
      agenda/page.tsx
      guest/page.tsx
      media/page.tsx
      ticket/page.tsx
      policy/page.tsx
    globals.css         <- Fonts, color tokens, RTL helper classes
  components/
    SiteHeader.tsx      <- Nav + language switcher
    SiteFooter.tsx
    PageHeader.tsx       <- Shared hero header for sub-pages
    LanguageSwitcher.tsx
    home/                <- One component per homepage section
      Hero.tsx
      HistorySection.tsx
      GuestsSection.tsx
      TicketCtaSection.tsx
      AwardsSection.tsx
      MediaPartnersSection.tsx
      FaqSection.tsx
      FooterCtaSection.tsx
  i18n/
    routing.ts           <- Locale list + navigation helpers
    request.ts           <- Loads the right messages/*.json per request
  middleware.ts           <- Locale detection/redirect
```

## Editing content

Everything text-related lives in `messages/en.json` (and its Arabic counterpart
`messages/ar.json`). To change a heading, button label, FAQ answer, award name, etc.,
edit the JSON — no component code needs to change.

If you add a new key to `en.json`, add the matching key to `ar.json` too (same path),
otherwise the Arabic page will fall back to missing-message behavior for that key.

## Adding real images

The Figma design uses several photographs (trophy, guest portraits, Dubai skyline,
media partner event photo, award medallions). Since those assets weren't available as
exported files, this build uses elegant CSS/SVG placeholders in their place so the
layout and spacing are accurate.

To swap in the real images:

1. Export the images from Figma (right-click a layer → **Export**) as `.jpg`/`.png`/`.webp`.
2. Drop them into `public/images/`.
3. Replace the placeholder `<div>`/`<svg>` blocks with Next.js `<Image>` components, e.g.:

   ```tsx
   import Image from "next/image";

   <Image src="/images/trophy.png" alt="Golden Falcon trophy" fill className="object-cover" />
   ```

Placeholder locations to update:
- `src/components/home/Hero.tsx` — trophy illustration
- `src/components/home/HistorySection.tsx` — history/gallery photo
- `src/components/home/GuestsSection.tsx` — guest portrait photos
- `src/components/home/AwardsSection.tsx` — trophy detail photo
- `src/components/home/MediaPartnersSection.tsx` — event video thumbnail
- `src/app/[locale]/gallery/page.tsx` — gallery grid photos
- `src/app/[locale]/media/page.tsx` — media grid photos

## Adding another language

1. Add the locale code to `src/i18n/routing.ts`'s `locales` array.
2. Create `messages/<code>.json` with the same keys as `en.json`.
3. If the language is right-to-left, add it to the `dir === "rtl"` check in
   `src/app/[locale]/layout.tsx`.

## Fonts

- Latin: **Playfair Display** (headings) + **Jost** (body)
- Arabic: **Amiri** (headings) + **IBM Plex Sans Arabic** (body)

Loaded via Google Fonts in `src/app/globals.css`.

## Build

```bash
npm run build
npm run start
```

## Book Your Seat registration (Golden Falcon Awards 2026)

Registration-only pages with email OTP verification:

| Page | Passport | Companion | MongoDB collection |
|---|---|---|---|
| `/book-your-seat/international-employee` | Yes | Yes | `seat_international_employee` |
| `/book-your-seat/uae-employee` | No | No | `staff_registration` (shared with the existing staff form) |
| `/book-your-seat/vip` | Yes | Yes | `seat_vip` |
| `/book-your-seat/media-partners` | Yes | Yes | `seat_media_partner` |

- `/book-your-seat` is the category picker; `/book-your-seat/thank-you` is shown after submitting.
- Category rules live in `src/lib/seatBooking/categories.ts`; copy is under `seatBooking` in `messages/*.json`.
- APIs: `POST /api/seat-booking/send-otp`, `POST /api/seat-booking/verify-otp`, `POST /api/seat-booking/[category]`.
  The submit API only accepts emails verified by OTP (signed proof token, 45 min) and checks file signatures.
- Collection names can be overridden with `MONGODB_SEAT_INTL_EMPLOYEE_COLLECTION`, `MONGODB_SEAT_UAE_EMPLOYEE_COLLECTION`,
  `MONGODB_SEAT_VIP_COLLECTION`, `MONGODB_SEAT_MEDIA_PARTNER_COLLECTION`. A unique index on `email` is created automatically.
- Passport files go to the existing S3 bucket/prefix (`AWS_S3_PASSPORT_PREFIX`).
- Rate limits are in-memory per server process; use Redis if you run more than one instance.
