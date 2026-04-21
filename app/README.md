# German Brawl

Aplicație web PWA pentru învățat vocabular german (Fit in Deutsch 1), inspirată din Brawl Stars.

**URL live:** https://german-brawl.vercel.app

## Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS v4 + Framer Motion
- Zustand (state management)
- PWA (offline, installabil pe telefon)

## Funcționalități

- Battle cu timer 20s, Der/Die/Das, feedback Levenshtein
- 3 moduri: DE→RO, RO→DE, Mix
- 6 Brawleri cu categorii vocabular distincte (293 cuvinte din Fit in Deutsch 1)
- Sistem trofee, XP, upgrade brawleri, Brawl Pass, Quest-uri
- Star Drops post-battle cu animații (5 rarități)
- Audio (Web Audio API) + haptics
- Trophy Road cu recompense

## Integrări

### Vercel (deploy)
- Deploy automat din CLI: `npx vercel --prod`
- Alias permanent: `german-brawl.vercel.app`
- Routing SPA via `vercel.json`

### PostHog (analytics)
- Regiune: EU (`eu.i.posthog.com`)
- Snippet HTML în `index.html` (metodă oficială)
- Evenimente custom trackuite:
  - `battle_started` — brawlerId, gameMode
  - `battle_completed` — brawlerId, gameMode, score, total, accuracy
  - `battle_abandoned` — brawlerId, wordsAnswered
  - `word_wrong` — wordId, german, gameMode
  - `upgrade_clicked` — brawlerId, fromLevel
  - `screen_view` — screen (lobby/battle/shop/brawlers/...)
- Helper: `src/engine/analytics.ts`

### Sentry (error tracking)
- Regiune: EU (`ingest.de.sentry.io`)
- SDK: `@sentry/react` cu `browserTracingIntegration`
- Trimite automat stack trace la orice eroare JS
- Init în `src/main.tsx`

### Feedback
- Buton 💬 în lobby (dreapta), vizibil când `VITE_FEEDBACK_URL` e setat
- Deschide Google Form într-un tab nou

## Env vars (Vercel)

```
VITE_POSTHOG_KEY       # PostHog project API key (phc_...)
VITE_POSTHOG_HOST      # https://eu.i.posthog.com
VITE_SENTRY_DSN        # Sentry DSN (https://...@....ingest.de.sentry.io/...)
VITE_FEEDBACK_URL      # Link Google Form pentru feedback utilizatori
```

Copiază `.env.example` în `.env` și completează valorile pentru dev local.

## Dezvoltare locală

```bash
npm install --legacy-peer-deps
npm run dev
```

## Deploy

```bash
npm run build       # verifică build local
npx vercel --prod   # deploy în producție
```
