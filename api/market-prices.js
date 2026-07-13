/* ═══════════════════════════════════════════════════════════
   Vercel Serverless Function: /api/market-prices
   Proxies the official data.gov.in Agmarknet "Current Daily
   Price of Various Commodities from Various Markets (Mandi)"
   dataset, so the API key stays server-side.

   Set DATA_GOV_IN_API_KEY in Vercel's Project Settings ->
   Environment Variables. Get a free key at
   https://data.gov.in/user/me/apis after signing up.
   ═══════════════════════════════════════════════════════════ */

const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const apiKey = process.env.DATA_GOV_IN_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ configured: false, records: [] });
  }

  const params = req.query || {};
  const limit = Math.min(parseInt(params.limit, 10) || 50, 100);
  const offset = parseInt(params.offset, 10) || 0;

  const url = new URL(BASE_URL);
  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  // Optional filters supported by the dataset
  ["state", "district", "market", "commodity"].forEach((field) => {
    if (params[field]) url.searchParams.set(`filters[${field}]`, params[field]);
  });

  try {
    const upstreamRes = await fetch(url.toString());
    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({ configured: true, records: [], error: "Upstream request failed" });
    }
    const data = await upstreamRes.json();
    return res.status(200).json({ configured: true, records: data.records || [], total: data.total ?? null });
  } catch (err) {
    return res.status(502).json({ configured: true, records: [], error: "Failed to reach data.gov.in" });
  }
}
