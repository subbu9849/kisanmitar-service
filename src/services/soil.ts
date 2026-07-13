export type SoilType =
  | "clay"
  | "sandy"
  | "loamy"
  | "silt"
  | "black-cotton"
  | "red"
  | "laterite"
  | "alluvial";

export interface SoilInfo {
  id: SoilType;
  name: string;
  description: string;
  characteristics: string[];
  suitableCrops: string[];
  challenges: string[];
  recommendations: {
    irrigation: string;
    fertilizer: string;
    organicMatter: string;
    pH: string;
    drainage: string;
  };
  color: string;
}

export const SOIL_TYPES: SoilInfo[] = [
  {
    id: "clay",
    name: "Clay Soil",
    description: "Heavy soil with fine particles, high water-holding capacity, and rich in nutrients. Common in river basins and low-lying areas.",
    characteristics: ["High water retention", "Rich in nutrients", "Poor drainage", "Hard when dry, sticky when wet", "Alkaline pH (7.5-8.5)"],
    suitableCrops: ["Rice", "Wheat", "Sugarcane", "Cotton", "Pulses"],
    challenges: ["Waterlogging risk", "Poor aeration", "Difficult tillage", "Slow to warm in spring"],
    recommendations: {
      irrigation: "Use furrow or drip irrigation. Avoid overhead watering. Water deeply but infrequently.",
      fertilizer: "Apply gypsum to improve structure. Use NPK 10-26-26 at 50kg/acre. Supplement with zinc sulphate.",
      organicMatter: "Add 10-15 tons/acre of well-decomposed FYM or compost annually. Green manure with dhaincha.",
      pH: "Apply agricultural lime (2-3 tons/acre) to reduce alkalinity if pH > 8.0",
      drainage: "Install subsurface drainage tiles. Create raised beds (15-20cm high) for vegetable crops.",
    },
    color: "bg-amber-700",
  },
  {
    id: "sandy",
    name: "Sandy Soil",
    description: "Light, well-draining soil with large particles. Warms quickly but has poor nutrient and water retention. Common in arid regions.",
    characteristics: ["Excellent drainage", "Quick to warm", "Low nutrient holding", "Easy to cultivate", "Acidic to neutral pH (5.5-7.0)"],
    suitableCrops: ["Groundnut", "Watermelon", "Coconut", "Cashew", "Carrot", "Potato", "Sweet Potato"],
    challenges: ["Rapid water loss", "Nutrient leaching", "Wind erosion risk", "Low organic matter"],
    recommendations: {
      irrigation: "Use sprinkler or drip irrigation with frequent, light applications. Mulch heavily to retain moisture.",
      fertilizer: "Apply NPK 20-20-0 at 40kg/acre in split doses. Use slow-release fertilizers. Supplement micronutrients (Zn, B).",
      organicMatter: "Incorporate 20-25 tons/acre of organic matter. Use cover crops like sunn hemp. Apply biochar at 2 tons/acre.",
      pH: "If pH < 5.5, apply dolomitic limestone at 1-2 tons/acre. Monitor annually.",
      drainage: "Natural drainage is excellent. Focus on water retention with organic matter and mulching.",
    },
    color: "bg-yellow-600",
  },
  {
    id: "loamy",
    name: "Loamy Soil",
    description: "Ideal agricultural soil with balanced sand, silt, and clay. Excellent structure, drainage, and nutrient retention. The dream soil for farmers.",
    characteristics: ["Perfect balance of particle sizes", "Good water retention + drainage", "Rich in organic matter", "Easy to work", "Neutral pH (6.0-7.0)"],
    suitableCrops: ["Wheat", "Maize", "Vegetables", "Fruits", "Pulses", "Oilseeds", "Most field crops"],
    challenges: ["Can compact over time", "Erosion if left bare", "Nutrient depletion without rotation"],
    recommendations: {
      irrigation: "Standard furrow or drip irrigation works well. Water based on crop stage requirements.",
      fertilizer: "Balanced NPK 12-32-16 at 50kg/acre. Soil test annually to adjust. Foliar micronutrient sprays during growth.",
      organicMatter: "Maintain with 5-8 tons/acre FYM annually. Practice crop rotation with legumes. Minimum tillage recommended.",
      pH: "Maintain between 6.0-7.0. Annual soil testing recommended.",
      drainage: "Naturally good drainage. Maintain field bunds and channels.",
    },
    color: "bg-amber-800",
  },
  {
    id: "silt",
    name: "Silt Soil",
    description: "Smooth, fertile soil with medium-sized particles. Holds moisture well and is rich in nutrients. Common in river deltas and floodplains.",
    characteristics: ["Smooth texture", "Good fertility", "Moderate drainage", "Easily compacted", "Slightly acidic to neutral (5.8-7.0)"],
    suitableCrops: ["Rice", "Maize", "Jute", "Vegetables", "Oilseeds", "Wheat"],
    challenges: ["Surface crusting", "Compaction risk", "Erosion by water", "Poor structure when wet"],
    recommendations: {
      irrigation: "Careful irrigation management to avoid crusting. Use basin irrigation for rice, drip for vegetables.",
      fertilizer: "Apply NPK 14-28-14 at 45kg/acre. Add gypsum at 500kg/acre to improve structure.",
      organicMatter: "Incorporate 10-15 tons/acre compost. Use green manure crops. Add rice husk to improve structure.",
      pH: "Lime at 1 ton/acre if pH < 5.8. Regular monitoring recommended.",
      drainage: "Improve with organic matter and subsoiling. Create gentle slopes for surface drainage.",
    },
    color: "bg-stone-500",
  },
  {
    id: "black-cotton",
    name: "Black Cotton Soil",
    description: "Dark, clay-rich soil with high moisture retention. Famous for cotton cultivation. Expands when wet and cracks when dry. Covers large areas of Deccan plateau.",
    characteristics: ["Very high water holding", "Rich in lime, iron, magnesium", "Deep cracks in dry season", "Self-ploughing nature", "Alkaline pH (7.8-8.5)"],
    suitableCrops: ["Cotton", "Sorghum", "Wheat", "Sunflower", "Sugarcane", "Citrus"],
    challenges: ["Severe cracking damages roots", "Very hard when dry", "Poor drainage", "Difficult to till when wet"],
    recommendations: {
      irrigation: "Light, frequent irrigation. Avoid heavy watering. Drip irrigation highly recommended.",
      fertilizer: "Apply DAP at 50kg/acre. Supplement with potassium and zinc. Use sulphur at 25kg/acre.",
      organicMatter: "Incorporate 15-20 tons/acre FYM. Use cotton stalks as mulch. Green manure with sunn hemp.",
      pH: "Apply gypsum at 1-2 tons/acre to reduce alkalinity. Elemental sulphur at 200kg/acre.",
      drainage: "Create broad bed and furrow system. Install surface drains at 30m intervals.",
    },
    color: "bg-gray-800",
  },
  {
    id: "red",
    name: "Red Soil",
    description: "Iron-rich reddish soil formed from crystalline rocks. Well-drained but low in nutrients. Common in Tamil Nadu, Karnataka, and eastern India.",
    characteristics: ["Good drainage", "Low organic matter", "Rich in iron oxide", "Slightly acidic (5.5-6.5)", "Light texture"],
    suitableCrops: ["Groundnut", "Millets", "Pulses", "Tobacco", "Fruits", "Vegetables"],
    challenges: ["Low nitrogen and phosphorus", "Low water retention", "Erosion prone", "Poor organic content"],
    recommendations: {
      irrigation: "Drip or sprinkler irrigation essential. Apply mulch to reduce evaporation. Water more frequently in light doses.",
      fertilizer: "Apply NPK 20-20-0 at 60kg/acre. Supplement with organic nitrogen sources. Use rock phosphate at 200kg/acre.",
      organicMatter: "Critical: apply 20-25 tons/acre FYM. Use biofertilizers (Rhizobium, Azotobacter). Cover cropping essential.",
      pH: "Apply agricultural lime at 2-3 tons/acre to raise pH. Dolomite preferred for magnesium.",
      drainage: "Natural drainage is adequate. Focus on water conservation structures.",
    },
    color: "bg-red-600",
  },
  {
    id: "laterite",
    name: "Laterite Soil",
    description: "Highly weathered tropical soil rich in iron and aluminum. Found in high-rainfall areas. Low fertility but suitable for plantation crops.",
    characteristics: ["High iron and aluminum content", "Very low fertility", "Acidic (4.5-6.0)", "Good drainage", "Hardens on exposure"],
    suitableCrops: ["Coconut", "Cashew", "Rubber", "Tea", "Coffee", "Arecanut"],
    challenges: ["Extremely low nutrients", "High acidity", "Poor water retention", "Hard pan formation"],
    recommendations: {
      irrigation: "Drip irrigation for plantation crops. Mulch heavily. Contour trenches for water conservation.",
      fertilizer: "Heavy NPK application (20-20-0 at 80kg/acre) with micronutrient mix. Apply dolomite for Ca and Mg.",
      organicMatter: "Apply 25-30 tons/acre organic matter. Use shade trees in plantations. Compost tea application beneficial.",
      pH: "Heavy liming at 3-5 tons/acre initially, then 1-2 tons annually. Dolomitic limestone preferred.",
      drainage: "Good natural drainage. Create contour bunds to prevent erosion on slopes.",
    },
    color: "bg-orange-700",
  },
  {
    id: "alluvial",
    name: "Alluvial Soil",
    description: "Fertile river-deposited soil found in Indo-Gangetic plains. Most productive agricultural soil in India. Varies from sandy to clayey.",
    characteristics: ["Highly fertile", "Good water retention", "Varying texture", "Neutral pH (6.5-7.5)", "Deep soil profile"],
    suitableCrops: ["Wheat", "Rice", "Sugarcane", "Maize", "Oilseeds", "Vegetables", "Pulses", "Fruits"],
    challenges: ["Flooding in low areas", "Salinity in some regions", "Nutrient mining from intensive farming"],
    recommendations: {
      irrigation: "Standard irrigation methods work well. Alternate wetting and drying for rice. Laser land leveling recommended.",
      fertilizer: "Based on soil test. Generally NPK 12-32-16 at 55kg/acre. Zinc application every 2-3 years.",
      organicMatter: "Maintain with 8-10 tons/acre FYM. Crop residue incorporation. Green manuring with Sesbania.",
      pH: "Monitor for salinity. Apply gypsum if EC > 4 dS/m. Maintain pH between 6.5-7.5.",
      drainage: "Ensure proper field drainage channels. Raised beds in flood-prone areas.",
    },
    color: "bg-amber-500",
  },
];

export function getSoilById(id: SoilType): SoilInfo | undefined {
  return SOIL_TYPES.find((s) => s.id === id);
}

export function getSoilsByQuery(query: string): SoilInfo[] {
  const q = query.toLowerCase().trim();
  if (!q) return SOIL_TYPES;
  return SOIL_TYPES.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.suitableCrops.some((c) => c.toLowerCase().includes(q)),
  );
}

/** Find best soil matches for a given crop */
export function findSoilsForCrop(cropName: string): SoilInfo[] {
  const q = cropName.toLowerCase().trim();
  return SOIL_TYPES.filter((s) =>
    s.suitableCrops.some((c) => c.toLowerCase().includes(q)),
  );
}
