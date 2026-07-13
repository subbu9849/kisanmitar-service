/* ═══════════════════════════════════════════════════════════
   AI Assistant — floating chat widget (visible on every page)
   Multi-turn farming Q&A backed by /api/ai-assistant (Gemini).
   ═══════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, X, Send, Bot, User, RotateCcw, AlertTriangle, Loader2,
} from "lucide-react";
import { sendChatMessage, MAX_MESSAGE_LENGTH, type ChatMessage } from "@/services/aiAssistant";

interface DisplayMessage extends ChatMessage {
  id: string;
}

const SUGGESTIONS = [
  "Best crops to plant this season?",
  "How much water does paddy need?",
  "Govt schemes I can apply for",
  "Natural ways to control pests",
];

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, sending]);

  useEffect(() => {
    if (open && !hasOpened) setHasOpened(true);
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open, hasOpened]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSend = useCallback(async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || sending || notConfigured) return;

    const userMsg: DisplayMessage = { id: makeId(), role: "user", text };
    const history = messages.map(({ role, text }) => ({ role, text }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setError(null);
    setSending(true);

    const outcome = await sendChatMessage(text, history);
    setSending(false);

    if (!outcome.configured) { setNotConfigured(true); return; }
    if ("error" in outcome) { setError(outcome.error); return; }

    setMessages((prev) => [...prev, { id: makeId(), role: "model", text: outcome.reply }]);
  }, [input, sending, notConfigured, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => { setMessages([]); setError(null); setNotConfigured(false); };

  return (
    <>
      {/* ─── Floating toggle button ─── */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[9994] w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 flex items-center justify-center cursor-hover"
        initial={{ opacity: 0, scale: 0, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.6 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={open ? "Close AI Assistant" : "Open AI Assistant"}
      >
        {!hasOpened && (
          <motion.span
            className="absolute inset-0 rounded-full bg-primary"
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <Sparkles className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ─── Chat panel ─── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed z-[9994] left-4 right-4 bottom-24 sm:left-auto sm:right-6 sm:bottom-28 sm:w-[400px] h-[72vh] sm:h-[620px] max-h-[680px] bg-card border border-border/40 rounded-3xl shadow-2xl shadow-black/10 flex flex-col overflow-hidden"
            role="dialog"
            aria-label="Kisan Mitra AI Assistant"
          >
            {/* Header */}
            <div className="shrink-0 bg-primary text-primary-foreground px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary-foreground/15 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold leading-tight truncate">Kisan Mitra AI</p>
                  <p className="text-xs text-primary-foreground/75 leading-tight">Farming Assistant · Powered by Gemini</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {messages.length > 0 && (
                  <button onClick={resetChat} className="p-2 rounded-lg hover:bg-primary-foreground/15 transition-colors cursor-hover" aria-label="Start new chat" title="New chat">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-primary-foreground/15 transition-colors cursor-hover" aria-label="Close chat">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && !notConfigured && (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Namaste! How can I help?</p>
                    <p className="text-sm text-muted-foreground mt-1">Ask me about crops, weather, irrigation, schemes, pests, or anything farming-related.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center pt-1">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSend(s)}
                        className="text-xs px-3 py-2 rounded-full border border-border/60 bg-background hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-hover"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "model" && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mb-0.5">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-4 py-2.5 text-sm whitespace-pre-wrap break-words ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                        : "bg-muted text-foreground rounded-2xl rounded-bl-md"
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mb-0.5">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {sending && (
                <div className="flex items-end gap-2 justify-start">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mb-0.5">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-500/5 border border-red-500/20 rounded-2xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {notConfigured && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground bg-amber-500/5 border border-amber-500/20 rounded-2xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    The AI Assistant needs a free Gemini API key set server-side as <code className="font-mono text-xs">GEMINI_API_KEY</code> (see{" "}
                    <code className="font-mono text-xs">netlify/functions/ai-assistant.js</code>) — the same key used by Disease Detection. Once it's configured, refresh and try again.
                  </span>
                </div>
              )}
            </div>

            {/* Input */}
            {!notConfigured && (
              <div className="shrink-0 border-t border-border/30 p-3">
                <div className="flex items-end gap-2 bg-background border border-border rounded-2xl px-3 py-2 focus-within:border-primary transition-colors">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about crops, weather, schemes..."
                    rows={1}
                    className="flex-1 resize-none bg-transparent outline-none text-sm py-1.5 max-h-24"
                  />
                  <motion.button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || sending}
                    className="shrink-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-hover"
                    whileHover={input.trim() && !sending ? { scale: 1.08 } : {}}
                    whileTap={input.trim() && !sending ? { scale: 0.92 } : {}}
                    aria-label="Send message"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </motion.button>
                </div>
                <p className="text-[11px] text-muted-foreground text-center mt-2 px-2">
                  AI-generated guidance — for pesticide dosing or serious crop issues, confirm with an Expert.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
