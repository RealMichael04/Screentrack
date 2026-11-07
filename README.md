# ReelGuide

A one-page concept landing page for **ReelGuide**, an all-in-one movie and TV companion: track what you watch, get personalized recommendations, follow franchises in any viewing order, and keep an entertainment calendar.

Created by Michael Richardson.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploy to Vercel

Push this folder to a GitHub repository, then import it at vercel.com/new. Vercel detects Next.js automatically, so no extra configuration is needed. Or use the CLI: `npx vercel`.

## Project structure

```
app/
  layout.js        fonts, metadata
  icon.svg         favicon
  page.js          assembles the sections
  globals.css      all styling (dark cinematic theme, responsive rules)
components/
  Nav, Hero, Features, HowItWorks, Track, Updates,
  Recommendations, Franchise, Calendar, Creator, Footer
  Logo.js          clapperboard-and-path logo
  Poster.js        code-generated poster artwork
  Reveal.js        scroll-in animation wrapper
data/
  titles.js        fictional sample titles and poster palettes
  franchise.js     Star Wars viewing-order example
```

All titles, posters, notifications and dates are sample data. No live data sources are connected.

## Sign-in (Neon Auth)

Accounts use [Neon Auth](https://neon.com/docs/auth). Pages: `/auth/sign-up`, `/auth/sign-in`, `/account` (protected).

1. In the [Neon Console](https://console.neon.tech), open your project → **Auth** → **Enable Auth**, then copy the **Auth URL**.
2. Paste it into `.env.local` as `NEON_AUTH_BASE_URL` (see `.env.example`). `NEON_AUTH_COOKIE_SECRET` is any random 32+ character string.
3. Restart `npm run dev`.
4. On Vercel, add the same two variables under **Project → Settings → Environment Variables**, then redeploy.

Until the keys are added, the site still works and the sign-in pages show a "coming soon" notice.
