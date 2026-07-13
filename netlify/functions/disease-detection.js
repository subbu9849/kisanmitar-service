/* ═══════════════════════════════════════════════════════════
   Netlify Function: /api/disease-detection
   Sends an uploaded crop image to Google's Gemini API (vision)
   for a real, reasoned assessment — not a trained specialist
   plant-pathology model, but genuine image analysis instead of
   a hardcoded result. Uses gemini-2.5-flash-lite, which is free
   of charge on Google's free tier (no credit card required).

   Set GEMINI_API_KEY in Netlify environment variables
   (Site settings -> Environment variables). Get a free key at
   https://aistudio.google.com/apikey (no billing required).
   ═══════════════════════════════════════════════════════════ */

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";
const MAX_IMAGE_BYTES = 3.5 * 1024 * 1024; // raw bytes; base64 inflates ~33%, staying under Lambda's 6MB payload limit

const SYSTEM_PROMPT = `You are assisting a farmer-facing app's crop photo triage feature. You are NOT a substitute for a certified agronomist, plant pathologist, or local agricultural extension officer, and the app must never claim otherwise.

Look carefully at the provided image and respond with ONLY a JSON object (no markdown fences, no preamble, no explanation outside the JSON) in exactly this shape:

{
  "isPlantImage": boolean,
  "plantOrCrop": string,
  "healthStatus": "healthy" | "possible_issue" | "unclear",
  "observation": string,
  "possibleCauses": string,
  "suggestedNextSteps": string,
  "confidence": "low" | "medium" | "high"
}

Rules:
- If the image does not clearly show a plant/crop/leaf, set isPlantImage to false and explain briefly in "observation" what the image actually shows; leave other fields as short empty-ish placeholders.
- Never give a confident single-disease name as if certain. Describe what you visually observe (discoloration, spots, wilting, pest damage, healthy growth, etc.) and the most plausible explanations, phrased as possibilities, not a diagnosis.
- "suggestedNextSteps" must always include consulting a local agricultural extension officer or agronomist for confirmation before applying any treatment, especially pesticides or fungicides.
- Do not invent product names, dosages, or precise treatment instructions. General, safe guidance only (e.g. "remove affected leaves", "improve airflow", "avoid overhead watering") is fine; specific chemical dosing is not.
- Keep each text field to 1-3 sentences.
- confidence should be "low" if the image is blurry, poorly lit, too zoomed out, or ambiguous.`;

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

  const { imageBase64, mediaType } = payload;
  if (!imageBase64 || !mediaType) {
    return { statusCode: 400, headers, body: JSON.stringify({ configured: true, error: "Missing image data" }) };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  if (!allowedTypes.includes(mediaType)) {
    return { statusCode: 400, headers, body: JSON.stringify({ configured: true, error: "Unsupported image type" }) };
  }

  // Rough size check (base64 is ~4/3 the size of the original bytes)
  const approxBytes = (imageBase64.length * 3) / 4;
  if (approxBytes > MAX_IMAGE_BYTES) {
    return { statusCode: 413, headers, body: JSON.stringify({ configured: true, error: "Image too large. Please use a photo under 3.5MB." }) };
  }

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: "user",
            parts: [
              { inline_data: { mime_type: mediaType, data: imageBase64 } },
              { text: "Analyze this crop/plant photo as instructed." },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 600,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { statusCode: 502, headers, body: JSON.stringify({ configured: true, error: "Analysis service error", detail: errText.slice(0, 300) }) };
    }

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let parsed;
    try {
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return { statusCode: 502, headers, body: JSON.stringify({ configured: true, error: "Could not parse analysis result" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ configured: true, result: parsed }) };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ configured: true, error: "Failed to reach analysis service" }) };
  }
};
