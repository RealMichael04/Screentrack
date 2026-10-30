# ScreenTrack

A one-page concept landing page for **ScreenTrack**, an all-in-one movie and TV companion: track what you watch, get personalized recommendations, follow franchises in any viewing order, and keep an entertainment calendar.

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
  page.js          assembles the sections
  globals.css      all styling (dark cinematic theme, responsive rules)
components/
  Nav, Hero, Features, HowItWorks, Track, Updates,
  Recommendations, Franchise, Calendar, Creator, Footer
  Poster.js        code-generated poster artwork
  Reveal.js        scroll-in animation wrapper
data/
  titles.js        fictional sample titles and poster palettes
  franchise.js     Star Wars viewing-order example
```

All titles, posters, notifications and dates are sample data. No live data sources are connected.
