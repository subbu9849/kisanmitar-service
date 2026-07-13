import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tractor, Wrench, FlaskConical, Users, Droplets, Construction, Truck, Store,
  Search, X, Phone, MapPin, Star, CheckCircle2, XCircle, MessageCircle,
  ChevronRight, Package, type LucideIcon,
} from "lucide-react";
import {
  machineryCategories, machineryListings, type MachineryListing,
  toolCategories, toolListings, type ToolListing,
  inputCategories, inputProducts, type InputProduct,
  workerCategories, workerProfiles, type WorkerProfile,
  irrigationServices, landPrepServices, transportServices, localDirectory,
  type MiniService,
} from "@/services/marketplace";

/* ─── WhatsApp helper ─── */
const waLink = (phone: string, message: string) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

const WhatsAppButton = ({ phone, message, label }: { phone: string; message: string; label: string }) => (
  <a
    href={waLink(phone, message)}
    target="_blank"
    rel="noopener noreferrer"
    onClick={(e) => e.stopPropagation()}
    className="cursor-hover inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366]/10 text-[#1da851] hover:bg-[#25D366]/20 text-xs font-semibold transition-colors w-full"
  >
    <MessageCircle className="w-3.5 h-3.5" />
    {label}
  </a>
);

/* ─── Real photos via /api/marketplace-images (Unsplash proxy) ───────
   Maps each listing category to a search query, fetches once per
   category (cached in-memory for the session), and falls back to the
   emoji already in the data if no key is configured or the fetch fails. */
const CATEGORY_PHOTO_QUERY: Record<string, string> = {
  // Machinery
  Tractor: "tractor field india", Rotavator: "rotavator tractor tilling", Cultivator: "cultivator farm equipment",
  "Seed Drill": "seed drill tractor planting", Harvester: "combine harvester field", "Power Tiller": "power tiller farm",
  "Sprayer Machine": "crop sprayer machine field", Thresher: "thresher machine grain", "Water Tanker": "water tanker farm",
  Excavator: "excavator construction machine", "Mini Tractor": "small tractor farm", Plough: "plough farm field",
  Trailer: "farm trailer tractor", Mulcher: "mulcher farm machine", Transplanter: "rice transplanter farm",
  // Tools
  "Hand Tools": "garden hand tools", "Pumps & Pipes": "water pump irrigation", "Power Tools": "power tools garden",
  "Cutting Tools": "pruning shears garden tools",
  // Inputs
  Seeds: "seeds agriculture closeup", Fertilizers: "fertilizer bag farm", Pesticides: "pesticide spray bottle farm",
  "Bio & Organic": "organic compost farm",
};

const imageCache = new Map<string, string | null>();

