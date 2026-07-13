/* ═══════════════════════════════════════════════════════════
   AI Crop Photo Analysis — calls /api/disease-detection
   (a Netlify Function that uses Google's Gemini vision to give
   a real, reasoned read of the photo — not a hardcoded result,
   and not a substitute for a certified agronomist).
   ═══════════════════════════════════════════════════════════ */

export interface DiseaseAnalysis {
  isPlantImage: boolean;
  plantOrCrop: string;
  healthStatus: "healthy" | "possible_issue" | "unclear";
  observation: string;
  possibleCauses: string;
  suggestedNextSteps: string;
  confidence: "low" | "medium" | "high";
}

export type AnalysisOutcome =
  | { ok: true; configured: true; result: DiseaseAnalysis }
  | { ok: false; configured: false }
  | { ok: false; configured: true; error: string };

/** Downscales an image client-side before upload — keeps requests fast and under serverless payload limits */
function resizeImage(file: File, maxDimension = 1024, quality = 0.85): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) { height = Math.round((height / width) * maxDimension); width = maxDimension; }
        else { width = Math.round((width / height) * maxDimension); height = maxDimension; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      const base64 = dataUrl.split(",")[1];
      resolve({ base64, mediaType: "image/jpeg" });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not load image")); };
    img.src = url;
  });
}

export async function analyzeCropImage(file: File): Promise<AnalysisOutcome> {
  try {
    const { base64, mediaType } = await resizeImage(file);
    const res = await fetch("/api/disease-detection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64, mediaType }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, configured: true, error: data.error || "Analysis failed. Please try again." };
    }

    const data = await res.json();
    if (!data.configured) return { ok: false, configured: false };
    if (!data.result) return { ok: false, configured: true, error: "No result returned." };

    return { ok: true, configured: true, result: data.result as DiseaseAnalysis };
  } catch {
    return { ok: false, configured: true, error: "Couldn't reach the analysis service. Check your connection and try again." };
  }
}
