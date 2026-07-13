/* ═══════════════════════════════════════════════════════════
   AI Farming Assistant — calls /api/ai-assistant
   (a Netlify Function that uses Google's Gemini API for real,
   multi-turn farming Q&A — not scripted/canned replies).
   ═══════════════════════════════════════════════════════════ */

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export type ChatOutcome =
  | { ok: true; configured: true; reply: string }
  | { ok: false; configured: false }
  | { ok: false; configured: true; error: string };

export const MAX_MESSAGE_LENGTH = 2000;

/** Sends a message plus prior turns to the assistant and returns its reply. */
export async function sendChatMessage(message: string, history: ChatMessage[]): Promise<ChatOutcome> {
  try {
    const res = await fetch("/api/ai-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (data?.configured === false) return { ok: false, configured: false };
      return { ok: false, configured: true, error: data?.error || "Something went wrong. Please try again." };
    }

    if (!data.configured) return { ok: false, configured: false };
    if (!data.reply) return { ok: false, configured: true, error: "No response received." };

    return { ok: true, configured: true, reply: data.reply as string };
  } catch {
    return { ok: false, configured: true, error: "Couldn't reach the assistant. Check your connection and try again." };
  }
}
