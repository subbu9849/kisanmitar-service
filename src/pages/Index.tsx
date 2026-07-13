import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import {
  Sprout, Cloud, TrendingUp, BookOpen, Bug, FlaskConical, Building2, Newspaper,
  GraduationCap, Users, Phone, Mail, MapPin, Search, Filter, ChevronRight,
  ArrowRight, Upload, Droplets, Thermometer, Wind, Eye, Shield, Star, Quote,
  ChevronDown, CheckCircle2, BarChart3, Sun, CloudRain, Tractor,
  Leaf, Wheat, Flower2, Apple, Carrot, Grape, Cherry, AlertTriangle, ThumbsUp,
  Clock, Calendar, DollarSign, Percent, Zap, Loader2, X, ExternalLink, Sparkles,
  MapPin as MapPinIcon, Navigation, CloudSun, CloudFog, CloudDrizzle, CloudLightning, CloudSnow,
  Play, Youtube, MessageSquare, Send, Calculator, FileText, RefreshCw, SlidersHorizontal,
  Heart, ArrowUpRight, Globe, Video, type LucideIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  searchLocations, fetchWeather, generateAdvisory,
  type GeoLocation, type WeatherData, type WeatherIcon,
} from "@/services/weather";
import {
  searchVideos, getVideosByCategory, getAllVideos, getYouTubeUrl, getYouTubeEmbedUrl,
  ALL_CATEGORIES, type YouTubeVideo, type VideoCategory,
} from "@/services/youtube";
import {
  getMarketData, getIllustrativePriceTrend, MARKET_CATEGORIES,
  type MarketEntry, type CropCategory, type MarketInsight,
} from "@/services/market";
import {
  SOIL_TYPES, getSoilsByQuery, type SoilInfo, type SoilType,
} from "@/services/soil";
import { analyzeCropImage, type DiseaseAnalysis } from "@/services/diseaseDetection";
import FarmerMarketplace from "@/components/FarmerMarketplace";
import CivicHomeSection from "@/modules/civic/components/CivicHomeSection";

/* ─── Zod schema for contact form ─────────────────────────── */
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Enter a valid phone number").max(15),
  subject: z.string().min(1, "Please select a topic"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
type ContactFormData = z.infer<typeof contactSchema>;

/* ═══════════════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════════════ */

const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value, inView]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const SectionWrapper = ({
  id, title, subtitle, children, className = "", eyebrow,
}: { id: string; title: string; subtitle?: string; children: React.ReactNode; className?: string; eyebrow?: string }) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <section id={id} ref={ref} className={`py-24 sm:py-32 ${className}`}>
      <div className="section-padding">
        <motion.div className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
          {eyebrow && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-green" />
              {eyebrow}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">{title}</h2>
          {subtitle && <p className="text-lg text-muted-foreground">{subtitle}</p>}
        </motion.div>
        {children}
      </div>
    </section>
  );
};

const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div key={i} className="absolute rounded-full bg-primary/10"
        style={{ width: Math.random() * 8 + 2, height: Math.random() * 8 + 2, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        animate={{ y: [0, -100, 0], opacity: [0, 0.5, 0], scale: [0, 1, 0] }}
        transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, delay: Math.random() * 10, ease: "easeInOut" }} />
    ))}
  </div>
);

const ServiceCard = ({ icon: Icon, title, description, color }: { icon: LucideIcon; title: string; description: string; color: string }) => (
  <motion.div className="group relative bg-card rounded-2xl p-6 border border-border/50 cursor-hover overflow-hidden"
    whileHover={{ y: -6, transition: { type: "spring", stiffness: 400 } }}>
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl ${color}`} />
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${color.replace("bg-", "bg-").replace("/5", "/15")}`}>
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const weatherIconMap: Record<WeatherIcon, LucideIcon> = {
  sun: Sun, cloud: Cloud, "cloud-rain": CloudRain, "cloud-drizzle": CloudDrizzle,
  "cloud-lightning": CloudLightning, "cloud-snow": CloudSnow, fog: CloudFog,
};

const WeatherCard = ({ day, icon, high, low, rainProb, condition }: { day: string; icon: WeatherIcon; high: number; low: number; rainProb: number; condition: string }) => {
  const IconComponent = weatherIconMap[icon] ?? Cloud;
  return (
    <motion.div className="bg-card rounded-2xl p-5 border border-border/30 text-center" whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400 }}>
      <p className="text-sm font-medium text-muted-foreground mb-2">{day}</p>
      <IconComponent className="w-8 h-8 mx-auto mb-3 text-secondary" />
      <p className="text-2xl font-bold">{high}°</p>
      <p className="text-sm text-muted-foreground mb-1">{low}°</p>
      <p className="text-xs text-muted-foreground">{condition}</p>
      <div className="mt-3 pt-3 border-t border-border/20 flex justify-center text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />{rainProb}% rain</span>
      </div>
    </motion.div>
  );
};

