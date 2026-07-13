import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Upload, ImagePlus, X, Loader2, MapPin, CheckCircle2, Mail, Send, Copy, Crosshair,
} from "lucide-react";

import { CIVIC_CATEGORIES } from "../categories";
import { generateComplaintId, runDemoAIAnalysis, saveComplaint, addTimelineEntry, markEmailSent, getCurrentLocation } from "../store";
import { sendComplaintEmails, isEmailJSConfigured } from "../emailService";
import type { Complaint, ComplaintCategory, DemoAIResult, GeoPoint } from "../types";
import DemoAIAnalysisCard from "./DemoAIAnalysisCard";
import LocationMap from "./LocationMap";

const complaintSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  mobile: z.string().min(10, "Enter a valid 10-digit mobile number").max(15),
  email: z.string().email("Enter a valid email address"),
  village: z.string().min(2, "Village is required"),
  mandal: z.string().min(2, "Mandal is required"),
  district: z.string().min(2, "District is required"),
  category: z.enum(["Road Damage", "Broken Streetlight", "Water Leakage", "Garbage Complaint", "Drainage Issue", "Other"], {
    errorMap: () => ({ message: "Please select a complaint category" }),
  }),
  title: z.string().min(4, "Give the complaint a short title"),
  description: z.string().min(15, "Please describe the issue in a bit more detail"),
});
type ComplaintFormData = z.infer<typeof complaintSchema>;

interface ComplaintFormProps {
  defaultCategory?: ComplaintCategory;
}

const inputClass = (hasError?: boolean) =>
  `w-full px-4 py-3 rounded-xl border bg-background text-sm outline-none transition-colors ${
    hasError ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"
  }`;