function useCategoryPhoto(category: string, fallbackEmoji: string) {
  const [url, setUrl] = useState<string | null>(imageCache.get(category) ?? null);

  useEffect(() => {
    const query = CATEGORY_PHOTO_QUERY[category];
    if (!query) return;
    if (imageCache.has(category)) { setUrl(imageCache.get(category) ?? null); return; }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/marketplace-images?query=${encodeURIComponent(query)}`);
        if (!res.ok) { imageCache.set(category, null); return; }
        const data = await res.json();
        const photoUrl: string | null = data.configured && data.results?.[0]?.url ? data.results[0].url : null;
        imageCache.set(category, photoUrl);
        if (!cancelled) setUrl(photoUrl);
      } catch {
        imageCache.set(category, null);
      }
    })();
    return () => { cancelled = true; };
  }, [category]);

  return url; // null means "use fallbackEmoji" — caller decides rendering
}

/** Renders a real photo if available for the category, otherwise the emoji */
const CategoryImage = ({ category, emoji, className = "" }: { category: string; emoji: string; className?: string }) => {
  const photoUrl = useCategoryPhoto(category, emoji);
  if (photoUrl) {
    return <img src={photoUrl} alt={category} className={`w-full h-full object-cover ${className}`} loading="lazy" />;
  }
  return <span className={className}>{emoji}</span>;
};

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1 text-xs text-amber-500">
    <Star className="w-3.5 h-3.5 fill-amber-500" />
    <span className="font-medium">{rating.toFixed(1)}</span>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   TAB BAR
   ═══════════════════════════════════════════════════════════ */
type MarketplaceTab = "machinery" | "tools" | "inputs" | "workers";

const tabConfig: { id: MarketplaceTab; label: string; icon: LucideIcon }[] = [
  { id: "machinery", label: "Machinery Rental", icon: Tractor },
  { id: "tools", label: "Tools Rental", icon: Wrench },
  { id: "inputs", label: "Seeds, Fertilizers & Pesticides", icon: FlaskConical },
  { id: "workers", label: "Workers & Experts", icon: Users },
];

const TabBar = ({ active, onChange }: { active: MarketplaceTab; onChange: (t: MarketplaceTab) => void }) => (
  <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center scrollbar-none">
    {tabConfig.map((tab) => {
      const Icon = tab.icon;
      const isActive = active === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`cursor-hover shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all whitespace-nowrap ${
            isActive
              ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
              : "bg-card text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground"
          }`}
        >
          <Icon className="w-4 h-4" />
          {tab.label}
        </button>
      );
    })}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   SEARCH + CATEGORY FILTER BAR
   ═══════════════════════════════════════════════════════════ */
const FilterBar = ({
  query, onQuery, placeholder, categories, activeCategory, onCategory,
}: {
  query: string; onQuery: (v: string) => void; placeholder: string;
  categories: readonly string[]; activeCategory: string; onCategory: (c: string) => void;
}) => (
  <div className="space-y-4 mb-8">
    <div className="flex items-center gap-2 px-4 py-2.5 bg-card rounded-xl border border-border/30 text-sm max-w-md mx-auto">
      <Search className="w-4 h-4 text-muted-foreground shrink-0" />
      <input
        type="text" value={query} onChange={(e) => onQuery(e.target.value)} placeholder={placeholder}
        className="bg-transparent outline-none flex-1 min-w-0"
      />
      {query && (
        <button onClick={() => onQuery("")} className="p-0.5 rounded hover:bg-muted cursor-hover">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center scrollbar-none">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategory(cat)}
          className={`cursor-hover shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
            activeCategory === cat
              ? "bg-primary/10 text-primary border-primary/30"
              : "bg-transparent text-muted-foreground border-border/40 hover:border-primary/30"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  </div>
);

const EmptyState = ({ label }: { label: string }) => (
  <div className="text-center py-12">
    <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
    <p className="text-muted-foreground">No {label} match your search. Try different keywords or categories.</p>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MACHINERY RENTAL
   ═══════════════════════════════════════════════════════════ */
const MachineryCard = ({ item, i, onSelect }: { item: MachineryListing; i: number; onSelect: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 9) * 0.04 }}
    whileHover={{ y: -4 }}
    onClick={onSelect}
    className="group bg-card rounded-2xl border border-border/30 overflow-hidden cursor-hover card-hover"
  >
    <div className="h-32 flex items-center justify-center text-6xl bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
      <CategoryImage category={item.category} emoji={item.image} className="text-6xl" />
    </div>
    <div className="p-5">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-semibold text-base leading-snug">{item.name}</h3>
        {item.available ? (
          <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600"><CheckCircle2 className="w-3 h-3" />Available</span>
        ) : (
          <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground"><XCircle className="w-3 h-3" />Booked</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-2">{item.specs}</p>
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold text-primary">{item.rate}<span className="text-xs font-normal text-muted-foreground">{item.rateUnit}</span></span>
        <RatingStars rating={item.rating} />
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
        <MapPin className="w-3 h-3" />{item.location} · {item.ownerName}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <WhatsAppButton phone={item.phone} label="Contact" message={`Hi ${item.ownerName}, I'm interested in renting your ${item.name} listed on Kisan Mitra. Is it available?`} />
        <button onClick={(e) => { e.stopPropagation(); onSelect(); }} className="cursor-hover px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
          View Details
        </button>
      </div>
    </div>
  </motion.div>
);

const MachineryDetailModal = ({ item, onClose }: { item: MachineryListing; onClose: () => void }) => (
  <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <motion.div className="bg-card rounded-3xl border border-border/30 w-full max-w-md overflow-hidden shadow-2xl"
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}>
      <div className="h-40 flex items-center justify-center text-7xl bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
        <CategoryImage category={item.category} emoji={item.image} className="text-7xl" />
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg bg-background/80 hover:bg-muted cursor-hover"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-6">
        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mb-3">{item.category}</span>
        <h3 className="font-bold text-xl mb-2">{item.name}</h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-primary">{item.rate}<span className="text-sm font-normal text-muted-foreground">{item.rateUnit}</span></span>
          <RatingStars rating={item.rating} />
        </div>
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Wrench className="w-4 h-4 text-primary" />{item.specs}</div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4 text-primary" />{item.location}</div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="w-4 h-4 text-primary" />Owner: {item.ownerName}</div>
          <div className="flex items-center gap-2 text-sm">
            {item.available ? (
              <span className="flex items-center gap-1.5 text-green-600 font-medium"><CheckCircle2 className="w-4 h-4" />Available now</span>
            ) : (
              <span className="flex items-center gap-1.5 text-muted-foreground font-medium"><XCircle className="w-4 h-4" />Currently booked</span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <WhatsAppButton phone={item.phone} label="Contact Owner" message={`Hi ${item.ownerName}, I'm interested in renting your ${item.name} listed on Kisan Mitra. Is it available?`} />
          <WhatsAppButton phone={item.phone} label="Book Now" message={`Hi ${item.ownerName}, I'd like to book your ${item.name} (${item.rate}${item.rateUnit}) through Kisan Mitra. Please confirm availability and timing.`} />
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const MachineryPanel = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [selected, setSelected] = useState<MachineryListing | null>(null);
  const filtered = useMemo(() => machineryListings.filter((m) => {
    const matchesCategory = category === "All" || m.category === category;
    const matchesQuery = !query || m.name.toLowerCase().includes(query.toLowerCase()) || m.location.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [query, category]);

  return (
    <div>
      <FilterBar query={query} onQuery={setQuery} placeholder="Search machinery or location..." categories={machineryCategories} activeCategory={category} onCategory={setCategory} />
      {filtered.length === 0 ? <EmptyState label="machinery" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item, i) => <MachineryCard key={item.id} item={item} i={i} onSelect={() => setSelected(item)} />)}
        </div>
      )}
      <AnimatePresence>{selected && <MachineryDetailModal item={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   TOOLS RENTAL
   ═══════════════════════════════════════════════════════════ */
const conditionColor: Record<ToolListing["condition"], string> = {
  New: "bg-green-500/10 text-green-600",
  Good: "bg-blue-500/10 text-blue-600",
  Fair: "bg-amber-500/10 text-amber-600",
};

const ToolCard = ({ item, i }: { item: ToolListing; i: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 9) * 0.04 }}
    whileHover={{ y: -4 }}
    className="bg-card rounded-2xl border border-border/30 p-5 card-hover"
  >
    <div className="flex items-start gap-4 mb-3">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center text-3xl shrink-0 overflow-hidden">
        <CategoryImage category={item.category} emoji={item.image} className="text-3xl" />
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-sm leading-snug mb-1">{item.name}</h3>
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${conditionColor[item.condition]}`}>{item.condition}</span>
      </div>
    </div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-lg font-bold text-primary">{item.rate}<span className="text-xs font-normal text-muted-foreground">{item.rateUnit}</span></span>
      <span className="text-xs text-muted-foreground">{item.quantity} in stock</span>
    </div>
    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
      <MapPin className="w-3 h-3" />{item.location} · {item.ownerName}
    </div>
    <WhatsAppButton phone={item.phone} label="Book This Tool" message={`Hi ${item.ownerName}, I'd like to rent ${item.name} (${item.rate}${item.rateUnit}) through Kisan Mitra. Is it available?`} />
  </motion.div>
);

const ToolsPanel = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const filtered = useMemo(() => toolListings.filter((t) => {
    const matchesCategory = category === "All" || t.category === category;
    const matchesQuery = !query || t.name.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [query, category]);

  return (
    <div>
      <FilterBar query={query} onQuery={setQuery} placeholder="Search tools..." categories={toolCategories} activeCategory={category} onCategory={setCategory} />
      {filtered.length === 0 ? <EmptyState label="tools" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item, i) => <ToolCard key={item.id} item={item} i={i} />)}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   PESTICIDES & AGRICULTURAL INPUTS
   ═══════════════════════════════════════════════════════════ */
const InputCard = ({ item, i, onSelect }: { item: InputProduct; i: number; onSelect: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 9) * 0.04 }}
    whileHover={{ y: -4 }}
    onClick={onSelect}
    className="bg-card rounded-2xl border border-border/30 p-5 cursor-hover card-hover"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center text-2xl overflow-hidden">
        <CategoryImage category={item.category} emoji={item.image} className="text-2xl" />
      </div>
      <span className="text-sm font-bold text-primary">{item.price}</span>
    </div>
    <h3 className="font-semibold text-sm leading-snug mb-1.5">{item.name}</h3>
    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
      <span>{item.seller}</span>
      <span className="px-2 py-0.5 rounded-full bg-muted">{item.cropSuitability}</span>
    </div>
    <WhatsAppButton phone={item.phone} label="Contact Supplier" message={`Hi ${item.seller}, I'm interested in ${item.name} listed on Kisan Mitra. Could you share more details?`} />
  </motion.div>
);

const InputDetailModal = ({ item, onClose }: { item: InputProduct; onClose: () => void }) => (
  <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <motion.div className="bg-card rounded-3xl border border-border/30 w-full max-w-lg overflow-hidden shadow-2xl"
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">{item.category}</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted cursor-hover"><X className="w-4 h-4" /></button>
        </div>
        <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center text-4xl mb-3 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CategoryImage category={item.category} emoji={item.image} className="text-4xl" />
        </div>
        <h3 className="font-bold text-xl mb-1">{item.name}</h3>
        <p className="text-lg font-bold text-primary mb-4">{item.price}</p>
        <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/10">
            <h4 className="font-semibold text-sm text-green-600 mb-1">Usage</h4>
            <p className="text-sm text-muted-foreground">{item.usage}</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <h4 className="font-semibold text-sm text-blue-600 mb-1">Crop Suitability</h4>
            <p className="text-sm text-muted-foreground">{item.cropSuitability}</p>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-1 text-xs text-muted-foreground mb-4">
          <MapPin className="w-3 h-3" />{item.seller} · {item.location}
        </div>
        <WhatsAppButton phone={item.phone} label="Contact Supplier" message={`Hi ${item.seller}, I'm interested in ${item.name} listed on Kisan Mitra. Could you share more details?`} />
      </div>
    </motion.div>
  </motion.div>
);

const InputsPanel = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [selected, setSelected] = useState<InputProduct | null>(null);
  const filtered = useMemo(() => inputProducts.filter((p) => {
    const matchesCategory = category === "All" || p.category === category;
    const matchesQuery = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.cropSuitability.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [query, category]);

  return (
    <div>
      <FilterBar query={query} onQuery={setQuery} placeholder="Search seeds, fertilizers, pesticides..." categories={inputCategories} activeCategory={category} onCategory={setCategory} />
      {filtered.length === 0 ? <EmptyState label="products" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item, i) => <InputCard key={item.id} item={item} i={i} onSelect={() => setSelected(item)} />)}
        </div>
      )}
      <AnimatePresence>{selected && <InputDetailModal item={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   FARM WORKERS & EXPERTS
   ═══════════════════════════════════════════════════════════ */
const availabilityColor: Record<WorkerProfile["availability"], string> = {
  "Available Now": "bg-green-500/10 text-green-600",
  "Available This Week": "bg-amber-500/10 text-amber-600",
  "Booked": "bg-muted text-muted-foreground",
};

const WorkerCard = ({ item, i }: { item: WorkerProfile; i: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 9) * 0.04 }}
    whileHover={{ y: -4 }}
    className="bg-card rounded-2xl border border-border/30 p-5 card-hover"
  >
    <div className="flex items-start gap-3 mb-3">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-2xl shrink-0">{item.image}</div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-sm leading-snug">{item.name}</h3>
        <p className="text-xs text-muted-foreground">{item.role}</p>
        <RatingStars rating={item.rating} />
      </div>
    </div>
    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-3 ${availabilityColor[item.availability]}`}>{item.availability}</span>
    <div className="flex flex-wrap gap-1.5 mb-3">
      {item.skills.map((skill) => (
        <span key={skill} className="text-[10px] px-2 py-1 rounded-lg bg-muted text-muted-foreground">{skill}</span>
      ))}
    </div>
    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
      <MapPin className="w-3 h-3" />{item.serviceArea} · {item.experience} exp.
    </div>
    <WhatsAppButton phone={item.phone} label="Hire Now" message={`Hi ${item.name}, I found your profile on Kisan Mitra and would like to discuss hiring you as ${item.role.toLowerCase()}.`} />
  </motion.div>
);

const WorkersPanel = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const filtered = useMemo(() => workerProfiles.filter((w) => {
    const matchesCategory = category === "All" || w.category === category;
    const matchesQuery = !query || w.name.toLowerCase().includes(query.toLowerCase()) || w.role.toLowerCase().includes(query.toLowerCase()) || w.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()));
    return matchesCategory && matchesQuery;
  }), [query, category]);

  return (
    <div>
      <FilterBar query={query} onQuery={setQuery} placeholder="Search by name, role, or skill..." categories={workerCategories} activeCategory={category} onCategory={setCategory} />
      {filtered.length === 0 ? <EmptyState label="workers" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item, i) => <WorkerCard key={item.id} item={item} i={i} />)}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   "MORE SERVICES" — Irrigation, Land Prep, Transport, Local Directory
   ═══════════════════════════════════════════════════════════ */
const moreServiceGroups: { id: string; title: string; icon: LucideIcon; items: MiniService[] }[] = [
  { id: "irrigation", title: "Irrigation & Water Services", icon: Droplets, items: irrigationServices },
  { id: "landprep", title: "Land Preparation Services", icon: Construction, items: landPrepServices },
  { id: "transport", title: "Transportation & Logistics", icon: Truck, items: transportServices },
  { id: "directory", title: "Local Agri Service Directory", icon: Store, items: localDirectory },
];

const MiniServiceCard = ({ item, i }: { item: MiniService; i: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 6) * 0.05 }}
    whileHover={{ y: -3 }}
    className="bg-card rounded-xl border border-border/30 p-4 card-hover"
  >
    <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
    <p className="text-xs text-muted-foreground mb-1">{item.provider}</p>
    <p className="text-xs text-muted-foreground mb-2">{item.detail}</p>
    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
      <MapPin className="w-3 h-3" />{item.location}
    </div>
    <WhatsAppButton phone={item.phone} label="Contact" message={`Hi, I found ${item.title} on Kisan Mitra and would like to know more.`} />
  </motion.div>
);

const MoreServicesGrid = () => {
  const [openGroup, setOpenGroup] = useState<string>("irrigation");
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-2">
        {moreServiceGroups.map((group) => {
          const Icon = group.icon;
          const isActive = openGroup === group.id;
          return (
            <button
              key={group.id}
              onClick={() => setOpenGroup(group.id)}
              className={`cursor-hover flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                isActive ? "bg-secondary/15 text-secondary-foreground border-secondary/40" : "bg-card text-muted-foreground border-border/40 hover:border-secondary/30"
              }`}
            >
              <Icon className="w-4 h-4" />{group.title}
            </button>
          );
        })}
      </div>
      {moreServiceGroups.filter((g) => g.id === openGroup).map((group) => (
        <div key={group.id} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {group.items.map((item, i) => <MiniServiceCard key={item.id} item={item} i={i} />)}
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════ */
const FarmerMarketplace = () => {
  const [tab, setTab] = useState<MarketplaceTab>("machinery");

  return (
    <div className="space-y-10">
      <TabBar active={tab} onChange={setTab} />

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          {tab === "machinery" && <MachineryPanel />}
          {tab === "tools" && <ToolsPanel />}
          {tab === "inputs" && <InputsPanel />}
          {tab === "workers" && <WorkersPanel />}
        </motion.div>
      </AnimatePresence>

      <div className="pt-8 border-t border-border/20">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h3 className="text-2xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
            <ChevronRight className="w-5 h-5 text-secondary" />More Farm Services
          </h3>
          <p className="text-muted-foreground text-sm">Irrigation, land preparation, transport, and local agri businesses near you</p>
        </div>
        <MoreServicesGrid />
      </div>
    </div>
  );
};

export default FarmerMarketplace;
