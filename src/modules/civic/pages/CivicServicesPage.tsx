import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

import ComplaintForm from "../components/ComplaintForm";
import ComplaintWorkflow from "../components/ComplaintWorkflow";
import CommunityImpact from "../components/CommunityImpact";
import EmergencyHelpline from "../components/EmergencyHelpline";
import CommunityAnnouncements from "../components/CommunityAnnouncements";
import TrackComplaint from "../components/TrackComplaint";
import SectionShell from "../components/SectionShell";
import type { ComplaintCategory } from "../types";

const VALID_CATEGORIES: ComplaintCategory[] = [
  "Road Damage", "Broken Streetlight", "Water Leakage", "Garbage Complaint", "Drainage Issue", "Other",
];

const CivicServicesPage = () => {
  const [searchParams] = useSearchParams();

  const defaultCategory = useMemo(() => {
    const raw = searchParams.get("category");
    return VALID_CATEGORIES.find((c) => c === raw) as ComplaintCategory | undefined;
  }, [searchParams]);

  useEffect(() => {
    document.title = "Village Civic Services — KisanMitra";
  }, []);

  return (
    <div className="pt-24">
      {/* ═══════════ HERO ═══════════ */}
      <section className="py-16 sm:py-20 relative overflow-hidden">
        <div className="section-padding text-center max-w-3xl mx-auto relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-green" /> Community Service
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
          >
            Village Civic Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Report public infrastructure issues in your village — roads, streetlights, water, garbage, and drainage — and track them through to resolution.
          </motion.p>
        </div>
      </section>

      {/* ═══════════ COMPLAINT FORM ═══════════ */}
      <SectionShell id="report-issue" eyebrow="Step 1" title="File a Complaint" subtitle="Fill in the details below — a demo AI pass and complaint ID are generated automatically.">
        <ComplaintForm defaultCategory={defaultCategory} />
      </SectionShell>

      {/* ═══════════ WORKFLOW ═══════════ */}
      <SectionShell id="workflow" eyebrow="How it works" title="Complaint Workflow" subtitle="From report to resolution, here's what happens to your complaint." className="bg-muted/20">
        <ComplaintWorkflow />
      </SectionShell>

      {/* ═══════════ TRACK COMPLAINT ═══════════ */}
      <SectionShell id="track-complaint" eyebrow="Step 2" title="Track Your Complaint" subtitle="Search using your Complaint ID or the mobile number you registered with.">
        <TrackComplaint />
      </SectionShell>

      {/* ═══════════ COMMUNITY IMPACT ═══════════ */}
      <SectionShell id="community-impact" eyebrow="Together" title="Community Impact" subtitle="What KisanMitra's civic and farmer community has achieved so far." className="bg-muted/20">
        <CommunityImpact />
      </SectionShell>

      {/* ═══════════ EMERGENCY HELPLINE ═══════════ */}
      <SectionShell id="emergency-helpline" eyebrow="Stay safe" title="Emergency Helpline" subtitle="Tap any card to call directly from your phone.">
        <EmergencyHelpline />
      </SectionShell>

      {/* ═══════════ ANNOUNCEMENTS ═══════════ */}
      <SectionShell id="announcements" eyebrow="Stay informed" title="Community Announcements" subtitle="Local notices and upcoming programs for your village." className="bg-muted/20">
        <CommunityAnnouncements />
      </SectionShell>

      <div className="section-padding pb-16">
        <div className="max-w-3xl mx-auto flex items-start gap-3 bg-muted/40 rounded-2xl p-5 text-xs text-muted-foreground">
          <ShieldCheck className="w-5 h-5 shrink-0 text-primary" />
          <p>
            Civic Services is a community service feature developed for educational purposes within the KisanMitra platform.
            Authority workflows and AI analysis shown here are demonstrations only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CivicServicesPage;
