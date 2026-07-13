import { motion } from "framer-motion";
import { Ambulance, Shield, Flame, Zap, Sprout, Stethoscope, Phone, type LucideIcon } from "lucide-react";

interface HelplineEntry { label: string; number: string; icon: LucideIcon; color: string }

const HELPLINES: HelplineEntry[] = [
  { label: "Ambulance", number: "108", icon: Ambulance, color: "bg-red-500/10 text-red-600" },
  { label: "Police", number: "100", icon: Shield, color: "bg-blue-500/10 text-blue-600" },
  { label: "Fire", number: "101", icon: Flame, color: "bg-orange-500/10 text-orange-600" },
  { label: "Electricity", number: "1912", icon: Zap, color: "bg-amber-500/10 text-amber-600" },
  { label: "Agriculture Officer", number: "1800-180-1551", icon: Sprout, color: "bg-primary/10 text-primary" },
  { label: "Veterinary Hospital", number: "1962", icon: Stethoscope, color: "bg-emerald-500/10 text-emerald-600" },
];

const EmergencyHelpline = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
    {HELPLINES.map((h, i) => (
      <motion.a
        key={h.label}
        href={`tel:${h.number}`}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4, delay: i * 0.06 }}
        whileHover={{ y: -4 }}
        className="group bg-card rounded-2xl border border-border/50 p-5 cursor-hover flex flex-col items-center text-center gap-2"
      >
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${h.color} group-hover:scale-110 transition-transform`}>
          <h.icon className="w-5 h-5" />
        </div>
        <p className="font-semibold text-sm">{h.label}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {h.number}</p>
      </motion.a>
    ))}
  </div>
);

export default EmergencyHelpline;
