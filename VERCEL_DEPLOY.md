# Deploying Kisan Mitra to Vercel

This project is a Vite + React SPA with 4 serverless API routes in `/api`
(converted from the original Netlify Functions). It's ready to deploy to
Vercel as-is — no extra build configuration needed beyond the environment
variables below.

## What changed for Vercel

- Added `/api/*.js` — Vercel serverless functions (Node.js runtime),
  converted 1:1 from `netlify/functions/*.js`. Same behavior, same
  `/api/...` paths the frontend already calls.
- Added `vercel.json` — tells Vercel to serve `index.html` for every
  non-API route (required for React Router's client-side routing) and
  sets the build command/output folder explicitly.
- Added `.gitignore` — the project didn't have one; without it,
  `node_modules` and `.env` could get pushed to GitHub.
- Removed `bun.lock` — having both `bun.lock` and `package-lock.json`
  can make Vercel guess the wrong package manager. `package-lock.json`
  (npm) is now the only lockfile.
- Fixed a CSS bug in `src/index.css` — the Google Fonts `@import` was
  placed after `@tailwind` directives, which violates the CSS spec
  (`@import` must be first) and could cause the font to silently fail
  to load in some browsers.
- `netlify.toml` and `netlify/functions/` are left in place but are
  unused on Vercel — safe to delete, or keep if you also want to
  deploy the same repo to Netlify later.

## Step-by-step deployment

### 1. Push the project to GitHub
```bash
cd KISANMITAR
git init
git add .
git commit -m "Ready for Vercel deployment"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2. Import the project on Vercel
1. Go to https://vercel.com/new
2. Sign in (GitHub login is easiest) and click **Import** next to your repo.
3. Vercel auto-detects **Vite** as the framework. Leave the defaults:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 3. Add environment variables
Before clicking Deploy, expand **Environment Variables** and add whichever
of these you have (the app works without any of them — features just
fall back to sample data with an on-screen notice):

| Variable | Used by | Prefix rule |
|---|---|---|
| `VITE_YOUTUBE_API_KEY` | Learning Center videos | Client-side (`VITE_` required) |
| `VITE_DATA_GOV_IN_API_KEY` | (legacy, unused directly) | — |
| `DATA_GOV_IN_API_KEY` | `/api/market-prices` | Server-side only, **no** `VITE_` prefix |
| `UNSPLASH_ACCESS_KEY` | `/api/marketplace-images` | Server-side only, **no** `VITE_` prefix |
| `GEMINI_API_KEY` | `/api/disease-detection`, `/api/ai-assistant` | Server-side only, **no** `VITE_` prefix |
| `VITE_EMAILJS_SERVICE_ID` | Civic complaint emails | Client-side |
| `VITE_EMAILJS_TEMPLATE_ID` | Civic complaint emails | Client-side |
| `VITE_EMAILJS_PUBLIC_KEY` | Civic complaint emails | Client-side |
| `VITE_CIVIC_AUTHORITY_EMAIL` | Civic complaint emails | Client-side |

Apply each variable to **Production, Preview, and Development** unless you
have a reason not to.

> Note: `VITE_`-prefixed variables are baked into the client bundle at
> build time and are visible in the browser — that's expected and fine
> for public API keys like the YouTube key. Never put `GEMINI_API_KEY`,
> `DATA_GOV_IN_API_KEY`, or `UNSPLASH_ACCESS_KEY` behind a `VITE_` prefix,
> or they'll leak to the browser.

### 4. Deploy
Click **Deploy**. Vercel will run `npm install`, then `npm run build`,
then publish `dist/` and the `/api` functions. First deploy takes ~1-2
minutes.

### 5. Verify it works
- Visit the assigned `*.vercel.app` URL.
- Refresh on a non-root route (e.g. reload the page after navigating) —
  it should NOT show a 404. This confirms the `vercel.json` rewrite is
  working.
- Open the AI Assistant chat widget and Disease Detection page — if
  `GEMINI_API_KEY` is set, they should return real responses instead of
  the "not configured" notice.

### 6. Updating environment variables later
Project → Settings → Environment Variables → add/edit → then
**Deployments → ⋯ → Redeploy** (env var changes require a redeploy to
take effect).

### 7. Custom domain (optional)
Project → Settings → Domains → add your domain and follow the DNS
instructions Vercel shows you.

## Local testing with `vercel dev` (optional)
```bash
npm i -g vercel
vercel dev
```
This runs both the Vite dev server and the `/api` functions locally the
same way they'll run in production, so you can test the Gemini/Unsplash/
data.gov.in integrations before deploying.
