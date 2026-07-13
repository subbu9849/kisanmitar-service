/* ═══════════════════════════════════════════════════════════
   Village Civic Services — shared types
   Community-service module bolted onto KisanMitra. Everything
   here is scoped under src/modules/civic so it never collides
   with the core farmer-facing app.
   ═══════════════════════════════════════════════════════════ */

export type ComplaintCategory =
  | "Road Damage"
  | "Broken Streetlight"
  | "Water Leakage"
  | "Garbage Complaint"
  | "Drainage Issue"
  | "Other";

export type ComplaintStage =
  | "Report Issue"
  | "Demo AI Analysis"
  | "Complaint ID Generated"
  | "Email Sent to Authority"
  | "Confirmation Sent"
  | "Track Complaint";

export type ComplaintStatus = "Submitted" | "Under Review" | "In Progress" | "Resolved";

export interface DemoAIResult {
  detectedCategory: ComplaintCategory;
  confidence: number; // 0-100
  severity: "Low" | "Medium" | "High";
  priority: "Low" | "Medium" | "High";
  estimatedResolution: string;
}

export interface TimelineEntry {
  stage: ComplaintStage;
  date: string; // ISO
  remark?: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Complaint {
  id: string; // e.g. KM-CS-2026-000001
  fullName: string;
  mobile: string;
  email: string;
  village: string;
  mandal: string;
  district: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  imageDataUrl?: string;
  gps?: GeoPoint | null;
  aiAnalysis?: DemoAIResult;
  status: ComplaintStatus;
  createdAt: string; // ISO
  timeline: TimelineEntry[];
  authorityEmailSent: boolean;
  confirmationEmailSent: boolean;
}

export interface CivicImpactStats {
  farmersHelped: number;
  villagesConnected: number;
  complaintsReported: number;
  complaintsResolved: number;
  activeVolunteers: number;
}
