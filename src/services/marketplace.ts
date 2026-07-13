/* ═══════════════════════════════════════════════════════════
   FARMER SERVICES & RENTAL MARKETPLACE — mock data
   Regional flavor: Andhra Pradesh & Telangana
   ═══════════════════════════════════════════════════════════ */

export type MachineryListing = {
  id: string;
  name: string;
  category: string;
  image: string;
  ownerName: string;
  rate: string;
  rateUnit: string;
  available: boolean;
  location: string;
  specs: string;
  phone: string;
  rating: number;
};

export type ToolListing = {
  id: string;
  name: string;
  category: string;
  image: string;
  rate: string;
  rateUnit: string;
  condition: "New" | "Good" | "Fair";
  quantity: number;
  ownerName: string;
  location: string;
  phone: string;
};

export type InputProduct = {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  usage: string;
  cropSuitability: string;
  seller: string;
  location: string;
  price: string;
  phone: string;
};

export type WorkerProfile = {
  id: string;
  name: string;
  role: string;
  category: string;
  image: string;
  experience: string;
  skills: string[];
  serviceArea: string;
  availability: "Available Now" | "Available This Week" | "Booked";
  phone: string;
  rating: number;
};

export type MiniService = {
  id: string;
  title: string;
  provider: string;
  location: string;
  detail: string;
  phone: string;
};

/* ─── Machinery Rental ─── */
export const machineryCategories = [
  "All", "Tractor", "Rotavator", "Cultivator", "Seed Drill", "Harvester",
  "Power Tiller", "Sprayer Machine", "Thresher", "Water Tanker", "Excavator",
  "Mini Tractor", "Plough", "Trailer", "Mulcher", "Transplanter",
] as const;

export const machineryListings: MachineryListing[] = [
  { id: "m1", name: "Mahindra 575 DI Tractor", category: "Tractor", image: "🚜", ownerName: "Venkata Rao", rate: "₹900", rateUnit: "/hour", available: true, location: "Guntur, AP", specs: "45 HP · 4WD · Power Steering", phone: "919876543210", rating: 4.7 },
  { id: "m2", name: "Rotavator – 6 Feet", category: "Rotavator", image: "🌀", ownerName: "Lakshmi Narayana", rate: "₹600", rateUnit: "/hour", available: true, location: "Prathipadu, AP", specs: "Heavy duty · 36 blades", phone: "919876543211", rating: 4.5 },
  { id: "m3", name: "Cultivator – 9 Tyne", category: "Cultivator", image: "🔧", ownerName: "Suresh Babu", rate: "₹500", rateUnit: "/hour", available: false, location: "Vijayawada, AP", specs: "Spring loaded tynes", phone: "919876543212", rating: 4.3 },
  { id: "m4", name: "Seed Drill – 9 Row", category: "Seed Drill", image: "🌱", ownerName: "Ramesh Yadav", rate: "₹700", rateUnit: "/hour", available: true, location: "Warangal, TG", specs: "Fertilizer + seed combo box", phone: "919876543213", rating: 4.6 },
  { id: "m5", name: "Combine Harvester", category: "Harvester", image: "🌾", ownerName: "Krishna Murthy", rate: "₹2,200", rateUnit: "/hour", available: true, location: "Nellore, AP", specs: "Self-propelled · Paddy & wheat", phone: "919876543214", rating: 4.8 },
  { id: "m6", name: "Power Tiller – 12 HP", category: "Power Tiller", image: "🛠️", ownerName: "Anjaneyulu Reddy", rate: "₹450", rateUnit: "/hour", available: true, location: "Visakhapatnam, AP", specs: "Diesel · Rotary tilling", phone: "919876543215", rating: 4.4 },
  { id: "m7", name: "Boom Sprayer", category: "Sprayer Machine", image: "💦", ownerName: "Naga Raju", rate: "₹350", rateUnit: "/hour", available: true, location: "Karimnagar, TG", specs: "12m boom · 400L tank", phone: "919876543216", rating: 4.2 },
  { id: "m8", name: "Multi-Crop Thresher", category: "Thresher", image: "🌽", ownerName: "Veera Babu", rate: "₹800", rateUnit: "/hour", available: false, location: "Kakinada, AP", specs: "Paddy, wheat, millets", phone: "919876543217", rating: 4.5 },
  { id: "m9", name: "Water Tanker – 5000L", category: "Water Tanker", image: "🚛", ownerName: "Mahesh Goud", rate: "₹1,200", rateUnit: "/trip", available: true, location: "Khammam, TG", specs: "Tractor mounted · Sprinkler hose", phone: "919876543218", rating: 4.3 },
  { id: "m10", name: "Mini Excavator JCB", category: "Excavator", image: "🏗️", ownerName: "Srinivas Rao", rate: "₹1,800", rateUnit: "/hour", available: true, location: "Eluru, AP", specs: "Land leveling & trenching", phone: "919876543219", rating: 4.6 },
  { id: "m11", name: "Mini Tractor – 20 HP", category: "Mini Tractor", image: "🚜", ownerName: "Bhaskar Reddy", rate: "₹500", rateUnit: "/hour", available: true, location: "Araku Valley, AP", specs: "Ideal for hill terraces", phone: "919876543220", rating: 4.4 },
  { id: "m12", name: "MB Plough – 3 Bottom", category: "Plough", image: "⛏️", ownerName: "Chandra Sekhar", rate: "₹400", rateUnit: "/hour", available: true, location: "Rajahmundry, AP", specs: "Reversible mouldboard", phone: "919876543221", rating: 4.1 },
  { id: "m13", name: "Farm Trailer – 5 Ton", category: "Trailer", image: "🚚", ownerName: "Pavan Kumar", rate: "₹600", rateUnit: "/trip", available: true, location: "Nalgonda, TG", specs: "Hydraulic tipping", phone: "919876543222", rating: 4.3 },
  { id: "m14", name: "Mulcher – Heavy Duty", category: "Mulcher", image: "🍂", ownerName: "Ravi Teja", rate: "₹650", rateUnit: "/hour", available: false, location: "Guntur, AP", specs: "Crop residue management", phone: "919876543223", rating: 4.2 },
  { id: "m15", name: "Paddy Transplanter", category: "Transplanter", image: "🌾", ownerName: "Satyanarayana", rate: "₹900", rateUnit: "/hour", available: true, location: "West Godavari, AP", specs: "8-row · Walk-behind", phone: "919876543224", rating: 4.7 },
];

