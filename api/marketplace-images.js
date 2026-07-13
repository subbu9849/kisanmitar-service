/* ═══════════════════════════════════════════════════════════
   Vercel Serverless Function: /api/marketplace-images
   Proxies the Unsplash API so the Access Key stays server-side
   (Unsplash's API guidelines require this for client-side use).

   Set UNSPLASH_ACCESS_KEY in Vercel's Project Settings ->
   Environment Variables. Get a free key at
   https://unsplash.com/developers (New Application).
   ═══════════════════════════════════════════════════════════ */

const SEARCH_URL = "https://api.unsplash.com/search/photos";

/** Small in-memory cache (resets on cold start) to reduce repeat calls */
const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return res.status(200).json({ configured: false, results: [] });
  }

  const query = (req.query || {}).query;
  if (!query) {
    return res.status(400).json({ configured: true, results: [], error: "Missing query parameter" });
  }

  const cacheKey = query.toLowerCase().trim();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
    return res.status(200).json({ configured: true, results: cached.results });
  }

  try {
    const url = new URL(SEARCH_URL);
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "3");
    url.searchParams.set("orientation", "squarish");
    url.searchParams.set("content_filter", "high");

    const upstreamRes = await fetch(url.toString(), {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });
    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({ configured: true, results: [], error: "Upstream request failed" });
    }
    const data = await upstreamRes.json();
    const results = (data.results || []).map((p) => ({
      id: p.id,
      url: p.urls?.regular,
      thumbUrl: p.urls?.small,
      alt: p.alt_description || query,
      photographer: p.user?.name,
      photographerUrl: p.user?.links?.html,
    }));

    cache.set(cacheKey, { time: Date.now(), results });
    return res.status(200).json({ configured: true, results });
  } catch (err) {
    return res.status(502).json({ configured: true, results: [], error: "Failed to reach Unsplash" });
  }
}
