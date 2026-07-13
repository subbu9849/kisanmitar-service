import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Hash, Phone, MapPin, Calendar, CheckCircle2, Circle } from "lucide-react";
import { getComplaintById, getComplaintsByMobile } from "../store";
import type { Complaint } from "../types";

const STAGES = ["Report Issue", "Demo AI Analysis", "Complaint ID Generated", "Email Sent to Authority", "Confirmation Sent"] as const;

const statusColor: Record<Complaint["status"], string> = {
  Submitted: "bg-blue-500/10 text-blue-600",
  "Under Review": "bg-amber-500/10 text-amber-600",
  "In Progress": "bg-purple-500/10 text-purple-600",
  Resolved: "bg-emerald-500/10 text-emerald-600",
};

const TrackComplaint = () => {
  const [mode, setMode] = useState<"id" | "mobile">("id");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Complaint[] | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearched(true);
    if (mode === "id") {
      const found = getComplaintById(query);
      setResults(found ? [found] : []);
    } else {
      setResults(getComplaintsByMobile(query));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="glass rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
        <div className="flex rounded-xl bg-muted/50 p-1 shrink-0">
          <button type="button" onClick={() => setMode("id")}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${mode === "id" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
            <Hash className="w-3.5 h-3.5" /> Complaint ID
          </button>
          <button type="button" onClick={() => setMode("mobile")}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${mode === "mobile" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
            <Phone className="w-3.5 h-3.5" /> Mobile Number
          </button>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={mode === "id" ? "e.g. KM-CS-2026-000001" : "Registered mobile number"}
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
        />
        <button type="submit" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity cursor-hover">
          <Search className="w-4 h-4" /> Track
        </button>
      </form>

      <AnimatePresence mode="wait">
        {searched && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 space-y-4">
            {results && results.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No complaint found. Double-check the ID or mobile number.</p>
            )}
            {results?.map((c) => (
              <div key={c.id} className="bg-card rounded-2xl border border-border/50 p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="font-mono text-sm font-semibold text-primary">{c.id}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{c.title}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColor[c.status]}`}>{c.status}</span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-5">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {c.village}, {c.mandal}, {c.district}</span>
                </div>

                <div className="space-y-2.5">
                  {STAGES.map((stage) => {
                    const entry = c.timeline.find((t) => t.stage === stage);
                    const done = Boolean(entry);
                    return (
                      <div key={stage} className="flex items-start gap-2.5">
                        {done ? <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> : <Circle className="w-4 h-4 text-muted-foreground/30 mt-0.5 shrink-0" />}
                        <div>
                          <p className={`text-sm ${done ? "font-medium" : "text-muted-foreground"}`}>{stage}</p>
                          {entry?.remark && <p className="text-xs text-muted-foreground">{entry.remark}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrackComplaint;