/* ─── Agricultural Tools Rental ─── */
export const toolCategories = [
  "All", "Hand Tools", "Pumps & Pipes", "Power Tools", "Cutting Tools",
] as const;

export const toolListings: ToolListing[] = [
  { id: "t1", name: "Axe – Heavy Duty", category: "Hand Tools", image: "🪓", rate: "₹40", rateUnit: "/day", condition: "Good", quantity: 8, ownerName: "Ramana Agri Store", location: "Prathipadu, AP", phone: "919876543225" },
  { id: "t2", name: "Garden Hoe Set", category: "Hand Tools", image: "🪏", rate: "₹30", rateUnit: "/day", condition: "Good", quantity: 15, ownerName: "Lakshmi Tools Center", location: "Visakhapatnam, AP", phone: "919876543226" },
  { id: "t3", name: "Iron Shovel", category: "Hand Tools", image: "🛠️", rate: "₹25", rateUnit: "/day", condition: "New", quantity: 20, ownerName: "Sri Venkateswara Traders", location: "Vijayawada, AP", phone: "919876543227" },
  { id: "t4", name: "Sickle – Curved Blade", category: "Cutting Tools", image: "🔪", rate: "₹15", rateUnit: "/day", condition: "Good", quantity: 30, ownerName: "Anjaneya Hardware", location: "Guntur, AP", phone: "919876543228" },
  { id: "t5", name: "Pruning Shears", category: "Cutting Tools", image: "✂️", rate: "₹35", rateUnit: "/day", condition: "Good", quantity: 12, ownerName: "Green Farm Supplies", location: "Araku Valley, AP", phone: "919876543229" },
  { id: "t6", name: "Submersible Water Pump – 5HP", category: "Pumps & Pipes", image: "⚙️", rate: "₹250", rateUnit: "/day", condition: "Good", quantity: 4, ownerName: "Krishna Pump Works", location: "Nellore, AP", phone: "919876543230" },
  { id: "t7", name: "HDPE Pipe Set – 100ft", category: "Pumps & Pipes", image: "🪈", rate: "₹150", rateUnit: "/day", condition: "Fair", quantity: 10, ownerName: "Godavari Irrigation Supplies", location: "Rajahmundry, AP", phone: "919876543231" },
  { id: "t8", name: "Manual Weeding Tool", category: "Hand Tools", image: "🌿", rate: "₹20", rateUnit: "/day", condition: "Good", quantity: 18, ownerName: "Ramana Agri Store", location: "Prathipadu, AP", phone: "919876543232" },
  { id: "t9", name: "Petrol Grass Cutter", category: "Power Tools", image: "🪚", rate: "₹300", rateUnit: "/day", condition: "Good", quantity: 6, ownerName: "Sai Farm Equipments", location: "Warangal, TG", phone: "919876543233" },
  { id: "t10", name: "Chainsaw – 18 inch", category: "Power Tools", image: "🪓", rate: "₹400", rateUnit: "/day", condition: "Good", quantity: 3, ownerName: "Hyderabad Power Tools", location: "Karimnagar, TG", phone: "919876543234" },
  { id: "t11", name: "Battery Power Sprayer – 16L", category: "Power Tools", image: "💧", rate: "₹180", rateUnit: "/day", condition: "New", quantity: 9, ownerName: "Green Farm Supplies", location: "Araku Valley, AP", phone: "919876543235" },
  { id: "t12", name: "Electric Tiller – Mini", category: "Power Tools", image: "🔌", rate: "₹350", rateUnit: "/day", condition: "Good", quantity: 5, ownerName: "Sai Farm Equipments", location: "Khammam, TG", phone: "919876543236" },
];

