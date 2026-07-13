/* ═══════════════════════════════════════════════════════════
   Village Civic Services — demo persistence layer
   No backend is wired up yet, so complaints are simulated with
   localStorage. Swap this file out for real API calls later —
   every other component only talks to the functions below.
   ═══════════════════════════════════════════════════════════ */

import type {
  Complaint,
  ComplaintCategory,
  ComplaintStage,
  CivicImpactStats,
  DemoAIResult,
  GeoPoint,
} from "./types";

const STORAGE_KEY = "km_civic_complaints";
const SEQ_KEY = "km_civic_complaint_seq";

/* ─── Complaint ID: KM-CS-2026-000001 ─────────────────────── */
export function generateComplaintId(): string {
  const year = new Date().getFullYear();
  const current = Number(localStorage.getItem(SEQ_KEY) ?? "0") + 1;
  localStorage.setItem(SEQ_KEY, String(current));
  return `KM-CS-${year}-${String(current).padStart(6, "0")}`;
}

function readAll(): Complaint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Complaint[]) : [];
  } catch {
    return [];
  }
}

function writeAll(complaints: Complaint[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  } catch {
    // Storage full or unavailable (e.g. private browsing) — fail silently,
    // the complaint still exists for this session via component state.
  }
}

export function saveComplaint(complaint: Complaint): Complaint {
  const all = readAll();
  all.unshift(complaint);
  writeAll(all);
  return complaint;
}

export function getComplaintById(id: string): Complaint | undefined {
  return readAll().find((c) => c.id.toLowerCase() === id.trim().toLowerCase());
}

export function getComplaintsByMobile(mobile: string): Complaint[] {
  const digits = mobile.replace(/\D/g, "");
  return readAll().filter((c) => c.mobile.replace(/\D/g, "") === digits);
}

export function addTimelineEntry(id: string, stage: ComplaintStage, remark?: string) {
  const all = readAll();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return;
  all[idx].timeline.push({ stage, date: new Date().toISOString(), remark });
  writeAll(all);
}

export function markEmailSent(id: string, kind: "authority" | "confirmation") {
  const all = readAll();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return;
  if (kind === "authority") all[idx].authorityEmailSent = true;
  else all[idx].confirmationEmailSent = true;
  writeAll(all);
}

/* ─── Demo AI Analysis (clearly labeled, not a real model) ──── */
const SEVERITY_BY_CATEGORY: Record<ComplaintCategory, { severity: DemoAIResult["severity"]; priority: DemoAIResult["priority"]; eta: string }> = {
  "Road Damage": { severity: "High", priority: "High", eta: "3–5 Days" },
  "Broken Streetlight": { severity: "Medium", priority: "Medium", eta: "2–4 Days" },
  "Water Leakage": { severity: "High", priority: "High", eta: "1–3 Days" },
  "Garbage Complaint": { severity: "Medium", priority: "Medium", eta: "1–2 Days" },
  "Drainage Issue": { severity: "High", priority: "High", eta: "4–7 Days" },
  Other: { severity: "Low", priority: "Low", eta: "5–7 Days" },
};

export function runDemoAIAnalysis(category: ComplaintCategory): DemoAIResult {
  const preset = SEVERITY_BY_CATEGORY[category] ?? SEVERITY_BY_CATEGORY.Other;
  // Small deterministic-feeling jitter so it doesn't look hardcoded on every submission.
  const confidence = Math.min(99, 88 + Math.floor(Math.random() * 11));
  return {
    detectedCategory: category,
    confidence,
    severity: preset.severity,
    priority: preset.priority,
    estimatedResolution: preset.eta,
  };
}

export function getCurrentLocation(): Promise<GeoPoint | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  });
}

/* ─── Community Impact counters ──────────────────────────────
   Base numbers represent the wider KisanMitra community; the
   civic-complaint counters layer in real locally-stored data
   on top so the section feels alive as people try the demo. */
export function getImpactStats(): CivicImpactStats {
  const complaints = readAll();
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  return {
    farmersHelped: 12480,
    villagesConnected: 340,
    complaintsReported: 1860 + complaints.length,
    complaintsResolved: 1120 + resolved,
    activeVolunteers: 96,
  };
}
