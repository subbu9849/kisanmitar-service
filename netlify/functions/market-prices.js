/* ═══════════════════════════════════════════════════════════
   Netlify Function: /api/market-prices
   Proxies the official data.gov.in Agmarknet "Current Daily
   Price of Various Commodities from Various Markets (Mandi)"
   dataset, so the API key stays server-side.

   Set DATA_GOV_IN_API_KEY in Netlify environment variables
   (Site settings -> Environment variables). Get a free key at
   https://data.gov.in/user/me/apis after signing up.
   ═══════════════════════════════════════════════════════════ */

const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const apiKey = process.env.DATA_GOV_IN_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ configured: false, records: [] }),
    };
  }

  const params = event.queryStringParameters || {};
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
    const res = await fetch(url.toString());
    if (!res.ok) {
      return { statusCode: res.status, headers, body: JSON.stringify({ configured: true, records: [], error: "Upstream request failed" }) };
    }
    const data = await res.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ configured: true, records: data.records || [], total: data.total ?? null }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ configured: true, records: [], error: "Failed to reach data.gov.in" }),
    };
  }
};
