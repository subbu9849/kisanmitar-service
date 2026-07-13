/* ═══════════════════════════════════════════════════════════
   Village Civic Services — EmailJS integration
   Sends the complaint to a configurable "demo authority" inbox
   and a confirmation copy to the citizen, using the SAME EmailJS
   service + template for both (just a different recipient/role
   passed in as template params). All credentials come from
   environment variables — see .env.example. If they are not
   configured, sending is skipped and the caller is told so (the
   rest of the flow still works in demo mode).
   ═══════════════════════════════════════════════════════════ */

import emailjs from "@emailjs/browser";
import type { Complaint } from "./types";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;
const AUTHORITY_EMAIL = (import.meta.env.VITE_CIVIC_AUTHORITY_EMAIL as string | undefined) || "demo-authority@kisanmitra.in";

export const isEmailJSConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

function buildComplaintSummary(complaint: Complaint): string {
  return [
    `Complaint ID: ${complaint.id}`,
    `Category: ${complaint.category}`,
    `Title: ${complaint.title}`,
    `Description: ${complaint.description}`,
    `Location: ${complaint.village}, ${complaint.mandal}, ${complaint.district}`,
    complaint.gps ? `GPS: ${complaint.gps.lat.toFixed(5)}, ${complaint.gps.lng.toFixed(5)}` : "GPS: Not shared",
    complaint.aiAnalysis
      ? `Demo AI Analysis — Severity: ${complaint.aiAnalysis.severity}, Priority: ${complaint.aiAnalysis.priority}, ETA: ${complaint.aiAnalysis.estimatedResolution}`
      : "Demo AI Analysis: Not available",
  ].join("\n");
}

interface SendResult {
  authoritySent: boolean;
  confirmationSent: boolean;
  demoMode: boolean;
}

/**
 * Sends the complaint to the demo authority inbox and a confirmation copy to
 * the citizen. Both emails reuse the same EmailJS service + template ID —
 * `recipient_role` and `to_email` change per send so a single template can
 * branch on `{{recipient_role}}` if you want the wording to differ.
 */
export async function sendComplaintEmails(complaint: Complaint): Promise<SendResult> {
  if (!isEmailJSConfigured) {
    // No EmailJS credentials configured — this is expected out of the box.
    // The rest of the complaint flow (ID, storage, tracking) still works.
    return { authoritySent: false, confirmationSent: false, demoMode: true };
  }

  const summary = buildComplaintSummary(complaint);
  const baseParams = {
    complaint_id: complaint.id,
    citizen_name: complaint.fullName,
    citizen_mobile: complaint.mobile,
    category: complaint.category,
    summary,
  };

  let authoritySent = false;
  let confirmationSent = false;

  try {
    await emailjs.send(
      SERVICE_ID!,
      TEMPLATE_ID!,
      {
        ...baseParams,
        recipient_role: "authority",
        to_email: AUTHORITY_EMAIL,
        to_name: "Civic Services Desk",
      },
      { publicKey: PUBLIC_KEY! },
    );
    authoritySent = true;
  } catch {
    authoritySent = false;
  }

  try {
    await emailjs.send(
      SERVICE_ID!,
      TEMPLATE_ID!,
      {
        ...baseParams,
        recipient_role: "citizen",
        to_email: complaint.email,
        to_name: complaint.fullName,
      },
      { publicKey: PUBLIC_KEY! },
    );
    confirmationSent = true;
  } catch {
    confirmationSent = false;
  }

  return { authoritySent, confirmationSent, demoMode: false };
}
