import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FileText, Sparkles, Hash, Mail, MailCheck, MapPin, type LucideIcon } from "lucide-react";

const STEPS: { label: string; icon: LucideIcon }[] = [
  { label: "Report Issue", icon: FileText },
  { label: "Demo AI Analysis", icon: Sparkles },
  { label: "Complaint ID Generated", icon: Hash },
  { label: "Email Sent to Authority", icon: Mail },
  { label: "Confirmation Sent", icon: MailCheck },
  { label: "Track Complaint", icon: MapPin },
];

const ComplaintWorkflow = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="relative">
      <div className="hidden md:block absolute top-7 left-0 right-0 h-0.5 bg-border/60" />
      <motion.div
        className="hidden md:block absolute top-7 left-0 h-0.5 bg-primary origin-left"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.4, ease: "easeInOut" }}
        style={{ right: 0 }}
      />
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6 md:gap-4 relative">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.label}
            className="flex flex-col items-center text-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-card border border-border/60 flex items-center justify-center relative z-10 shadow-sm">
              <step.icon className="w-6 h-6 text-primary" />
            </div>
            <p className="text-xs sm:text-sm font-medium leading-tight">{step.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ComplaintWorkflow;
