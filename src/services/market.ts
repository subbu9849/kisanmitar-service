/* ═══════════════════════════════════════════════════════════
   Market Price Dashboard — live data
   Fetches real mandi prices from data.gov.in's Agmarknet dataset
   via /api/market-prices (a Netlify Function proxy — see
   netlify/functions/market-prices.js).

   Falls back to a small static sample if no key is configured
   server-side, so local dev / demos never silently break.
   ═══════════════════════════════════════════════════════════ */

export interface MarketEntry {
  crop: string;
  market: string;
  price: number;
  unit: string;
  change: number | null;
  volume: string;
  trend: "up" | "down" | "stable";
  category: CropCategory;
  state: string;
  lastUpdated: string;
}

export type CropCategory = "Grains" | "Vegetables" | "Fruits" | "Cash Crops" | "Pulses" | "Oilseeds" | "All Crops";

export const MARKET_CATEGORIES: CropCategory[] = [
  "All Crops",
  "Grains",
  "Vegetables",
  "Fruits",
  "Cash Crops",
  "Pulses",
  "Oilseeds",
];

export interface MarketInsight {
  label: string;
  value: string;
  change: string;
  color: string;
}

/** Maps raw Agmarknet commodity names to a broad crop category for filtering */
const CATEGORY_KEYWORDS: [RegExp, CropCategory][] = [
  [/wheat|rice|paddy|maize|bajra|jowar|barley|ragi/i, "Grains"],
  [/onion|potato|tomato|cauliflower|brinjal|chilli|cabbage|carrot|peas|okra|ladies\s?finger/i, "Vegetables"],
  [/mango|banana|apple|pomegranate|grape|orange|papaya|guava/i, "Fruits"],
  [/sugarcane|cotton|tobacco|jute/i, "Cash Crops"],
  [/groundnut|mustard|soybean|sunflower|sesame|til|copra|coconut/i, "Oilseeds"],
  [/tur|arhar|moong|gram|chana|urad|masur|lentil|dal/i, "Pulses"],
];

const categorize = (commodity: string): CropCategory => {
  for (const [pattern, category] of CATEGORY_KEYWORDS) {
    if (pattern.test(commodity)) return category;
  }
  return "Grains";
};

type RawRecord = {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
};

/** Small static fallback so the dashboard never renders empty if no API key is set */
const FALLBACK_DATA: MarketEntry[] = [
  { crop: "Wheat", market: "Azadpur Mandi, Delhi", price: 2450, unit: "₹/qt", change: null, volume: "—", trend: "stable", category: "Grains", state: "Delhi", lastUpdated: "" },
  { crop: "Onion", market: "Lasalgaon Mandi, Maharashtra", price: 1800, unit: "₹/qt", change: null, volume: "—", trend: "stable", category: "Vegetables", state: "Maharashtra", lastUpdated: "" },
  { crop: "Cotton", market: "Rajkot Mandi, Gujarat", price: 7200, unit: "₹/qt", change: null, volume: "—", trend: "stable", category: "Cash Crops", state: "Gujarat", lastUpdated: "" },
];

let configuredCache: boolean | null = null;

async function fetchRecords(params: Record<string, string> = {}): Promise<{ configured: boolean; records: RawRecord[] }> {
  try {
    const qs = new URLSearchParams({ limit: "100", ...params });
    const res = await fetch(`/api/market-prices?${qs.toString()}`);
    if (!res.ok) return { configured: configuredCache ?? false, records: [] };
    const data = await res.json();
    configuredCache = !!data.configured;
    return { configured: data.configured, records: data.records ?? [] };
  } catch {
    return { configured: configuredCache ?? false, records: [] };
  }
}

const toEntry = (r: RawRecord): MarketEntry => {
  const modal = parseFloat(r.modal_price) || 0;
  return {
    crop: r.variety && r.variety !== r.commodity ? `${r.commodity} (${r.variety})` : r.commodity,
    market: `${r.market}, ${r.state}`,
    price: modal,
    unit: "₹/qt",
    change: null, // Agmarknet's current-price endpoint has no day-over-day delta
    volume: "—",
    trend: "stable",
    category: categorize(r.commodity),
    state: r.state,
    lastUpdated: r.arrival_date,
  };
};

/** Search and filter live market data. Always async — fetches from the proxy. */
export async function getMarketData(params: {
  query?: string;
  category?: CropCategory;
}): Promise<{ entries: MarketEntry[]; insights: MarketInsight[]; configured: boolean }> {
  const queryParams: Record<string, string> = {};
  if (params.query) queryParams.commodity = params.query;

  const { configured, records } = await fetchRecords(queryParams);

  let entries = records.length > 0 ? records.map(toEntry) : (configured ? [] : FALLBACK_DATA);

  if (params.category && params.category !== "All Crops") {
    entries = entries.filter((e) => e.category === params.category);
  }

  const topByPrice = [...entries].sort((a, b) => b.price - a.price)[0];

  const insights: MarketInsight[] = [
    {
      label: "Markets Reporting",
      value: `${new Set(entries.map((e) => e.market)).size} Markets`,
      change: configured ? "Live from Agmarknet" : "Sample data",
      color: "text-primary",
    },
    {
      label: "Highest Price Today",
      value: topByPrice?.crop ?? "N/A",
      change: topByPrice ? `${topByPrice.price.toLocaleString()} ${topByPrice.unit}` : "N/A",
      color: "text-secondary",
    },
    {
      label: "Commodities Tracked",
      value: `${new Set(entries.map((e) => e.crop)).size}`,
      change: configured ? "Updated daily" : "Configure API key for live data",
      color: "text-green-500",
    },
  ];

  return { entries, insights, configured };
}

/**
 * Illustrative price movement for the trend chart — NOT real historical
 * data (Agmarknet's current-price endpoint doesn't expose day-by-day
 * history). Clearly labeled as simulated wherever it's rendered.
 */
export function getIllustrativePriceTrend(basePrice: number, days = 14): { date: string; price: number }[] {
  let seed = Math.round(basePrice) % 97;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: days }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const noise = (rand() - 0.5) * basePrice * 0.04;
    const price = Math.max(1, Math.round(basePrice + noise));
    return { date: date.toISOString().split("T")[0], price };
  });
}
