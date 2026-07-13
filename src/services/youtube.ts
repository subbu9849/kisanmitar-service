/* ═══════════════════════════════════════════════════════════
   YouTube Data API v3 integration — Learning Center
   Requires VITE_YOUTUBE_API_KEY (see .env.example).
   Falls back to a small set of verified static videos if no
   key is configured, so the section never silently breaks.
   ═══════════════════════════════════════════════════════════ */

export interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: string;
  channelName: string;
  category: VideoCategory;
  description: string;
  views: string;
}

export type VideoCategory =
  | "Organic Farming"
  | "Irrigation & Water"
  | "Pest Management"
  | "Modern Techniques"
  | "Crop Management"
  | "Soil Health"
  | "Government Schemes"
  | "Sustainable Farming"
  | "Market & Business"
  | "Weather & Climate";

export const ALL_CATEGORIES: VideoCategory[] = [
  "Organic Farming",
  "Irrigation & Water",
  "Pest Management",
  "Modern Techniques",
  "Crop Management",
  "Soil Health",
  "Government Schemes",
  "Sustainable Farming",
  "Market & Business",
  "Weather & Climate",
];

/** Search query used per category — tuned for relevant Indian farming results */
const CATEGORY_QUERY: Record<VideoCategory, string> = {
  "Organic Farming": "organic farming India techniques",
  "Irrigation & Water": "drip irrigation farming India",
  "Pest Management": "crop pest control India farming",
  "Modern Techniques": "modern farming technology India",
  "Crop Management": "crop management guide India farmer",
  "Soil Health": "soil health farming India",
  "Government Schemes": "farmer government scheme India",
  "Sustainable Farming": "sustainable farming India",
  "Market & Business": "agriculture market price India farmer",
  "Weather & Climate": "farming weather climate India",
};

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined;
const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";

/** A handful of verified, real videos used only if no API key is configured. */
const FALLBACK_VIDEOS: YouTubeVideo[] = [
  {
    videoId: "m3d7X6UluNk",
    title: "Zero Budget Natural Farming (ZBNF) | Subhash Palekar",
    thumbnail: "https://img.youtube.com/vi/m3d7X6UluNk/hqdefault.jpg",
    duration: "",
    channelName: "YouTube",
    category: "Organic Farming",
    description: "Zero budget natural farming explained — a chemical-free method drawing on traditional Indian practices.",
    views: "",
  },
  {
    videoId: "w1In3Hp1qaE",
    title: "Drip Irrigation Layout for Farming in India",
    thumbnail: "https://img.youtube.com/vi/w1In3Hp1qaE/hqdefault.jpg",
    duration: "",
    channelName: "YouTube",
    category: "Irrigation & Water",
    description: "A practical look at planning and laying out a drip irrigation system for a farm.",
    views: "",
  },
];

const parseDuration = (iso: string): string => {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const [, h, m, s] = match;
  const hh = h ? `${h}:` : "";
  const mm = h ? (m ?? "0").padStart(2, "0") : (m ?? "0");
  const ss = (s ?? "0").padStart(2, "0");
  return `${hh}${mm}:${ss}`;
};

const formatViews = (count: string): string => {
  const n = parseInt(count, 10);
  if (Number.isNaN(n)) return "";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
};

/** Cache search results in-memory per query string for the session */
const cache = new Map<string, YouTubeVideo[]>();

async function searchYouTube(query: string, category: VideoCategory): Promise<YouTubeVideo[]> {
  if (!API_KEY) return FALLBACK_VIDEOS;

  const cacheKey = `${category}::${query}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  try {
    const searchParams = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: "9",
      relevanceLanguage: "en",
      regionCode: "IN",
      safeSearch: "strict",
      key: API_KEY,
    });
    const searchRes = await fetch(`${SEARCH_URL}?${searchParams}`);
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    const ids: string[] = (searchData.items ?? []).map((item: { id: { videoId: string } }) => item.id.videoId).filter(Boolean);
    if (ids.length === 0) return [];

    const detailsParams = new URLSearchParams({
      part: "snippet,contentDetails,statistics",
      id: ids.join(","),
      key: API_KEY,
    });
    const detailsRes = await fetch(`${VIDEOS_URL}?${detailsParams}`);
    if (!detailsRes.ok) return [];
    const detailsData = await detailsRes.json();

    const videos: YouTubeVideo[] = (detailsData.items ?? []).map((item: {
      id: string;
      snippet: { title: string; channelTitle: string; description: string; thumbnails: { high?: { url: string }; medium?: { url: string } } };
      contentDetails: { duration: string };
      statistics: { viewCount: string };
    }) => ({
      videoId: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.medium?.url ?? `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`,
      duration: parseDuration(item.contentDetails.duration),
      channelName: item.snippet.channelTitle,
      category,
      description: item.snippet.description,
      views: formatViews(item.statistics.viewCount),
    }));

    cache.set(cacheKey, videos);
    return videos;
  } catch {
    return [];
  }
}

/** Get videos for a category (live API call, or fallback if no key configured) */
export async function getVideosByCategory(category: VideoCategory): Promise<YouTubeVideo[]> {
  return searchYouTube(CATEGORY_QUERY[category], category);
}

/** Search videos by free-text query, optionally scoped to a category */
export async function searchVideos(query: string, category?: VideoCategory): Promise<YouTubeVideo[]> {
  const effectiveCategory = category ?? "Modern Techniques";
  const searchQuery = category ? `${query} ${CATEGORY_QUERY[category]}` : `${query} farming India`;
  return searchYouTube(searchQuery, effectiveCategory);
}

/** Get a default mixed set of videos (first category as a sensible default) */
export async function getAllVideos(): Promise<YouTubeVideo[]> {
  return searchYouTube("farming techniques India agriculture", "Modern Techniques");
}

/** Get the YouTube watch URL */
export function getYouTubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** Get the YouTube embed URL */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
}
