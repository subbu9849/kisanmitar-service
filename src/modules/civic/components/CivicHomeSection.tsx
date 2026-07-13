import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPinned } from "lucide-react";
import { CIVIC_CATEGORIES, TRACK_CARD } from "../categories";
import SectionShell from "./SectionShell";

const CivicHomeSection = () => {
  const navigate = useNavigate();
  const cards = [...CIVIC_CATEGORIES, TRACK_CARD];

  const goTo = (categoryId: string) => {
    navigate(`/civic-services${categoryId !== "Other" ? `?category=${encodeURIComponent(categoryId)}` : ""}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <SectionShell
      id="civic-services"
      eyebrow="Community Service"
      title="Village Civic Services"
      subtitle="Help improve your village by reporting public infrastructure issues directly through KisanMitra."
      className="bg-muted/20"
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c, i) => (
          <motion.div
            key={c.id + c.label}
            className="group relative bg-card rounded-2xl p-6 border border-border/50 cursor-hover overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            whileHover={{ y: -6, transition: { type: "spring", stiffness: 400 } }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl bg-primary/5" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10 text-2xl group-hover:scale-110 transition-transform duration-300">
                {c.emoji}
              </div>
              <h3 className="font-semibold text-lg mb-2">{c.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{c.description}</p>
              <button
                type="button"
                onClick={() => goTo(c.id)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all cursor-hover"
              >
                {c.id === "Other" ? "Track Now" : "Report Now"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-10">
        <button
          type="button"
          onClick={() => { navigate("/civic-services"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity cursor-hover"
        >
          <MapPinned className="w-4 h-4" /> Open Civic Services
        </button>
      </div>
    </SectionShell>
  );
};

export default CivicHomeSection;