const CropCard = ({ icon: Icon, name, season, soil, water, days }: { icon: LucideIcon; name: string; season: string; soil: string; water: string; days: string }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div className={`bg-card rounded-2xl border border-border/30 overflow-hidden cursor-hover transition-all ${expanded ? "md:col-span-2" : ""}`}
      layout onClick={() => setExpanded(!expanded)}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center"><Icon className="w-7 h-7 text-primary" /></div>
            <div><h3 className="font-bold text-lg">{name}</h3><p className="text-sm text-muted-foreground">{season} Season</p></div>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }}><ChevronDown className="w-5 h-5 text-muted-foreground" /></motion.div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[{ label: "Soil", value: soil }, { label: "Water", value: water }, { label: "Days", value: days }].map(({ label, value }) => (
            <div key={label} className="text-center p-2 rounded-xl bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">{label}</p><p className="text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6 border-t border-border/20">
            <div className="pt-4 space-y-3">
              <h4 className="font-semibold text-sm">Growing Guidance</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {["Prepare soil with organic compost 2 weeks before planting", "Sow seeds at recommended depth of 2-3 cm", "Apply first fertilizer dose after 21 days", "Monitor for pests weekly during growth phase"].map((t, i) => (
                  <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />{t}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div className="bg-card rounded-2xl border border-border/30 overflow-hidden cursor-hover" onClick={() => setOpen(!open)}>
      <div className="p-5 flex items-center justify-between gap-4">
        <h3 className="font-medium">{question}</h3>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}><ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" /></motion.div>
      </div>
      <AnimatePresence>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{answer}</p></motion.div>}</AnimatePresence>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════
   INTERACTIVE SECTIONS
   ═══════════════════════════════════════════════════════════ */

/* ─── Disease Detection Uploader (real AI vision analysis) ──────────── */
const healthStatusStyles: Record<DiseaseAnalysis["healthStatus"], { label: string; color: string; bg: string; icon: LucideIcon }> = {
  healthy: { label: "Looks Healthy", color: "text-green-600", bg: "bg-green-500/10", icon: ThumbsUp },
  possible_issue: { label: "Possible Issue Detected", color: "text-amber-600", bg: "bg-amber-500/10", icon: AlertTriangle },
  unclear: { label: "Unclear From This Photo", color: "text-muted-foreground", bg: "bg-muted", icon: Eye },
};

const DiseaseUploader = () => {
  const [dragActive, setDragActive] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiseaseAnalysis | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const reset = () => { setResult(null); setError(null); setNotConfigured(false); };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.type.startsWith("image/")) { setImage(URL.createObjectURL(f)); setFile(f); reset(); }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setImage(URL.createObjectURL(f)); setFile(f); reset(); }
  };

  const analyzeImage = async () => {
    if (!file) return;
    setAnalyzing(true);
    reset();
    const outcome = await analyzeCropImage(file);
    setAnalyzing(false);
    if (!outcome.configured) { setNotConfigured(true); return; }
    if ("error" in outcome) { setError(outcome.error); return; }
    setResult(outcome.result);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all ${dragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border/50 hover:border-primary/30"} ${image ? "border-primary/30 bg-primary/[0.03]" : ""}`}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        whileHover={{ scale: 1.005 }}>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        {image ? (
          <div className="space-y-6">
            <img src={image} alt="Crop preview" className="max-h-64 mx-auto rounded-2xl shadow-lg" />
            {!result && !analyzing && !notConfigured && !error && (
              <motion.button onClick={analyzeImage} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium inline-flex items-center gap-2 cursor-hover" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Sparkles className="w-4 h-4" /> Analyze Crop
              </motion.button>
            )}
            {(result || error || notConfigured) && !analyzing && (
              <button onClick={() => { setImage(null); setFile(null); reset(); }} className="text-sm text-muted-foreground hover:text-foreground underline cursor-hover">
                Upload a different photo
              </button>
            )}
            {analyzing && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Analyzing crop image with AI...</p>
                <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" initial={{ width: "10%" }} animate={{ width: "90%" }} transition={{ duration: 8, ease: "easeOut" }} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 cursor-hover" onClick={() => inputRef.current?.click()}>
            <motion.div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto" whileHover={{ scale: 1.1, rotate: 5 }}>
              <Upload className="w-10 h-10 text-primary" />
            </motion.div>
            <div><p className="font-semibold text-lg">Drop your crop image here</p><p className="text-sm text-muted-foreground mt-1">or click to browse — supports JPG, PNG, HEIC</p></div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {notConfigured && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center text-sm text-muted-foreground bg-amber-500/5 border border-amber-500/20 rounded-2xl px-5 py-4">
            This feature needs a free Gemini API key configured server-side (see .env.example / netlify/functions/disease-detection.js) to run real analysis.
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center text-sm text-red-600 bg-red-500/5 border border-red-500/20 rounded-2xl px-5 py-4">
            {error}
          </motion.div>
        )}
        {result && (
          <motion.div initial={{ opacity: 0, y: 30, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} className="mt-8 bg-card rounded-3xl border border-border/30 overflow-hidden">
            <div className="p-8">
              {!result.isPlantImage ? (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center shrink-0"><Eye className="w-7 h-7 text-muted-foreground" /></div>
                  <div>
                    <h3 className="font-bold text-lg">This doesn't look like a plant photo</h3>
                    <p className="text-sm text-muted-foreground mt-1">{result.observation}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${healthStatusStyles[result.healthStatus].bg} flex items-center justify-center shrink-0`}>
                      {(() => { const Icon = healthStatusStyles[result.healthStatus].icon; return <Icon className={`w-7 h-7 ${healthStatusStyles[result.healthStatus].color}`} />; })()}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">{healthStatusStyles[result.healthStatus].label}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{result.plantOrCrop} · AI confidence: {result.confidence}</p>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-muted/30 mb-4">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Eye className="w-4 h-4" /> What the AI sees</h4>
                    <p className="text-sm text-muted-foreground">{result.observation}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                      <h4 className="font-semibold text-sm text-amber-600 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Possible Causes</h4>
                      <p className="text-sm text-muted-foreground">{result.possibleCauses}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                      <h4 className="font-semibold text-sm text-blue-600 mb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> Suggested Next Steps</h4>
                      <p className="text-sm text-muted-foreground">{result.suggestedNextSteps}</p>
                    </div>
                  </div>
                </>
              )}
              <p className="text-xs text-muted-foreground text-center mt-6 pt-4 border-t border-border/20">
                This is an AI-assisted visual read, not a certified diagnosis. For confirmation before applying any treatment, please consult your local agricultural extension officer or agronomist.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── YouTube Video Player Modal ──────────────────────────── */
const VideoModal = ({ video, onClose }: { video: YouTubeVideo; onClose: () => void }) => (
  <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <motion.div className="bg-card rounded-3xl border border-border/30 w-full max-w-4xl overflow-hidden shadow-2xl"
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between p-5 border-b border-border/20">
        <div className="min-w-0">
          <h3 className="font-bold text-lg truncate">{video.title}</h3>
          <p className="text-sm text-muted-foreground">{video.channelName}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors cursor-hover shrink-0"><X className="w-5 h-5" /></button>
      </div>
      <div className="relative pt-[56.25%] bg-black">
        <iframe src={getYouTubeEmbedUrl(video.videoId)} className="absolute inset-0 w-full h-full" allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title={video.title} />
      </div>
      <div className="p-5 flex items-center justify-between gap-4">
        <span className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" />{video.duration} · {video.views} views</span>
        <a href={getYouTubeUrl(video.videoId)} target="_blank" rel="noopener noreferrer"
          className="text-sm font-medium text-primary flex items-center gap-1 hover:underline cursor-hover">
          Watch on YouTube <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  </motion.div>
);

/* ─── YouTube Video Card ──────────────────────────────────── */
const VideoCard = ({ video, onPlay }: { video: YouTubeVideo; onPlay: (v: YouTubeVideo) => void }) => (
  <motion.div className="bg-card rounded-2xl border border-border/30 overflow-hidden cursor-hover group"
    whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400 }}
    onClick={() => onPlay(video)}>
    <div className="relative pt-[56.25%] bg-muted overflow-hidden">
      <img src={video.thumbnail} alt={video.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
        <motion.div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          whileHover={{ scale: 1.1 }}><Play className="w-6 h-6 text-foreground ml-0.5" /></motion.div>
      </div>
      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-xs font-mono">{video.duration}</span>
    </div>
    <div className="p-4">
      <h4 className="font-semibold text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">{video.title}</h4>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{video.channelName}</span>
        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{video.views}</span>
      </div>
    </div>
  </motion.div>
);

/* ─── Soil Type Selector ──────────────────────────────────── */
const SoilTypeSelector = () => {
  const [selected, setSelected] = useState<SoilInfo | null>(null);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => getSoilsByQuery(query), [query]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search soil types or suitable crops..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border/50 bg-card text-sm outline-none focus:border-primary transition-colors" />
          {query && <button onClick={() => { setQuery(""); setSelected(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-muted cursor-hover"><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </div>

      {/* Soil type grid */}
      {!selected && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((soil) => (
            <motion.button key={soil.id} onClick={() => setSelected(soil)}
              className={`text-left p-6 rounded-2xl border transition-all cursor-hover ${selected?.id === soil.id ? "border-primary bg-primary/5 shadow-lg" : "border-border/30 bg-card hover:border-primary/30"}`}
              whileHover={{ y: -4 }}>
              <div className={`w-12 h-12 rounded-xl ${soil.color} opacity-80 mb-3`} />
              <h3 className="font-bold text-lg mb-1">{soil.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-3">{soil.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {soil.suitableCrops.slice(0, 3).map((c) => (
                  <span key={c} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-muted text-muted-foreground">{c}</span>
                ))}
                {soil.suitableCrops.length > 3 && <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-muted text-muted-foreground">+{soil.suitableCrops.length - 3}</span>}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Detailed soil view */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="bg-card rounded-3xl border border-border/30 overflow-hidden">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl ${selected.color} opacity-80`} />
                  <div>
                    <h3 className="font-bold text-2xl">{selected.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-muted cursor-hover"><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" />Characteristics</h4>
                  <ul className="space-y-2">
                    {selected.characteristics.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />{c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" />Challenges</h4>
                  <ul className="space-y-2">
                    {selected.challenges.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />{c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border/20">
                <h4 className="font-semibold mb-4 flex items-center gap-2"><Sprout className="w-4 h-4 text-primary" />Suitable Crops</h4>
                <div className="flex flex-wrap gap-2">
                  {selected.suitableCrops.map((c) => (
                    <span key={c} className="px-3 py-1.5 text-sm font-medium rounded-xl bg-primary/10 text-primary">{c}</span>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(selected.recommendations).map(([key, value]) => (
                  <div key={key} className="p-4 rounded-2xl bg-muted/30">
                    <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-1">{key.replace(/([A-Z])/g, " $1").trim()}</h5>
                    <p className="text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Market Trend Mini Chart (illustrative, not real history) ──────── */
const PriceTrendChart = ({ price }: { price: number }) => {
  const data = useMemo(() => getIllustrativePriceTrend(price), [price]);
  if (data.length === 0) return null;
  return (
    <div className="h-16 w-28">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="price" stroke="currentColor" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ─── Market Row (interactive) ───────────────────────────── */
const MarketRow = ({ entry }: { entry: MarketEntry }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <motion.tr className="border-b border-border/20 hover:bg-muted/30 transition-colors cursor-hover"
        whileHover={{ scale: 1.002 }} onClick={() => setExpanded(!expanded)}>
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Wheat className="w-4 h-4 text-primary" /></div>
            <div>
              <p className="font-medium text-sm">{entry.crop}</p>
              <p className="text-xs text-muted-foreground">{entry.market}</p>
            </div>
          </div>
        </td>
        <td className="py-4 px-4 text-right font-mono font-medium">{entry.unit.replace("/qt", "")}{entry.price.toLocaleString()}</td>
        <td className="py-4 px-4 text-right">
          {entry.change === null ? (
            <span className="text-sm text-muted-foreground">—</span>
          ) : (
            <span className={`inline-flex items-center gap-1 text-sm font-medium ${entry.change >= 0 ? "text-green-500" : "text-red-500"}`}>
              {entry.change >= 0 ? <ArrowRight className="w-3 h-3 rotate-[-45deg]" /> : <ArrowRight className="w-3 h-3 rotate-[135deg]" />}
              {entry.change >= 0 ? "+" : ""}{entry.change}%
            </span>
          )}
        </td>
        <td className="py-4 px-4 text-right text-sm text-muted-foreground hidden md:table-cell">{entry.volume}</td>
        <td className="py-4 px-4 hidden lg:table-cell"><PriceTrendChart price={entry.price} /></td>
      </motion.tr>
      <AnimatePresence>
        {expanded && (
          <motion.tr initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <td colSpan={5} className="px-4 pb-4">
              <div className="bg-muted/20 rounded-2xl p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
                  <div><p className="text-muted-foreground text-xs mb-1">Market</p><p className="font-medium">{entry.market}</p></div>
                  <div><p className="text-muted-foreground text-xs mb-1">State</p><p className="font-medium">{entry.state}</p></div>
                  <div><p className="text-muted-foreground text-xs mb-1">Category</p><p className="font-medium">{entry.category}</p></div>
                  <div><p className="text-muted-foreground text-xs mb-1">Arrival Date</p><p className="font-medium">{entry.lastUpdated || "—"}</p></div>
                </div>
                <p className="mt-4 text-[11px] text-muted-foreground text-center">Trend below is illustrative only — the live price above is real, but day-by-day history isn't available from this data source.</p>
                <div className="mt-2 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getIllustrativePriceTrend(entry.price, 14)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={50} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                      <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>);
};

/* ─── Scheme Detail Modal ────────────────────────────────── */
const SchemeDetailModal = ({ scheme, onClose }: { scheme: { title: string; category: string; description: string; eligibility: string; benefit: string; details?: string }; onClose: () => void }) => (
  <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <motion.div className="bg-card rounded-3xl border border-border/30 w-full max-w-lg overflow-hidden shadow-2xl"
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">{scheme.category}</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted cursor-hover"><X className="w-4 h-4" /></button>
        </div>
        <h3 className="font-bold text-xl mb-3">{scheme.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{scheme.description}</p>
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/10">
            <h4 className="font-semibold text-sm text-green-600 mb-1 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Eligibility</h4>
            <p className="text-sm text-muted-foreground">{scheme.eligibility}</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <h4 className="font-semibold text-sm text-blue-600 mb-1 flex items-center gap-2"><Star className="w-4 h-4" />Benefits</h4>
            <p className="text-sm text-muted-foreground">{scheme.benefit}</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
            <h4 className="font-semibold text-sm text-amber-600 mb-1 flex items-center gap-2"><FileText className="w-4 h-4" />How to Apply</h4>
            <p className="text-sm text-muted-foreground">Visit your nearest Common Service Center (CSC) or apply online through the official portal. Keep your Aadhaar card, land records, and bank account details ready. For assistance, call the Kisan Call Center at 1800-180-1551.</p>
          </div>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
/* ─── Government Schemes (static reference data) ─────────────────── */
const GOVERNMENT_SCHEMES = [
  { title: "PM-KISAN", category: "Income Support", description: "Direct income support of ₹6,000 per year to farmer families across the country.", eligibility: "Small and marginal farmers with less than 2 hectares of land", benefit: "₹6,000/year in 3 installments" },
  { title: "PMFBY", category: "Insurance", description: "Comprehensive crop insurance scheme covering all stages of the crop cycle.", eligibility: "All farmers growing notified crops in notified areas", benefit: "Full crop insurance at minimal premium" },
  { title: "KCC Scheme", category: "Credit", description: "Access to affordable credit for farmers to meet cultivation and other needs.", eligibility: "All farmers, tenant farmers, sharecroppers", benefit: "Low-interest loans up to ₹3 lakh" },
  { title: "Soil Health Card", category: "Soil Health", description: "Scheme to provide soil health cards to farmers for informed nutrient management.", eligibility: "All farmers across the country", benefit: "Free soil testing and personalized recommendations" },
  { title: "PM-KUSUM", category: "Energy", description: "Installation of solar pumps and grid-connected solar power plants for farmers.", eligibility: "Individual farmers and cooperatives", benefit: "60% subsidy on solar pump installation" },
  { title: "e-NAM", category: "Market Access", description: "National Agriculture Market — a pan-India electronic trading portal for farm produce.", eligibility: "All farmers and traders registered on the platform", benefit: "Better price discovery and market access" },
];

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState<GeoLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const locationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  /* ─── Market state ─── */
  const [marketQuery, setMarketQuery] = useState("");
  const [marketCategory, setMarketCategory] = useState<CropCategory>("All Crops");
  const [marketData, setMarketData] = useState<{ entries: MarketEntry[]; insights: MarketInsight[]; configured: boolean }>({ entries: [], insights: [], configured: false });
  const [marketLoading, setMarketLoading] = useState(true);
  const marketDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (marketDebounceRef.current) clearTimeout(marketDebounceRef.current);
    marketDebounceRef.current = setTimeout(async () => {
      setMarketLoading(true);
      try {
        const result = await getMarketData({ query: marketQuery, category: marketCategory });
        setMarketData(result);
      } finally {
        setMarketLoading(false);
      }
    }, marketQuery ? 400 : 0);
    return () => { if (marketDebounceRef.current) clearTimeout(marketDebounceRef.current); };
  }, [marketQuery, marketCategory]);

  /* ─── Learning Center state ─── */
  const [videoCategory, setVideoCategory] = useState<VideoCategory | null>(null);
  const [videoQuery, setVideoQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const videoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (videoDebounceRef.current) clearTimeout(videoDebounceRef.current);
    videoDebounceRef.current = setTimeout(async () => {
      setVideosLoading(true);
      try {
        let results: YouTubeVideo[];
        if (videoQuery) results = await searchVideos(videoQuery, videoCategory ?? undefined);
        else if (videoCategory) results = await getVideosByCategory(videoCategory);
        else results = await getAllVideos();
        setVideos(results);
      } finally {
        setVideosLoading(false);
      }
    }, videoQuery ? 400 : 0);
    return () => { if (videoDebounceRef.current) clearTimeout(videoDebounceRef.current); };
  }, [videoCategory, videoQuery]);

  /* ─── Scheme state ─── */
  const [schemeQuery, setSchemeQuery] = useState("");
  const [selectedScheme, setSelectedScheme] = useState<(typeof GOVERNMENT_SCHEMES)[0] | null>(null);

  const fetchWeatherForLocation = useCallback(async (lat: number, lon: number, name: string) => {
    setWeatherLoading(true); setWeatherError(null);
    try { const data = await fetchWeather(lat, lon, name); setWeatherData(data); }
    catch { setWeatherError("Unable to fetch weather data. Please try again."); }
    finally { setWeatherLoading(false); }
  }, []);

  useEffect(() => { fetchWeatherForLocation(28.6139, 77.209, "New Delhi"); }, [fetchWeatherForLocation]);

  useEffect(() => {
    if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
    if (locationQuery.length < 2) { setLocationResults([]); setShowLocationDropdown(false); return; }
    locationDebounceRef.current = setTimeout(async () => {
      const results = await searchLocations(locationQuery);
      setLocationResults(results); setShowLocationDropdown(results.length > 0);
    }, 400);
    return () => { if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current); };
  }, [locationQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node) &&
        locationInputRef.current && !locationInputRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationSelect = (loc: GeoLocation) => {
    setSelectedLocation(loc); setLocationQuery(""); setShowLocationDropdown(false);
    fetchWeatherForLocation(loc.latitude, loc.longitude, loc.admin1 ? `${loc.name}, ${loc.admin1}` : loc.name);
  };

  const advisoryText = weatherData ? generateAdvisory(weatherData) : "";

  /* ─── Contact form ─── */
  const { register: contactRegister, handleSubmit: contactHandleSubmit, formState: { errors: contactErrors }, reset: contactReset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onContactSubmit = (data: ContactFormData) => {
    toast.success("Message sent successfully!", { description: `Thank you, ${data.name}. We'll get back to you within 24 hours.` });
    contactReset();
  };

  /* ─── Static data ─── */
  const services = [
    { icon: Cloud, title: "Weather Intelligence", description: "Real-time forecasts, rain predictions, and farming recommendations based on hyperlocal weather data.", color: "bg-blue-500/5" },
    { icon: TrendingUp, title: "Market Prices", description: "Live crop pricing across mandis, price trend analysis, and intelligent market insights.", color: "bg-green-500/5" },
    { icon: BookOpen, title: "Crop Advisory", description: "Complete growing guides, soil recommendations, irrigation schedules, and harvest planning.", color: "bg-amber-500/5" },
    { icon: Bug, title: "Disease Detection", description: "AI-powered image analysis to identify crop diseases, with treatment and prevention guidance.", color: "bg-red-500/5" },
    { icon: FlaskConical, title: "Soil Health", description: "Soil nutrient analysis, improvement recommendations, and fertility management.", color: "bg-purple-500/5" },
    { icon: Building2, title: "Government Schemes", description: "Comprehensive database of farmer welfare schemes, subsidies, and financial assistance.", color: "bg-indigo-500/5" },
    { icon: GraduationCap, title: "Learning Center", description: "Educational resources, video tutorials, best practices, and modern farming techniques.", color: "bg-teal-500/5" },
    { icon: Newspaper, title: "Agri News", description: "Latest agricultural news, market updates, weather alerts, and government announcements.", color: "bg-rose-500/5" },
    { icon: Users, title: "Expert Consultation", description: "Connect with agricultural experts for personalized guidance on your farming needs.", color: "bg-cyan-500/5" },
    { icon: Tractor, title: "Farm Management", description: "Tools for crop planning, resource management, and sustainable farming practices.", color: "bg-orange-500/5" },
    { icon: Droplets, title: "Water Management", description: "Irrigation optimization, water conservation techniques, and scheduling recommendations.", color: "bg-sky-500/5" },
    { icon: Leaf, title: "Sustainable Farming", description: "Organic farming resources, certification guidance, and eco-friendly practice adoption.", color: "bg-lime-500/5" },
  ];

  const cropData = [
    { icon: Wheat, name: "Wheat", season: "Rabi", soil: "Loamy", water: "Moderate", days: "120-150" },
    { icon: Flower2, name: "Rice", season: "Kharif", soil: "Clayey", water: "High", days: "90-120" },
    { icon: Apple, name: "Maize", season: "Kharif", soil: "Sandy Loam", water: "Moderate", days: "90-110" },
    { icon: Carrot, name: "Sugarcane", season: "Annual", soil: "Loamy", water: "High", days: "300-365" },
    { icon: Grape, name: "Cotton", season: "Kharif", soil: "Black", water: "Moderate", days: "160-180" },
    { icon: Cherry, name: "Mustard", season: "Rabi", soil: "Sandy Loam", water: "Low", days: "110-130" },
  ];

  const filteredSchemes = useMemo(() => {
    const q = schemeQuery.toLowerCase().trim();
    if (!q) return GOVERNMENT_SCHEMES;
    return GOVERNMENT_SCHEMES.filter((s) =>
      s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  }, [schemeQuery]);

  const faqData = [
    { question: "How accurate is the weather forecast?", answer: "Kisan Mitra uses data from multiple meteorological sources, satellite imagery, and local weather stations to provide hyperlocal forecasts with 85-90% accuracy for 3-day predictions and 75-80% for 7-day forecasts." },
    { question: "How often are market prices updated?", answer: "Market prices are updated twice daily — once in the morning (by 11 AM) and once in the evening (by 6 PM). We source data directly from APMC mandis, e-NAM, and other government-recognized market committees across India." },
    { question: "Can I get crop-specific recommendations?", answer: "Yes. Kisan Mitra provides detailed crop-specific advisory covering soil preparation, sowing guidance, irrigation schedules, fertilizer recommendations, pest management, and harvest planning for over 50 major crops." },
    { question: "Is the disease detection feature free?", answer: "Yes, there's no charge to use it. Upload a photo of your crop and our AI will give you a visual read — what it observes, possible causes, and suggested next steps. It's a helpful first look, not a certified diagnosis, so we always recommend confirming with your local agricultural extension officer before applying any treatment." },
    { question: "How do I apply for government schemes?", answer: "Kisan Mitra provides complete guidance on scheme eligibility, documents, and the application process with links to official portals. Actual submission must be done through official government portals." },
    { question: "Can I learn farming through video tutorials?", answer: "Yes! Our Learning Center has a rich library of YouTube videos covering organic farming, irrigation, pest control, modern techniques, and more — all accessible directly from the platform." },
  ];

  /* ═══════════ RENDER ═══════════ */
  return (
    <div className="relative">
      {/* ═══════════ HERO ═══════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern dark:bg-hero-pattern-dark" />
        <FloatingParticles />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="section-padding relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div className="space-y-8" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
              <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Sparkles className="w-4 h-4" /> AI-Powered Agriculture Platform
              </motion.div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                Empowering{" "}
                <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">Farmers</span>
                <br />Through Technology
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Kisan Mitra brings all essential agricultural services into one intelligent platform — from real-time weather and market prices to AI-powered disease detection and expert advisory.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.a href="#services" className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold text-lg inline-flex items-center gap-2 shadow-lg shadow-primary/25 cursor-hover"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  Explore Services <ArrowRight className="w-5 h-5" />
                </motion.a>
                <motion.a href="#learn" className="px-8 py-4 bg-card border border-border/50 text-foreground rounded-2xl font-semibold text-lg inline-flex items-center gap-2 cursor-hover"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <GraduationCap className="w-5 h-5" /> Learning Center
                </motion.a>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                      {["AK", "RS", "MP", "VK"][i - 1]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-secondary">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
                  <p className="text-sm text-muted-foreground">Trusted by <span className="font-semibold text-foreground">10,000+</span> farmers</p>
                </div>
              </div>
            </motion.div>
            <motion.div className="relative hidden lg:block" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                <motion.div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10"
                  animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} />
                <div className="absolute inset-4 rounded-[2.5rem] bg-card border border-border/30 overflow-hidden backdrop-blur-sm">
                  <div className="p-8 h-full flex flex-col justify-center">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5"><div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"><CloudRain className="w-5 h-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Rain Prediction</p><p className="font-bold">75% chance tomorrow</p></div></div>
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/5"><div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center"><DollarSign className="w-5 h-5 text-secondary" /></div><div><p className="text-sm text-muted-foreground">Wheat Price</p><p className="font-bold text-secondary">₹2,450/qt</p></div></div>
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/5"><div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center"><Sprout className="w-5 h-5 text-green-600" /></div><div><p className="text-sm text-muted-foreground">Crop Health</p><p className="font-bold text-green-600">Excellent</p></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <div className="w-6 h-10 rounded-full border-2 border-border flex items-start justify-center p-1.5">
              <motion.div className="w-1.5 h-2.5 rounded-full bg-primary" animate={{ y: [0, 6, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="py-16 bg-card/30 border-y border-border/20">
        <div className="section-padding">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 10000, suffix: "+", label: "Active Farmers" },
              { value: 500, suffix: "+", label: "Mandi Markets" },
              { value: 50, suffix: "+", label: "Crop Guides" },
              { value: 98, suffix: "%", label: "Satisfaction Rate" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} className="space-y-2">
                <p className="text-4xl sm:text-5xl font-extrabold text-gradient"><AnimatedCounter value={stat.value} suffix={stat.suffix} /></p>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SERVICES ═══════════ */}
      <SectionWrapper id="services" title="All Your Farming Needs, One Platform" subtitle="Comprehensive services designed to support every stage of the agricultural journey">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {services.map((service, i) => (
            <motion.div key={service.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <ServiceCard {...service} />
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ═══════════ FARMER SERVICES & RENTAL MARKETPLACE ═══════════ */}
      <SectionWrapper id="marketplace" title="Farmer Services & Rental Marketplace" subtitle="Rent machinery and tools, buy seeds & pesticides, and hire workers and experts — all from trusted providers near you" className="bg-card/30 border-y border-border/20" eyebrow="Connect via WhatsApp">
        <FarmerMarketplace />
      </SectionWrapper>

      {/* ═══════════ WEATHER (unchanged — already functional) ═══════════ */}
      <SectionWrapper id="weather" title="Weather Intelligence" subtitle="Real-time forecasts with location-based farming recommendations">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md" ref={locationDropdownRef}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input ref={locationInputRef} type="text" value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onFocus={() => locationResults.length > 0 && setShowLocationDropdown(true)}
                  placeholder="Search city or village..." className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border/50 bg-card text-sm outline-none focus:border-primary transition-colors" />
                {locationQuery && <button onClick={() => { setLocationQuery(""); setShowLocationDropdown(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-muted cursor-hover"><X className="w-4 h-4 text-muted-foreground" /></button>}
              </div>
              <AnimatePresence>
                {showLocationDropdown && locationResults.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -8, scaleY: 0.95 }} animate={{ opacity: 1, y: 0, scaleY: 1 }} exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                    className="absolute top-full mt-2 w-full bg-card border border-border/50 rounded-2xl shadow-xl shadow-black/5 overflow-hidden z-50">
                    {locationResults.map((loc) => (
                      <button key={loc.id} onClick={() => handleLocationSelect(loc)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors cursor-hover">
                        <MapPinIcon className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0"><p className="text-sm font-medium truncate">{loc.name}{loc.admin1 ? `, ${loc.admin1}` : ""}</p><p className="text-xs text-muted-foreground">{loc.country}</p></div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {selectedLocation && (
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                onClick={() => fetchWeatherForLocation(selectedLocation.latitude, selectedLocation.longitude, selectedLocation.admin1 ? `${selectedLocation.name}, ${selectedLocation.admin1}` : selectedLocation.name)}
                className="px-4 py-3 rounded-2xl bg-primary/10 text-primary text-sm font-medium flex items-center gap-2 hover:bg-primary/15 transition-colors cursor-hover shrink-0">
                <RefreshCw className="w-4 h-4" /> Refresh
              </motion.button>
            )}
          </div>

          {weatherLoading && (
            <div className="bg-card rounded-3xl border border-border/30 p-12 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="text-sm text-muted-foreground">Fetching latest weather data...</p>
            </div>
          )}
          {weatherError && !weatherLoading && (
            <div className="bg-card rounded-3xl border border-border/30 p-8 text-center">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-destructive" /><p className="text-sm text-muted-foreground">{weatherError}</p>
              <button onClick={() => fetchWeatherForLocation(selectedLocation?.latitude ?? 28.6139, selectedLocation?.longitude ?? 77.209, selectedLocation?.name ?? "New Delhi")}
                className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium cursor-hover">Retry</button>
            </div>
          )}
          {weatherData && !weatherLoading && !weatherError && (
            <>
              <div className="bg-card rounded-3xl border border-border/30 p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div><h3 className="text-2xl font-bold flex items-center gap-2"><MapPinIcon className="w-5 h-5 text-primary" />{weatherData.location}</h3><p className="text-sm text-muted-foreground mt-1">{weatherData.current.condition} • Updated just now</p></div>
                  <div className="flex items-center gap-4">
                    <div className="text-right"><p className="text-5xl font-extrabold">{weatherData.current.temperature}°</p><p className="text-sm text-muted-foreground">Feels like {weatherData.current.feelsLike}°</p></div>
                    {(() => { const IconComp = weatherIconMap[weatherData.current.icon] ?? Cloud; return <IconComp className="w-14 h-14 text-secondary" />; })()}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Thermometer, label: "Temperature", value: `${weatherData.current.temperature}°C` },
                    { icon: Droplets, label: "Humidity", value: `${weatherData.current.humidity}%` },
                    { icon: Wind, label: "Wind Speed", value: `${weatherData.current.windSpeed} km/h` },
                    { icon: CloudSun, label: "Condition", value: weatherData.current.condition },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="p-4 rounded-2xl bg-muted/30 text-center"><Icon className="w-5 h-5 mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground mb-1">{label}</p><p className="font-semibold">{value}</p></div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {weatherData.forecast.map((day) => <WeatherCard key={day.date} day={day.dayName} icon={day.icon} high={day.high} low={day.low} rainProb={day.rainProb} condition={day.condition} />)}
              </div>
              <div className="bg-card rounded-3xl border border-border/30 p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div><h4 className="font-semibold">Farming Advisory</h4><p className="text-sm text-muted-foreground mt-1 leading-relaxed">{advisoryText}</p></div>
                </div>
              </div>
            </>
          )}
        </div>
      </SectionWrapper>

      {/* ═══════════ MARKET PRICES (fully interactive) ═══════════ */}
      <SectionWrapper id="market" title="Market Price Dashboard" subtitle="Live commodity prices from mandis across India — search, filter & analyze trends" eyebrow="Live Agmarknet Data">
        <div className="space-y-6">
          {!marketLoading && !marketData.configured && (
            <div className="max-w-xl mx-auto text-center text-xs text-muted-foreground bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-2">
              Showing sample prices. Add a data.gov.in API key (see .env.example / netlify/functions) to enable live Agmarknet prices.
            </div>
          )}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border/30 text-sm flex-1 max-w-sm">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input type="text" value={marketQuery} onChange={(e) => setMarketQuery(e.target.value)}
                placeholder="Search crop, market, or state..."
                className="bg-transparent outline-none flex-1 min-w-0" />
              {marketQuery && <button onClick={() => setMarketQuery("")} className="p-0.5 rounded hover:bg-muted cursor-hover"><X className="w-4 h-4 text-muted-foreground" /></button>}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
              {MARKET_CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setMarketCategory(cat)}
                  className={`px-4 py-2 text-sm rounded-xl border transition-all cursor-hover whitespace-nowrap ${marketCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/30 hover:border-primary/30"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {marketLoading ? (
            <div className="bg-card rounded-3xl border border-border/30 p-12 text-center animate-pulse">
              <p className="text-muted-foreground text-sm">Loading market prices…</p>
            </div>
          ) : marketData.entries.length > 0 ? (
            <>
              <div className="bg-card rounded-3xl border border-border/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/20 bg-muted/20">
                        <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Crop / Market</th>
                        <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Price</th>
                        <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">% Change</th>
                        <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Volume</th>
                        <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Trend*</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketData.entries.map((entry) => <MarketRow key={`${entry.crop}-${entry.market}`} entry={entry} />)}
                    </tbody>
                  </table>
                </div>
                {marketData.configured && (
                  <p className="text-[11px] text-muted-foreground text-center py-2 border-t border-border/20">*Trend charts are illustrative, not real historical data. Prices above are live.</p>
                )}
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {marketData.insights.map((insight) => (
                  <div key={insight.label} className="p-5 rounded-2xl bg-card border border-border/30 text-center">
                    <p className="text-sm text-muted-foreground mb-1">{insight.label}</p>
                    <p className="font-bold text-lg">{insight.value}</p>
                    <p className={`text-sm font-medium ${insight.color}`}>{insight.change}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-card rounded-3xl border border-border/30 p-12 text-center">
              <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground">No crops found. Try a different search or category.</p>
            </div>
          )}
        </div>
      </SectionWrapper>

      {/* ═══════════ CROP ADVISORY ═══════════ */}
      <SectionWrapper id="crops" title="Crop Advisory Center" subtitle="Detailed growing guidance for major crops — tap any card to expand">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cropData.map((crop, i) => (
            <motion.div key={crop.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <CropCard {...crop} />
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ═══════════ DISEASE DETECTION ═══════════ */}
      <SectionWrapper id="disease" title="AI Disease Detection" subtitle="Upload a crop photo for an AI-assisted visual read, with suggested next steps" eyebrow="Powered by Gemini Vision">
        <DiseaseUploader />
      </SectionWrapper>

      {/* ═══════════ SOIL HEALTH (interactive) ═══════════ */}
      <SectionWrapper id="soil" title="Soil Health Center" subtitle="Select your soil type to get personalized recommendations for maximum yield">
        <SoilTypeSelector />
      </SectionWrapper>

      {/* ═══════════ GOVERNMENT SCHEMES (searchable + modal) ═══════════ */}
      <SectionWrapper id="schemes" title="Government Schemes Hub" subtitle="Complete information on farmer welfare programs — search, filter, and view details">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border/30 text-sm max-w-sm mx-auto">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input type="text" value={schemeQuery} onChange={(e) => setSchemeQuery(e.target.value)}
              placeholder="Search schemes by name or category..."
              className="bg-transparent outline-none flex-1 min-w-0" />
            {schemeQuery && <button onClick={() => setSchemeQuery("")} className="p-0.5 rounded hover:bg-muted cursor-hover"><X className="w-4 h-4 text-muted-foreground" /></button>}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchemes.map((scheme, i) => (
              <motion.div key={scheme.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl p-6 border border-border/30 cursor-hover"
                whileHover={{ y: -4 }} onClick={() => setSelectedScheme(scheme)}>
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mb-3">{scheme.category}</span>
                <h3 className="font-bold text-lg mb-2">{scheme.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{scheme.description}</p>
                <div className="text-sm font-medium text-primary flex items-center gap-1">View Details <ArrowRight className="w-3 h-3" /></div>
              </motion.div>
            ))}
          </div>
          {filteredSchemes.length === 0 && (
            <div className="text-center py-8"><p className="text-muted-foreground">No schemes match your search. Try different keywords.</p></div>
          )}
        </div>
        <AnimatePresence>{selectedScheme && <SchemeDetailModal scheme={selectedScheme} onClose={() => setSelectedScheme(null)} />}</AnimatePresence>
      </SectionWrapper>

      {/* ═══════════ LEARNING CENTER (YouTube videos) ═══════════ */}
      <SectionWrapper id="learn" title="Learning Center" subtitle="Watch expert farming videos — browse by category or search for topics" eyebrow="Live YouTube Search">
        <div className="space-y-6">
          {!import.meta.env.VITE_YOUTUBE_API_KEY && (
            <div className="max-w-xl mx-auto text-center text-xs text-muted-foreground bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-2">
              Showing a limited preview. Add a YouTube Data API key (see .env.example) to enable live search across all categories.
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border/30 text-sm flex-1 max-w-sm">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input type="text" value={videoQuery} onChange={(e) => setVideoQuery(e.target.value)}
                placeholder="Search videos by title or topic..."
                className="bg-transparent outline-none flex-1 min-w-0" />
              {videoQuery && <button onClick={() => setVideoQuery("")} className="p-0.5 rounded hover:bg-muted cursor-hover"><X className="w-4 h-4 text-muted-foreground" /></button>}
            </div>
            <button onClick={() => { setVideoCategory(null); setVideoQuery(""); }} className="text-sm text-primary font-medium flex items-center gap-1 hover:underline cursor-hover">
              <RefreshCw className="w-3 h-3" /> Show All
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {ALL_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => { setVideoCategory(cat === videoCategory ? null : cat); setVideoQuery(""); }}
                className={`px-4 py-2 text-sm rounded-xl border transition-all cursor-hover whitespace-nowrap flex items-center gap-2 ${videoCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/30 hover:border-primary/30"}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Video grid */}
          {videosLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-card border border-border/30 overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : videos.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.map((video) => <VideoCard key={video.videoId} video={video} onPlay={setSelectedVideo} />)}
            </div>
          ) : (
            <div className="text-center py-12">
              <Video className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground">No videos found. Try a different search term or category.</p>
            </div>
          )}
        </div>
        <AnimatePresence>{selectedVideo && <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />}</AnimatePresence>
      </SectionWrapper>

      {/* ═══════════ AGRI NEWS ═══════════ */}
      <SectionWrapper id="news" title="Agricultural News Center" subtitle="Latest updates and stories from Indian agriculture">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "New MSP Rates Announced for Kharif Season 2026", date: "2 hours ago", tag: "Policy", tagColor: "bg-blue-500/10 text-blue-600", link: "#" },
            { title: "Monsoon Arrives Early: What It Means for Farmers", date: "5 hours ago", tag: "Weather", tagColor: "bg-sky-500/10 text-sky-600", link: "#" },
            { title: "Digital Agriculture Mission Expands to 500 Districts", date: "1 day ago", tag: "Technology", tagColor: "bg-purple-500/10 text-purple-600", link: "#" },
            { title: "Record Wheat Production Expected This Year", date: "1 day ago", tag: "Production", tagColor: "bg-green-500/10 text-green-600", link: "#" },
            { title: "New Subsidy Program for Drip Irrigation Systems", date: "2 days ago", tag: "Subsidy", tagColor: "bg-amber-500/10 text-amber-600", link: "#" },
            { title: "Export Ban on Certain Rice Varieties Lifted", date: "3 days ago", tag: "Trade", tagColor: "bg-red-500/10 text-red-600", link: "#" },
          ].map((article) => (
            <motion.a key={article.title} href={article.link} className="bg-card rounded-2xl p-6 border border-border/30 cursor-hover group block"
              whileHover={{ y: -3 }} onClick={(e) => { e.preventDefault(); toast.info("Article coming soon!", { description: "Full news integration is being built." }); }}>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${article.tagColor} mb-3`}>{article.tag}</span>
              <h3 className="font-bold leading-snug mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {article.date}</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </motion.a>
          ))}
        </div>
      </SectionWrapper>

      {/* ═══════════ EXPERT CONSULTATION ═══════════ */}
      <SectionWrapper id="experts" title="Expert Consultation" subtitle="Connect with agricultural specialists for personalized farming advice">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { name: "Dr. Ramesh Kumar", role: "Soil Scientist", exp: "25 years", specialty: "Soil Health & Fertility", avatar: "RK" },
            { name: "Priya Singh", role: "Plant Pathologist", exp: "18 years", specialty: "Disease Diagnosis & Treatment", avatar: "PS" },
            { name: "Vikram Reddy", role: "Agronomist", exp: "20 years", specialty: "Crop Planning & Yield Optimization", avatar: "VR" },
          ].map((expert) => (
            <motion.div key={expert.name} className="bg-card rounded-2xl p-6 border border-border/30 text-center cursor-hover"
              whileHover={{ y: -4 }}>
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                {expert.avatar}
              </div>
              <h3 className="font-bold text-lg">{expert.name}</h3>
              <p className="text-sm text-muted-foreground">{expert.role}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground">{expert.exp}</span>
                <span className="px-2 py-0.5 text-xs rounded-md bg-primary/10 text-primary">{expert.specialty}</span>
              </div>
              <motion.button className="mt-4 w-full py-2.5 rounded-xl bg-primary/10 text-primary font-medium text-sm flex items-center justify-center gap-2 cursor-hover"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => toast.success("Consultation requested!", { description: `Connecting you with ${expert.name}. A session link will be shared shortly.` })}>
                <MessageSquare className="w-4 h-4" /> Book Consultation
              </motion.button>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ═══════════ FARM MANAGEMENT ═══════════ */}
      <SectionWrapper id="farm-mgmt" title="Farm Management Tools" subtitle="Plan your farming season with interactive calculators and planners">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Calculator, title: "Fertilizer Calculator", description: "Calculate exact NPK requirements based on your crop type and acreage.", action: "Calculate Now" },
            { icon: Calendar, title: "Season Planner", description: "Plan your entire crop calendar with optimal sowing and harvesting dates.", action: "Open Planner" },
            { icon: BarChart3, title: "Profit Estimator", description: "Estimate your expected profit based on crop, input costs, and market prices.", action: "Estimate Profit" },
          ].map((tool) => (
            <motion.div key={tool.title} className="bg-card rounded-2xl p-6 border border-border/30 cursor-hover text-center"
              whileHover={{ y: -4 }}>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <tool.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{tool.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
              <motion.button className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium cursor-hover"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => toast.success("Tool launching!", { description: `${tool.title} is being loaded. Full functionality coming in the next update.` })}>
                {tool.action}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ═══════════ WATER MANAGEMENT ═══════════ */}
      <SectionWrapper id="water" title="Water Management" subtitle="Smart irrigation guidance and water conservation strategies">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { icon: Droplets, title: "Drip Irrigation", desc: "Save up to 60% water compared to flood irrigation. Best for row crops and orchards." },
            { icon: CloudRain, title: "Rainwater Harvesting", desc: "Capture and store monsoon runoff. One hectare can collect 1 crore liters annually." },
            { icon: Zap, title: "Solar Pumping", desc: "Government-subsidized solar pumps reduce electricity costs and ensure reliable water supply." },
            { icon: Sprout, title: "Mulching", desc: "Reduce evaporation by 70% with organic mulch. Retains moisture and suppresses weeds." },
          ].map((item) => (
            <motion.div key={item.title} className="bg-card rounded-2xl p-6 border border-border/30 cursor-hover text-center"
              whileHover={{ y: -4 }}>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ═══════════ SUSTAINABLE FARMING ═══════════ */}
      <SectionWrapper id="sustainable" title="Sustainable Farming" subtitle="Eco-friendly practices that increase yield while protecting the environment">
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Leaf, title: "Organic Certification Guide", steps: ["Understand NPOP standards", "Stop using prohibited substances for 3 years", "Maintain detailed farm records", "Apply for certification through accredited agencies", "Annual inspections and renewal"] },
            { icon: Sprout, title: "Crop Rotation Strategies", steps: ["Year 1: Legumes (fix nitrogen)", "Year 2: Cereals (use nitrogen)", "Year 3: Root crops (break soil)", "Year 4: Cover crops (restore organic matter)", "Repeat cycle for sustainable yields"] },
          ].map((practice) => (
            <motion.div key={practice.title} className="bg-card rounded-2xl p-6 border border-border/30 cursor-hover"
              whileHover={{ y: -4 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center"><practice.icon className="w-6 h-6 text-green-600" /></div>
                <h3 className="font-bold text-lg">{practice.title}</h3>
              </div>
              <ul className="space-y-2">
                {practice.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ═══════════ SUCCESS STORIES ═══════════ */}
      <SectionWrapper id="stories" title="Farmer Success Stories" subtitle="Real stories of transformation and growth">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "Rajesh Patel", location: "Gujarat", story: "Using Kisan Mitra's weather intelligence, I optimized my irrigation schedule and reduced water usage by 30% while increasing my cotton yield by 25%.", crop: "Cotton Farmer" },
            { name: "Anita Sharma", location: "Punjab", story: "I uploaded a photo of some discolored leaves and the AI flagged a possible early blight pattern. It pointed me to the right next step, and I caught it before it spread.", crop: "Wheat Farmer" },
            { name: "Mohan Reddy", location: "Telangana", story: "Market price tracking helped me time my paddy sale perfectly. I earned ₹18,000 more than what local traders were offering at harvest time.", crop: "Paddy Farmer" },
          ].map((story, i) => (
            <motion.div key={story.name} className="bg-card rounded-2xl p-6 border border-border/30 relative cursor-hover"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}>
              <Quote className="w-10 h-10 text-primary/15 absolute top-4 right-4" />
              <p className="text-sm leading-relaxed mb-4 relative z-10">{story.story}</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border/20">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">{story.name.split(" ").map((n) => n[0]).join("")}</div>
                <div><p className="font-semibold text-sm">{story.name}</p><p className="text-xs text-muted-foreground">{story.crop} · {story.location}</p></div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ═══════════ FAQ ═══════════ */}
      <SectionWrapper id="faq" title="Frequently Asked Questions" subtitle="Quick answers to common questions about Kisan Mitra">
        <div className="max-w-3xl mx-auto space-y-3">
          {faqData.map((faq, i) => (
            <motion.div key={faq.question} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <FAQItem {...faq} />
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ═══════════ CONTACT (functional form) ═══════════ */}
      <SectionWrapper id="contact" title="Get in Touch" subtitle="We're here to help you grow">
        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="space-y-8">
            <div className="space-y-6">
              {[
                { icon: Phone, label: "Farmer Helpline", value: "1800-123-KISAN (54726)", sub: "Available 8 AM - 8 PM, all days" },
                { icon: Mail, label: "Email Support", value: "support@kisanmitra.in", sub: "We respond within 24 hours" },
                { icon: MapPin, label: "Our Office", value: "Agri-Tech Park, New Delhi", sub: "India — 110001" },
              ].map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-primary" /></div>
                  <div><p className="text-sm text-muted-foreground">{label}</p><p className="font-semibold">{value}</p><p className="text-xs text-muted-foreground">{sub}</p></div>
                </div>
              ))}
            </div>
          </div>
          <motion.form
            className="bg-card rounded-3xl p-8 border border-border/30 space-y-5"
            onSubmit={contactHandleSubmit(onContactSubmit, (errors) => {
              const firstError = Object.values(errors)[0];
              if (firstError?.message) toast.error(firstError.message as string);
            })}
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h3 className="font-bold text-xl mb-2">Send us a message</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name</label>
                <input {...contactRegister("name")} type="text" placeholder="Your name"
                  className={`w-full px-4 py-3 rounded-xl border bg-background text-sm outline-none transition-colors ${contactErrors.name ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"}`} />
                {contactErrors.name && <p className="text-xs text-red-500 mt-1">{contactErrors.name.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Phone</label>
                <input {...contactRegister("phone")} type="tel" placeholder="Your phone number"
                  className={`w-full px-4 py-3 rounded-xl border bg-background text-sm outline-none transition-colors ${contactErrors.phone ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"}`} />
                {contactErrors.phone && <p className="text-xs text-red-500 mt-1">{contactErrors.phone.message}</p>}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Subject</label>
              <select {...contactRegister("subject")}
                className={`w-full px-4 py-3 rounded-xl border bg-background text-sm outline-none transition-colors ${contactErrors.subject ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"}`}>
                <option value="">Select a topic</option>
                <option>Weather Information</option><option>Market Prices</option><option>Crop Advisory</option>
                <option>Disease Detection</option><option>Government Schemes</option><option>General Inquiry</option>
              </select>
              {contactErrors.subject && <p className="text-xs text-red-500 mt-1">{contactErrors.subject.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Message</label>
              <textarea {...contactRegister("message")} rows={4} placeholder="How can we help you?"
                className={`w-full px-4 py-3 rounded-xl border bg-background text-sm outline-none transition-colors resize-none ${contactErrors.message ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"}`} />
              {contactErrors.message && <p className="text-xs text-red-500 mt-1">{contactErrors.message.message}</p>}
            </div>
            <motion.button type="submit" className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold cursor-hover flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Send className="w-4 h-4" /> Send Message
            </motion.button>
          </motion.form>
        </div>
      </SectionWrapper>

      {/* ═══════════ VILLAGE CIVIC SERVICES ═══════════ */}
      <CivicHomeSection />

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-card border-t border-border/30">
        <div className="section-padding py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center"><Sprout className="w-5 h-5 text-primary-foreground" /></div>
                <span className="text-xl font-bold">Kisan<span className="text-primary">Mitra</span></span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Empowering Indian farmers with technology, information, and support — all in one place.</p>
            </div>
            <div><h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {["Weather Forecast", "Market Prices", "Crop Advisory", "Disease Detection", "Soil Health"].map((s) => (
                  <li key={s}><a href={`#${s.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-foreground transition-colors">{s}</a></li>
                ))}
              </ul></div>
            <div><h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {["Learning Center", "Government Schemes", "Agri News", "Success Stories", "FAQ"].map((s) => (
                  <li key={s}><a href="#" className="hover:text-foreground transition-colors">{s}</a></li>
                ))}
              </ul></div>
            <div><h4 className="font-semibold mb-4">Community Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/civic-services#report-issue" className="hover:text-foreground transition-colors">Report Issue</Link></li>
                <li><Link to="/civic-services#track-complaint" className="hover:text-foreground transition-colors">Track Complaint</Link></li>
                <li><Link to="/civic-services#emergency-helpline" className="hover:text-foreground transition-colors">Emergency Contacts</Link></li>
                <li><Link to="/civic-services#community-impact" className="hover:text-foreground transition-colors">Community Impact</Link></li>
              </ul></div>
            <div><h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Helpline: 1800-123-54726</li><li>Email: support@kisanmitra.in</li><li>New Delhi, India</li>
              </ul></div>
          </div>
          <p className="mt-8 text-[11px] text-muted-foreground/80 max-w-3xl">
            Civic Services is a community service feature developed for educational purposes within the KisanMitra platform. Authority workflows and AI analysis are demonstrations only.
          </p>
          <div className="mt-12 pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2026 Kisan Mitra. All rights reserved.</p>
            <div className="flex gap-6"><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