/* ─── Pesticides & Agricultural Inputs ─── */
export const inputCategories = [
  "All", "Seeds", "Fertilizers", "Pesticides", "Bio & Organic",
] as const;

export const inputProducts: InputProduct[] = [
  { id: "p1", name: "Hybrid Paddy Seeds – BPT 5204", category: "Seeds", image: "🌾", description: "High-yield hybrid paddy variety suited for Andhra delta regions.", usage: "Sow 20-25 kg/acre during Kharif season", cropSuitability: "Paddy", seller: "Godavari Seed Co.", location: "Rajahmundry, AP", price: "₹65/kg", phone: "919876543237" },
  { id: "p2", name: "Bt Cotton Seeds", category: "Seeds", image: "🌱", description: "Pest-resistant cotton seed variety with strong boll formation.", usage: "Sow 1.5-2 packets per acre", cropSuitability: "Cotton", seller: "Krishna Agro Seeds", location: "Guntur, AP", price: "₹820/packet", phone: "919876543238" },
  { id: "p3", name: "Hybrid Corn Seeds", category: "Seeds", image: "🌽", description: "Fast-maturing maize hybrid with strong drought tolerance.", usage: "Sow 8-10 kg/acre, row spacing 60cm", cropSuitability: "Maize", seller: "Telangana Seed House", location: "Warangal, TG", price: "₹350/kg", phone: "919876543239" },
  { id: "p4", name: "Vegetable Seed Combo Pack", category: "Seeds", image: "🥬", description: "Mixed pack of tomato, brinjal, chilli and okra seeds.", usage: "Nursery raising recommended before transplant", cropSuitability: "Vegetables", seller: "Green Valley Seeds", location: "Araku Valley, AP", price: "₹180/pack", phone: "919876543240" },
  { id: "p5", name: "Organic Compost Fertilizer", category: "Fertilizers", image: "🌿", description: "Fully decomposed farmyard compost, enriched with neem cake.", usage: "Apply 2 tons/acre before sowing", cropSuitability: "All crops", seller: "EcoFarm Organics", location: "Visakhapatnam, AP", price: "₹12/kg", phone: "919876543241" },
  { id: "p6", name: "DAP Fertilizer 50kg", category: "Fertilizers", image: "🧪", description: "Di-ammonium phosphate for strong root development.", usage: "Apply 50 kg/acre at sowing time", cropSuitability: "Paddy, Cotton, Maize", seller: "Sri Lakshmi Fertilizers", location: "Vijayawada, AP", price: "₹1,350/bag", phone: "919876543242" },
  { id: "p7", name: "Micronutrient Mixture", category: "Fertilizers", image: "🧴", description: "Zinc, boron & iron blend to correct nutrient deficiency.", usage: "Foliar spray 5g/litre water", cropSuitability: "All crops", seller: "Krishna Agro Seeds", location: "Guntur, AP", price: "₹220/kg", phone: "919876543243" },
  { id: "p8", name: "Growth Promoter – Seaweed Extract", category: "Fertilizers", image: "🪴", description: "Boosts flowering and fruit set naturally.", usage: "Spray every 15 days, 3ml/litre", cropSuitability: "Vegetables, Fruits", seller: "EcoFarm Organics", location: "Visakhapatnam, AP", price: "₹450/litre", phone: "919876543244" },
  { id: "p9", name: "Broad Spectrum Insecticide", category: "Pesticides", image: "🐛", description: "Controls sucking pests including aphids and jassids.", usage: "Spray 2ml/litre at first pest sign", cropSuitability: "Cotton, Vegetables", seller: "Telangana AgroChem", location: "Karimnagar, TG", price: "₹380/250ml", phone: "919876543245" },
  { id: "p10", name: "Fungicide – Blast Control", category: "Pesticides", image: "🍄", description: "Effective against paddy blast and sheath blight.", usage: "Spray at boot leaf stage, 1ml/litre", cropSuitability: "Paddy", seller: "Godavari Seed Co.", location: "Rajahmundry, AP", price: "₹290/100ml", phone: "919876543246" },
  { id: "p11", name: "Herbicide – Weed Control", category: "Pesticides", image: "🌾", description: "Pre-emergent herbicide for grassy and broadleaf weeds.", usage: "Spray within 3 days of sowing", cropSuitability: "Paddy, Maize", seller: "Sri Lakshmi Fertilizers", location: "Vijayawada, AP", price: "₹520/litre", phone: "919876543247" },
  { id: "p12", name: "Neem-Based Bio Pesticide", category: "Bio & Organic", image: "🍃", description: "Organic pest control, safe for beneficial insects.", usage: "Spray 5ml/litre every 7-10 days", cropSuitability: "All crops", seller: "EcoFarm Organics", location: "Araku Valley, AP", price: "₹260/litre", phone: "919876543248" },
];

