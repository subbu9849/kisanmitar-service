/* ═══════════════════════════════════════════════════════════
   Netlify Function: /api/ai-assistant
   Multi-turn farming Q&A chat using Google's Gemini API.
   Uses gemini-2.5-flash-lite, free of charge on Google's free
   tier (no credit card required) — same key as Disease Detection.

   Set GEMINI_API_KEY in Netlify environment variables
   (Site settings -> Environment variables). Get a free key at
   https://aistudio.google.com/apikey.
   ═══════════════════════════════════════════════════════════ */

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";
const MAX_HISTORY_MESSAGES = 20; // caps request size and cost per call
const MAX_MESSAGE_LENGTH = 2000;

const SYSTEM_PROMPT = `You are the AI farming assistant inside "Kisan Mitra", an app for farmers in India, with a strong focus on Andhra Pradesh and Telangana.

Your job: answer practical farming questions — crops, irrigation, soil, weather-related decisions, government schemes, market timing, pest/disease basics, equipment, and general agricultural guidance.

Rules:
- Keep answers concise and practical — farmers want clear, usable answers, not essays. Prefer short paragraphs or brief bullet points over long explanations.
- You are not a certified agronomist. For anything high-stakes (pesticide dosing, chemical treatment specifics, legal/financial decisions, serious crop loss situations), give general guidance and clearly recommend consulting a local agricultural extension officer, agronomist, or the platform's Expert Consultation feature for confirmation.
- Do not invent specific product names, exact dosages, or fabricated statistics. If you don't know something specific (e.g. today's exact mandi price in a specific town), say so plainly and suggest checking the app's Market Price Dashboard instead.
- Stay on farming/agriculture topics. If asked something completely unrelated, gently redirect back to how you can help with farming.
- Respond in the same language the user writes in where reasonable (English, Hindi, or Telugu are all fine).
- Never claim to be human. You are an AI assistant.`;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ configured: true, error: "Method not allowed" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 200, headers, body: JSON.stringify({ configured: false }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ configured: true, error: "Invalid request body" }) };
  }

  const { message, history } = payload;
  if (!message || typeof message !== "string") {
    return { statusCode: 400, headers, body: JSON.stringify({ configured: true, error: "Missing message" }) };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { statusCode: 400, headers, body: JSON.stringify({ configured: true, error: "Message too long" }) };
  }

  // history: [{ role: "user" | "model", text: string }, ...] — validated and capped
  const safeHistory = Array.isArray(history)
    ? history
        .filter((m) => m && (m.role === "user" || m.role === "model") && typeof m.text === "string")
        .slice(-MAX_HISTORY_MESSAGES)
        .map((m) => ({ role: m.role, parts: [{ text: m.text.slice(0, MAX_MESSAGE_LENGTH) }] }))
    : [];

  const contents = [...safeHistory, { role: "user", parts: [{ text: message }] }];

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          maxOutputTokens: 500,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { statusCode: 502, headers, body: JSON.stringify({ configured: true, error: "Assistant service error", detail: errText.slice(0, 300) }) };
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!reply) {
      return { statusCode: 502, headers, body: JSON.stringify({ configured: true, error: "No response from assistant" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ configured: true, reply }) };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ configured: true, error: "Failed to reach assistant service" }) };
  }
};