const ComplaintForm = ({ defaultCategory }: ComplaintFormProps) => {
  const {
    register, handleSubmit, control, watch, reset,
    formState: { errors, isSubmitting },
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: { category: defaultCategory },
  });

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [aiResult, setAiResult] = useState<DemoAIResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [gps, setGps] = useState<GeoPoint | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitted, setSubmitted] = useState<Complaint | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedCategory = watch("category");

  useEffect(() => {
    if (defaultCategory) reset((prev) => ({ ...prev, category: defaultCategory }));
  }, [defaultCategory, reset]);

  const handleFile = useCallback((file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageDataUrl(dataUrl);
      setAnalyzing(true);
      // Simulated processing delay so the "Demo AI Prediction" feels like a real pass.
      setTimeout(() => {
        setAiResult(runDemoAIAnalysis(selectedCategory ?? "Other"));
        setAnalyzing(false);
      }, 900);
    };
    reader.readAsDataURL(file);
  }, [selectedCategory]);

  const handleUseMyLocation = async () => {
    setLocating(true);
    const point = await getCurrentLocation();
    setLocating(false);
    if (point) {
      setGps(point);
      toast.success("Location captured");
    } else {
      toast.error("Couldn't access your location — set it on the map instead");
    }
  };

  const onSubmit = async (data: ComplaintFormData) => {
    const id = generateComplaintId();
    const now = new Date().toISOString();
    const complaint: Complaint = {
      id,
      fullName: data.fullName,
      mobile: data.mobile,
      email: data.email,
      village: data.village,
      mandal: data.mandal,
      district: data.district,
      category: data.category,
      title: data.title,
      description: data.description,
      imageDataUrl: imageDataUrl ?? undefined,
      gps,
      aiAnalysis: aiResult ?? undefined,
      status: "Submitted",
      createdAt: now,
      authorityEmailSent: false,
      confirmationEmailSent: false,
      timeline: [{ stage: "Report Issue", date: now }],
    };

    saveComplaint(complaint);
    addTimelineEntry(id, "Demo AI Analysis", aiResult ? `${aiResult.detectedCategory} · ${aiResult.confidence}% confidence` : "Skipped — no image uploaded");
    addTimelineEntry(id, "Complaint ID Generated", id);

    const emailResult = await sendComplaintEmails(complaint);
    if (emailResult.authoritySent) {
      markEmailSent(id, "authority");
      addTimelineEntry(id, "Email Sent to Authority");
    }
    if (emailResult.confirmationSent) {
      markEmailSent(id, "confirmation");
      addTimelineEntry(id, "Confirmation Sent");
    }

    setSubmitted({
      ...complaint,
      authorityEmailSent: emailResult.authoritySent,
      confirmationEmailSent: emailResult.confirmationSent,
    });
    toast.success(`Complaint ${id} submitted`);
  };

  const resetForm = () => {
    setSubmitted(null);
    setImageDataUrl(null);
    setAiResult(null);
    setGps(null);
    reset({ category: undefined });
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-8 sm:p-10 text-center max-w-xl mx-auto"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Complaint Submitted</h3>
        <p className="text-muted-foreground mb-1">Your Complaint ID</p>
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="font-mono text-lg font-semibold px-4 py-2 rounded-xl bg-primary/10 text-primary">{submitted.id}</span>
          <button
            type="button"
            onClick={() => { navigator.clipboard.writeText(submitted.id); toast.success("Copied to clipboard"); }}
            className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted flex items-center justify-center cursor-hover"
            aria-label="Copy complaint ID"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-left mb-6">
          {[
            { label: "Complaint ID Generated", done: true },
            { label: "Demo AI Analysis", done: Boolean(submitted.aiAnalysis) },
            { label: "Email Sent to Authority", done: submitted.authorityEmailSent },
            { label: "Confirmation Email Sent", done: submitted.confirmationEmailSent },
          ].map((step) => (
            <div key={step.label} className="flex items-center gap-2 bg-background/70 rounded-xl px-3 py-2.5">
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${step.done ? "text-primary" : "text-muted-foreground/40"}`} />
              <span className="text-sm">{step.label}</span>
            </div>
          ))}
        </div>

        {!isEmailJSConfigured && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-xl p-3 mb-6 flex items-start gap-2 text-left">
            <Mail className="w-4 h-4 shrink-0 mt-0.5" />
            Demo Mode: email sending isn't configured yet, so the authority/citizen emails above are simulated. The complaint and ID are still saved for tracking.
          </p>
        )}

        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity cursor-hover"
        >
          File Another Complaint
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-3xl p-6 sm:p-10 max-w-3xl mx-auto space-y-6">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Full Name</label>
          <input {...register("fullName")} type="text" placeholder="Your full name" className={inputClass(!!errors.fullName)} />
          {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Mobile Number</label>
          <input {...register("mobile")} type="tel" placeholder="10-digit mobile number" className={inputClass(!!errors.mobile)} />
          {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile.message}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Email Address</label>
        <input {...register("email")} type="email" placeholder="you@example.com" className={inputClass(!!errors.email)} />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Village</label>
          <input {...register("village")} type="text" placeholder="e.g. Anandapuram" className={inputClass(!!errors.village)} />
          {errors.village && <p className="text-xs text-red-500 mt-1">{errors.village.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Mandal</label>
          <input {...register("mandal")} type="text" placeholder="e.g. Bheemunipatnam" className={inputClass(!!errors.mandal)} />
          {errors.mandal && <p className="text-xs text-red-500 mt-1">{errors.mandal.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">District</label>
          <input {...register("district")} type="text" placeholder="e.g. Visakhapatnam" className={inputClass(!!errors.district)} />
          {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district.message}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Complaint Category</label>
        <select {...register("category")} className={inputClass(!!errors.category)} defaultValue="">
          <option value="" disabled>Select a category</option>
          {CIVIC_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
          <option value="Other">📋 Other</option>
        </select>
        {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Complaint Title</label>
        <input {...register("title")} type="text" placeholder="Short summary of the issue" className={inputClass(!!errors.title)} />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Complaint Description</label>
        <textarea {...register("description")} rows={4} placeholder="Describe the issue, since when, and how it's affecting the village"
          className={`${inputClass(!!errors.description)} resize-none`} />
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
      </div>

      {/* Upload Image — drag & drop with preview */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Upload Image</label>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-colors overflow-hidden ${
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {imageDataUrl ? (
            <div className="relative">
              <img src={imageDataUrl} alt="Complaint upload preview" className="w-full max-h-64 object-cover" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setImageDataUrl(null); setAiResult(null); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/90 flex items-center justify-center hover:bg-background cursor-hover"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <ImagePlus className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Drag & drop a photo, or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">PNG or JPG — helps us verify and prioritize your complaint</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {analyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Running demo AI analysis on the uploaded photo…
          </motion.div>
        )}
        {aiResult && !analyzing && <DemoAIAnalysisCard result={aiResult} />}
      </AnimatePresence>

      {/* GPS + Map location */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium block">Location</label>
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locating}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 cursor-hover disabled:opacity-50"
          >
            {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
            Use my GPS location
          </button>
        </div>
        <Controller
          control={control}
          name="category"
          render={() => (
            <LocationMap value={gps} onChange={setGps} />
          )}
        />
        <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {gps ? `Pinned at ${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}` : "Tap the map or drag the pin to mark the exact spot"}
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity cursor-hover disabled:opacity-60"
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Submit Complaint
      </button>
      <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1">
        <Upload className="w-3 h-3" /> Your complaint is saved for tracking and, where configured, emailed automatically.
      </p>
    </form>
  );
};

export default ComplaintForm;
