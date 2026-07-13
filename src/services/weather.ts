const GEOCODING_BASE = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_BASE = "https://api.open-meteo.com/v1/forecast";

export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  country_code: string;
}

export interface WeatherCurrent {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  condition: string;
  icon: WeatherIcon;
}

export interface WeatherDay {
  date: string;
  dayName: string;
  high: number;
  low: number;
  rainProb: number;
  weatherCode: number;
  condition: string;
  icon: WeatherIcon;
}

export type WeatherIcon = "sun" | "cloud" | "cloud-rain" | "cloud-drizzle" | "cloud-lightning" | "cloud-snow" | "fog";

export interface WeatherData {
  location: string;
  current: WeatherCurrent;
  forecast: WeatherDay[];
}

const WEATHER_CODES: Record<number, { condition: string; icon: WeatherIcon }> = {
  0: { condition: "Clear Sky", icon: "sun" },
  1: { condition: "Mainly Clear", icon: "sun" },
  2: { condition: "Partly Cloudy", icon: "cloud" },
  3: { condition: "Overcast", icon: "cloud" },
  45: { condition: "Foggy", icon: "fog" },
  48: { condition: "Depositing Rime Fog", icon: "fog" },
  51: { condition: "Light Drizzle", icon: "cloud-drizzle" },
  53: { condition: "Moderate Drizzle", icon: "cloud-drizzle" },
  55: { condition: "Dense Drizzle", icon: "cloud-drizzle" },
  56: { condition: "Light Freezing Drizzle", icon: "cloud-drizzle" },
  57: { condition: "Dense Freezing Drizzle", icon: "cloud-drizzle" },
  61: { condition: "Slight Rain", icon: "cloud-rain" },
  63: { condition: "Moderate Rain", icon: "cloud-rain" },
  65: { condition: "Heavy Rain", icon: "cloud-rain" },
  66: { condition: "Light Freezing Rain", icon: "cloud-rain" },
  67: { condition: "Heavy Freezing Rain", icon: "cloud-rain" },
  71: { condition: "Slight Snow", icon: "cloud-snow" },
  73: { condition: "Moderate Snow", icon: "cloud-snow" },
  75: { condition: "Heavy Snow", icon: "cloud-snow" },
  77: { condition: "Snow Grains", icon: "cloud-snow" },
  80: { condition: "Slight Rain Showers", icon: "cloud-rain" },
  81: { condition: "Moderate Rain Showers", icon: "cloud-rain" },
  82: { condition: "Violent Rain Showers", icon: "cloud-rain" },
  85: { condition: "Slight Snow Showers", icon: "cloud-snow" },
  86: { condition: "Heavy Snow Showers", icon: "cloud-snow" },
  95: { condition: "Thunderstorm", icon: "cloud-lightning" },
  96: { condition: "Thunderstorm with Slight Hail", icon: "cloud-lightning" },
  99: { condition: "Thunderstorm with Heavy Hail", icon: "cloud-lightning" },
};

function getWeatherInfo(code: number): { condition: string; icon: WeatherIcon } {
  return WEATHER_CODES[code] ?? { condition: "Unknown", icon: "cloud" };
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Search locations by name using Open-Meteo Geocoding API */
export async function searchLocations(query: string): Promise<GeoLocation[]> {
  if (!query || query.length < 2) return [];

  const url = `${GEOCODING_BASE}?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Geocoding API error: ${res.status}`);
    const data = await res.json();

    if (!data.results) return [];

    return data.results.map(
      (r: {
        id: number;
        name: string;
        latitude: number;
        longitude: number;
        country: string;
        admin1?: string;
        country_code: string;
      }) => ({
        id: r.id,
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude,
        country: r.country,
        admin1: r.admin1,
        country_code: r.country_code,
      }),
    );
  } catch (err) {
    console.error("Location search failed:", err);
    return [];
  }
}

/** Fetch weather forecast from Open-Meteo */
export async function fetchWeather(lat: number, lon: number, locationName?: string): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "7",
  });

  const url = `${FORECAST_BASE}?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  const data = await res.json();

  const currentCode = data.current.weather_code;
  const currentInfo = getWeatherInfo(currentCode);

  const current: WeatherCurrent = {
    temperature: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    humidity: data.current.relative_humidity_2m,
    windSpeed: Math.round(data.current.wind_speed_10m),
    weatherCode: currentCode,
    condition: currentInfo.condition,
    icon: currentInfo.icon,
  };

  const forecast: WeatherDay[] = data.daily.time.map((date: string, i: number) => {
    const code = data.daily.weather_code[i];
    const info = getWeatherInfo(code);
    const dayDate = new Date(date + "T12:00:00");
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dayName: string;
    if (dayDate.toDateString() === today.toDateString()) {
      dayName = "Today";
    } else if (dayDate.toDateString() === tomorrow.toDateString()) {
      dayName = "Tomorrow";
    } else {
      dayName = DAY_NAMES[dayDate.getDay()];
    }

    return {
      date,
      dayName,
      high: Math.round(data.daily.temperature_2m_max[i]),
      low: Math.round(data.daily.temperature_2m_min[i]),
      rainProb: data.daily.precipitation_probability_max[i],
      weatherCode: code,
      condition: info.condition,
      icon: info.icon,
    };
  });

  return {
    location: locationName ?? `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
    current,
    forecast,
  };
}

/** Generate a farming advisory based on weather conditions */
export function generateAdvisory(weather: WeatherData): string {
  const { current, forecast } = weather;
  const today = forecast[0];
  const tomorrow = forecast[1] ?? today;

  const advisories: string[] = [];

  if (today.rainProb > 60) {
    advisories.push(
      `High chance of rain (${today.rainProb}%) today. Postpone any pesticide or fertilizer application. Ensure proper drainage in fields.`,
    );
  } else if (today.rainProb > 30) {
    advisories.push(`Moderate rain probability (${today.rainProb}%). Plan field activities accordingly and keep harvested crops covered.`);
  }

  if (current.temperature > 35) {
    advisories.push(
      "High temperature alert. Increase irrigation frequency. Provide shade for sensitive crops and livestock. Apply mulching to retain soil moisture.",
    );
  } else if (current.temperature < 10) {
    advisories.push(
      "Low temperature alert. Protect young seedlings with covers. Light irrigation can help protect against frost damage.",
    );
  }

  if (current.humidity > 80) {
    advisories.push(
      "High humidity conditions increase fungal disease risk. Monitor crops for signs of blight, mildew, and rust. Ensure proper plant spacing for air circulation.",
    );
  }

  if (current.windSpeed > 25) {
    advisories.push(
      "Strong winds expected. Avoid spraying operations. Secure any temporary structures. Tall crops like sugarcane and maize may need support.",
    );
  }

  if (advisories.length === 0) {
    advisories.push(
      "Current conditions are favorable for farming activities. Good time for sowing, weeding, and harvesting operations. Continue monitoring weather for any changes.",
    );
  }

  // Add seasonal context
  const month = new Date().getMonth();
  if (month >= 5 && month <= 8) {
    advisories.push(
      "Kharif season is underway. Good time for paddy, maize, cotton, and soybean sowing in rainfed areas.",
    );
  } else if (month >= 9 || month <= 1) {
    advisories.push(
      "Rabi season approaching. Prepare land for wheat, mustard, and pulses. Ensure adequate soil moisture for germination.",
    );
  }

  return advisories.join(" ");
}
