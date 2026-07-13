/* ═══════════════════════════════════════════════════════════
   Netlify Function: /api/marketplace-images
   Proxies the Unsplash API so the Access Key stays server-side
   (Unsplash's API guidelines require this for client-side use).

   Set UNSPLASH_ACCESS_KEY in Netlify environment variables
   (Site settings -> Environment variables). Get a free key at
   https://unsplash.com/developers (New Application).
   ═══════════════════════════════════════════════════════════ */

const SEARCH_URL = "https://api.unsplash.com/search/photos";

/** Small in-memory cache (resets on cold start) to reduce repeat calls */
const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return { statusCode: 200, headers, body: JSON.stringify({ configured: false, results: [] }) };
  }

  const query = (event.queryStringParameters || {}).query;
  if (!query) {
    return { statusCode: 400, headers, body: JSON.stringify({ configured: true, results: [], error: "Missing query parameter" }) };
  }

  const cacheKey = query.toLowerCase().trim();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
    return { statusCode: 200, headers, body: JSON.stringify({ configured: true, results: cached.results }) };
  }

  try {
    const url = new URL(SEARCH_URL);
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "3");
    url.searchParams.set("orientation", "squarish");
    url.searchParams.set("content_filter", "high");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });
    if (!res.ok) {
      return { statusCode: res.status, headers, body: JSON.stringify({ configured: true, results: [], error: "Upstream request failed" }) };
    }
    const data = await res.json();
    const results = (data.results || []).map((p) => ({
      id: p.id,
      url: p.urls?.regular,
      thumbUrl: p.urls?.small,
      alt: p.alt_description || query,
      photographer: p.user?.name,
      photographerUrl: p.user?.links?.html,
    }));

    cache.set(cacheKey, { time: Date.now(), results });
    return { statusCode: 200, headers, body: JSON.stringify({ configured: true, results }) };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ configured: true, results: [], error: "Failed to reach Unsplash" }) };
  }
};