/* ─── Farm Workers & Service Providers ─── */
export const workerCategories = [
  "All", "Labor", "Machine Operators", "Agri Experts",
] as const;

export const workerProfiles: WorkerProfile[] = [
  { id: "w1", name: "Appala Naidu", role: "Farm Labor Supervisor", category: "Labor", image: "👨‍🌾", experience: "12 years", skills: ["Sowing", "Weeding", "Team coordination"], serviceArea: "Prathipadu & nearby villages", availability: "Available Now", phone: "919876543249", rating: 4.8 },
  { id: "w2", name: "Lakshmi Devi", role: "Harvest Worker Group Lead", category: "Labor", image: "👩‍🌾", experience: "8 years", skills: ["Paddy harvesting", "Sorting", "Packing"], serviceArea: "Guntur district", availability: "Available This Week", phone: "919876543250", rating: 4.6 },
  { id: "w3", name: "Ravindra Babu", role: "Plantation Worker", category: "Labor", image: "👨‍🌾", experience: "6 years", skills: ["Transplanting", "Irrigation handling"], serviceArea: "West Godavari", availability: "Available Now", phone: "919876543251", rating: 4.5 },
  { id: "w4", name: "Suresh Kumar", role: "Tractor Driver", category: "Machine Operators", image: "🚜", experience: "10 years", skills: ["Tractor operation", "Implement attachment"], serviceArea: "Vijayawada & Guntur", availability: "Available Now", phone: "919876543252", rating: 4.7 },
  { id: "w5", name: "Mallikarjun Rao", role: "Harvester Operator", category: "Machine Operators", image: "🌾", experience: "9 years", skills: ["Combine harvester", "Field calculation"], serviceArea: "Nellore district", availability: "Booked", phone: "919876543253", rating: 4.6 },
  { id: "w6", name: "Yadagiri Goud", role: "Sprayer Operator", category: "Machine Operators", image: "💦", experience: "5 years", skills: ["Boom spraying", "Drone spraying"], serviceArea: "Karimnagar, TG", availability: "Available Now", phone: "919876543254", rating: 4.4 },
  { id: "w7", name: "Prakash Reddy", role: "Machine Technician", category: "Machine Operators", image: "🔧", experience: "11 years", skills: ["Tractor repair", "Pump maintenance"], serviceArea: "Warangal district", availability: "Available This Week", phone: "919876543255", rating: 4.7 },
  { id: "w8", name: "Dr. Vijaya Lakshmi", role: "Agronomist", category: "Agri Experts", image: "👩‍🔬", experience: "15 years", skills: ["Crop planning", "Yield optimization"], serviceArea: "Andhra Pradesh (remote + visits)", availability: "Available This Week", phone: "919876543256", rating: 4.9 },
  { id: "w9", name: "Dr. Ramana Murthy", role: "Soil Expert", category: "Agri Experts", image: "🧑‍🔬", experience: "13 years", skills: ["Soil testing", "Nutrient management"], serviceArea: "Vizianagaram & Visakhapatnam", availability: "Available Now", phone: "919876543257", rating: 4.8 },
  { id: "w10", name: "Srinivas Chary", role: "Pest Management Expert", category: "Agri Experts", image: "🔬", experience: "9 years", skills: ["IPM strategy", "Bio control methods"], serviceArea: "Telangana (remote + visits)", availability: "Available Now", phone: "919876543258", rating: 4.6 },
  { id: "w11", name: "Padma Rani", role: "Crop Consultant", category: "Agri Experts", image: "👩‍🌾", experience: "7 years", skills: ["Horticulture", "Organic transition"], serviceArea: "Araku Valley & East Godavari", availability: "Available This Week", phone: "919876543259", rating: 4.7 },
];

