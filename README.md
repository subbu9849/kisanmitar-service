# Kisan Mitra — Empowering Farmers Through Technology

A premium, interactive farmer services platform: weather intelligence, live market prices,
crop advisory, AI disease detection, a farmer services & rental marketplace, government
schemes, and a learning center — built with React, TypeScript, Vite, and Tailwind CSS.

---

## What's real vs. sample data

This project is built so it **never breaks or shows fake-looking data** — every live-data
feature has a graceful fallback if its API key isn't configured yet, with an honest on-screen
notice instead of pretending to be live.

| Feature | Data source | Needs a key? |
|---|---|---|
| Market Price Dashboard | Live mandi prices from data.gov.in (Agmarknet) | Yes — `DATA_GOV_IN_API_KEY` |
| Learning Center | Live YouTube search | Yes — `VITE_YOUTUBE_API_KEY` |
| Marketplace photos | Real photos via Unsplash | Yes — `UNSPLASH_ACCESS_KEY` |
| AI Disease Detection | Gemini vision (Google AI, free tier) | Yes — `GEMINI_API_KEY` |
| Weather | Open-Meteo (no key required) | No |
| Marketplace listings | Curated AP/Telangana sample data + WhatsApp contact | No |

Without any keys, the site is fully functional to browse and demo — it just shows sample
data with a small notice instead of live data.

---

## 1. Local setup

```bash
npm install
```

Copy the example env file and fill in whichever keys you have:

```bash
cp .env.example .env
```

### Getting each key

**YouTube Data API key** (`VITE_YOUTUBE_API_KEY`)
1. https://console.cloud.google.com/ → create a new project
2. APIs & Services → Library → search "YouTube Data API v3" → Enable
3. APIs & Services → Credentials → + Create Credentials → API key
4. Restrict it: Application restrictions → Websites → your domain(s); API restrictions → YouTube Data API v3 only

**data.gov.in API key** (`DATA_GOV_IN_API_KEY`)
1. https://data.gov.in/ → Sign Up / Login
2. Search for "current daily price various commodities mandi"
3. Open that dataset → find the **API** tab on the dataset page → copy your key from there

**Unsplash Access Key** (`UNSPLASH_ACCESS_KEY`)
1. https://unsplash.com/developers → New Application
2. Accept terms → copy the **Access Key** (not the Secret Key)

**Gemini API key** (`GEMINI_API_KEY`) — free, no credit card required
1. https://aistudio.google.com/apikey → Get API Key → Create API Key
2. This uses `gemini-2.5-flash-lite`, which is free of charge on Google's free tier with generous daily limits

### Where each key goes

⚠️ **Important distinction:**
- `VITE_YOUTUBE_API_KEY` → goes in `.env`, exposed to the browser (fine for this API since it's domain-restricted)
- `DATA_GOV_IN_API_KEY`, `UNSPLASH_ACCESS_KEY`, `GEMINI_API_KEY` → **no `VITE_` prefix** — these stay server-side only, read by the Netlify Functions in `netlify/functions/`, never sent to the browser

Your local `.env` should look like:
```
VITE_YOUTUBE_API_KEY=AIzaSy...
DATA_GOV_IN_API_KEY=579b464d...
UNSPLASH_ACCESS_KEY=abc123...
GEMINI_API_KEY=AIzaSy...
```

### Running locally

Plain `npm run dev` (Vite only) does **not** serve the `/api/*` Netlify Functions — you'll
see sample-data fallbacks for everything even with keys set. To test the real integrations
locally, install the Netlify CLI and use it instead:

```bash
npm install -g netlify-cli
npm run dev:netlify
```

This runs Vite **and** the serverless functions together, matching production behavior.

---

## 2. Push to GitHub

If this is a brand-new repo:

```bash
cd KISANMITAR
git init
git add .
git commit -m "Initial commit: Kisan Mitra with marketplace, live data, and AI disease detection"
```

Create an empty repo on GitHub (https://github.com/new — don't initialize it with a README,
since you already have one), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

If you already have a GitHub repo for this project and are just updating it:

```bash
git add .
git commit -m "Add live marketplace, real market/video data, and AI disease detection"
git push
```

Your `.env` file will **not** be pushed (it's gitignored) — that's intentional, keys never
belong in git history.

---

## 3. Deploy to Netlify

**Option A — connect GitHub (recommended, auto-deploys on every push):**
1. https://app.netlify.com/ → Add new site → Import an existing project
2. Connect your GitHub account → select this repo
3. Build settings should auto-detect from `netlify.toml` (build command `npm run build`, publish directory `dist`) — confirm and deploy

**Option B — manual deploy:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Add your keys to Netlify

Whichever way you deployed, the live site still needs its keys set in Netlify itself
(your local `.env` only affects your machine):

Netlify dashboard → your site → **Site configuration → Environment variables** → **Add a variable**, one at a time:
- `VITE_YOUTUBE_API_KEY`
- `DATA_GOV_IN_API_KEY`
- `UNSPLASH_ACCESS_KEY`
- `GEMINI_API_KEY`

Then **trigger a redeploy** (Deploys tab → Trigger deploy → Deploy site) — environment
variable changes only take effect on the next build.

---

## Project structure

```
src/
  pages/Index.tsx              Main single-page layout (all sections)
  components/
    FarmerMarketplace.tsx      Machinery/Tools/Inputs/Workers marketplace
    Navbar.tsx
  services/
    youtube.ts                 Learning Center — live YouTube search
    market.ts                  Market Price Dashboard — live Agmarknet data
    marketplace.ts              Marketplace mock listings (AP/Telangana)
    diseaseDetection.ts         AI Disease Detection — calls Gemini vision (free tier)
    weather.ts                  Weather (Open-Meteo, no key needed)
    soil.ts

netlify/functions/
  market-prices.js             Proxies data.gov.in (keeps API key server-side)
  marketplace-images.js        Proxies Unsplash (keeps Access Key server-side)
  disease-detection.js          Proxies Gemini API (keeps API key server-side, free tier)

netlify.toml                   Build config + /api/* → functions redirect
.env.example                   Documents every required key
```

## Notes on the AI Disease Detection feature

This uses Google's Gemini general vision capability with a constrained prompt — it is **not** a
specialist-trained plant pathology model. It's framed throughout the UI as a helpful first
look, not a certified diagnosis, and always recommends confirming with a local agricultural
extension officer before acting on the result (especially before applying any pesticide or
fungicide).
