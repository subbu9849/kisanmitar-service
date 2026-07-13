import { motion } from "framer-motion";
import { Sparkles, Gauge, AlertTriangle, Clock, Target } from "lucide-react";
import type { DemoAIResult } from "../types";

const severityColor: Record<DemoAIResult["severity"], string> = {
  Low: "text-emerald-600 bg-emerald-500/10",
  Medium: "text-amber-600 bg-amber-500/10",
  High: "text-red-600 bg-red-500/10",
};

const DemoAIAnalysisCard = ({ result }: { result: DemoAIResult }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="rounded-2xl border border-primary/20 bg-primary/5 p-5 relative overflow-hidden"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <h4 className="font-semibold text-sm">AI-Assisted Preview</h4>
      </div>
      <span className="text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-primary/15 text-primary">
        Demo AI Prediction
      </span>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-background/70 rounded-xl p-3">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] mb-1"><Target className="w-3.5 h-3.5" /> Detected</div>
        <p className="text-sm font-semibold">{result.detectedCategory}</p>
      </div>
      <div className="bg-background/70 rounded-xl p-3">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] mb-1"><Gauge className="w-3.5 h-3.5" /> Confidence</div>
        <p className="text-sm font-semibold">{result.confidence}%</p>
      </div>
      <div className="bg-background/70 rounded-xl p-3">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] mb-1"><AlertTriangle className="w-3.5 h-3.5" /> Priority</div>
        <p className={`text-sm font-semibold inline-block px-2 py-0.5 rounded-md ${severityColor[result.priority]}`}>{result.priority}</p>
      </div>
      <div className="bg-background/70 rounded-xl p-3">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] mb-1"><Clock className="w-3.5 h-3.5" /> Est. Resolution</div>
        <p className="text-sm font-semibold">{result.estimatedResolution}</p>
      </div>
    </div>

    <p className="text-[11px] text-muted-foreground mt-3">
      This is a simulated preview for demonstration purposes only — it does not reflect a certified authority assessment.
    </p>
  </motion.div>
);

export default DemoAIAnalysisCard;
