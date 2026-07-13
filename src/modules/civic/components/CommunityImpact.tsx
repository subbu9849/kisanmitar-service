import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, MapPinned, ClipboardList, CheckCircle2, HeartHandshake, type LucideIcon } from "lucide-react";
import { getImpactStats } from "../store";

const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = Math.max(1, Math.ceil(value / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value, inView]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

interface StatDef { label: string; value: number; icon: LucideIcon }

const CommunityImpact = () => {
  const stats = getImpactStats();
  const items: StatDef[] = [
    { label: "Farmers Helped", value: stats.farmersHelped, icon: Users },
    { label: "Villages Connected", value: stats.villagesConnected, icon: MapPinned },
    { label: "Civic Complaints Reported", value: stats.complaintsReported, icon: ClipboardList },
    { label: "Complaints Resolved", value: stats.complaintsResolved, icon: CheckCircle2 },
    { label: "Active Volunteers", value: stats.activeVolunteers, icon: HeartHandshake },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className="bg-card rounded-2xl border border-border/50 p-5 text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <item.icon className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold tracking-tight">
            <AnimatedCounter value={item.value} suffix="+" />
          </p>
          <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default CommunityImpact;
