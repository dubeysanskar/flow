"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Mic, Sparkles } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info" | "voice";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  voice: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  voice: Mic,
};

const STYLES: Record<ToastType, string> = {
  success: "border-emerald-500/40 bg-emerald-950/60 shadow-emerald-500/10",
  error: "border-rose-500/40 bg-rose-950/60 shadow-rose-500/10",
  warning: "border-amber-500/40 bg-amber-950/60 shadow-amber-500/10",
  info: "border-indigo-500/40 bg-indigo-950/60 shadow-indigo-500/10",
  voice: "border-violet-500/40 bg-violet-950/60 shadow-violet-500/15",
};

const ICON_COLORS: Record<ToastType, string> = {
  success: "text-emerald-400",
  error: "text-rose-400",
  warning: "text-amber-400",
  info: "text-indigo-400",
  voice: "text-violet-400",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const Icon = ICONS[toast.type];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Animate in
    const t = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 350);
    }, toast.duration ?? 4000);
    return () => {
      clearTimeout(t);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={`
        relative max-w-sm w-full rounded-2xl border backdrop-blur-xl shadow-2xl
        transition-all duration-350 ease-out overflow-hidden
        ${STYLES[toast.type]}
        ${visible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-6 scale-95"}
      `}
      style={{ transition: "all 350ms cubic-bezier(0.34, 1.56, 0.64, 1)" }}
    >
      {/* Progress bar */}
      <div
        className="absolute top-0 left-0 h-0.5 bg-current opacity-40 rounded-full"
        style={{
          animation: `toastProgress ${(toast.duration ?? 4000)}ms linear forwards`,
          color: toast.type === "success" ? "#34d399" : toast.type === "error" ? "#f87171" : toast.type === "voice" ? "#a78bfa" : "#60a5fa",
        }}
      />

      <div className="flex items-start gap-3 p-4">
        <div className={`shrink-0 mt-0.5 ${ICON_COLORS[toast.type]}`}>
          <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{toast.message}</p>
          )}
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(() => onDismiss(toast.id), 350); }}
          className="shrink-0 p-0.5 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <style jsx>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]); // max 5 at once
  }, []);

  const success = useCallback((title: string, message?: string) => toast({ type: "success", title, message }), [toast]);
  const error   = useCallback((title: string, message?: string) => toast({ type: "error", title, message }), [toast]);
  const warning = useCallback((title: string, message?: string) => toast({ type: "warning", title, message }), [toast]);
  const info    = useCallback((title: string, message?: string) => toast({ type: "info", title, message }), [toast]);
  const voice   = useCallback((title: string, message?: string) => toast({ type: "voice", title, message, duration: 5000 }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, voice }}>
      {children}
      {/* Portal-like fixed overlay */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