/* ─── Irrigation & Water Services ─── */
export const irrigationServices: MiniService[] = [
  { id: "i1", title: "Borewell Drilling Service", provider: "Sri Sai Borewells", location: "Guntur, AP", detail: "Up to 800ft drilling, geological survey included", phone: "919876543260" },
  { id: "i2", title: "Drip Irrigation Installation", provider: "Krishna Irrigation Systems", location: "Vijayawada, AP", detail: "Complete drip kit + design + setup", phone: "919876543261" },
  { id: "i3", title: "Sprinkler System Installation", provider: "Godavari Irrigation Supplies", location: "Rajahmundry, AP", detail: "Field survey, layout, and installation", phone: "919876543262" },
  { id: "i4", title: "Water Tank Supply & Setup", provider: "Telangana Water Tanks", location: "Warangal, TG", detail: "PVC & RCC tanks, 500L to 10000L", phone: "919876543263" },
];

/* ─── Land Preparation Services ─── */
export const landPrepServices: MiniService[] = [
  { id: "l1", title: "Land Levelling Service", provider: "Anjaneya Earthmovers", location: "Eluru, AP", detail: "Laser leveling for paddy fields, ₹1,500/acre est.", phone: "919876543264" },
  { id: "l2", title: "Deep Ploughing Service", provider: "Krishna Farm Mechanization", location: "Nalgonda, TG", detail: "Pre-monsoon soil preparation, ₹800/acre est.", phone: "919876543265" },
  { id: "l3", title: "Field Clearing & Bunding", provider: "Sri Venkateswara Earthworks", location: "Khammam, TG", detail: "Boundary bund formation, ₹1,200/acre est.", phone: "919876543266" },
];

/* ─── Transportation & Logistics ─── */
export const transportServices: MiniService[] = [
  { id: "tr1", title: "Crop Transportation – Mini Truck", provider: "Lakshmi Transports", location: "Guntur to Vijayawada", detail: "Capacity: 3 tons · Same-day delivery", phone: "919876543267" },
  { id: "tr2", title: "Tractor Trolley Hire", provider: "Venkata Rao Logistics", location: "Prathipadu local area", detail: "Capacity: 2 tons · Hourly or per-trip", phone: "919876543268" },
  { id: "tr3", title: "Market Transport Service", provider: "Andhra Agri Logistics", location: "Visakhapatnam region", detail: "Direct to mandi, capacity: 5 tons", phone: "919876543269" },
];

/* ─── Local Agri Service Directory ─── */
export const localDirectory: MiniService[] = [
  { id: "d1", title: "Sri Lakshmi Fertilizer Shop", provider: "Retail seeds, fertilizers & pesticides", location: "Prathipadu, AP", detail: "Open 7am - 8pm, all days", phone: "919876543270" },
  { id: "d2", title: "Krishna Tractor Repair Works", provider: "Tractor & implement service center", location: "Guntur, AP", detail: "Genuine spares, same-day repair", phone: "919876543271" },
  { id: "d3", title: "Godavari Borewell Contractors", provider: "Drilling & motor installation", location: "Rajahmundry, AP", detail: "20+ years in the region", phone: "919876543272" },
  { id: "d4", title: "Telangana Veterinary Services", provider: "Livestock health & vaccination", location: "Warangal, TG", detail: "Home visits available", phone: "919876543273" },
];
