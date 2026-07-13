import { Construction, Lightbulb, Droplet, Trash2, CloudRainWind, MapPinned, type LucideIcon } from "lucide-react";
import type { ComplaintCategory } from "./types";

export interface CategoryMeta {
  id: ComplaintCategory;
  label: string;
  emoji: string;
  icon: LucideIcon;
  description: string;
}

export const CIVIC_CATEGORIES: CategoryMeta[] = [
  { id: "Road Damage", label: "Road Damage", emoji: "🛣️", icon: Construction, description: "Potholes, cracked pavement, or damaged village roads." },
  { id: "Broken Streetlight", label: "Broken Streetlight", emoji: "💡", icon: Lightbulb, description: "Non-working or flickering streetlights in your area." },
  { id: "Water Leakage", label: "Water Leakage", emoji: "🚰", icon: Droplet, description: "Leaking pipelines or public taps wasting water." },
  { id: "Garbage Complaint", label: "Garbage Complaint", emoji: "🗑️", icon: Trash2, description: "Uncollected garbage or overflowing waste bins." },
  { id: "Drainage Issue", label: "Drainage Issue", emoji: "🌧️", icon: CloudRainWind, description: "Blocked or overflowing drains causing waterlogging." },
];

export const TRACK_CARD: CategoryMeta = {
  id: "Other",
  label: "Track Complaint",
  emoji: "📍",
  icon: MapPinned,
  description: "Check the live status of a complaint you already filed.",
};
