"use client";

import React, { useState } from "react";
import { X, Database, CheckCircle2, ShieldCheck, Terminal, Copy, Check, Server, RefreshCw } from "lucide-react";

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbMode: { mode: "turso" | "sqlite"; url: string };
}

export function DatabaseModal({ isOpen, onClose, dbMode }: DatabaseModalProps) {
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  if (!isOpen) return null;

  const handleTestPing = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/stats");
      const elapsed = Math.round(performance.now() - start);
      if (res.ok) {
        setPingStatus(`Ping OK: ${elapsed}ms response time`);
      } else {
        setPingStatus(`Ping Error (${res.status})`);
      }
    } catch (e: any) {
      setPingStatus("Ping Failed: " + e.message);
    } finally {
      setIsPinging(false);
    }
  };

  const envSample = `# Turso Cloud DB (LibSQL SQLite)\nTURSO_DATABASE_URL="libsql://your-db.turso.io"\nTURSO_AUTH_TOKEN="your-turso-token"\n\n# Fallback to local SQLite when unset:\n# file:wispr_flow.db`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl glass-panel rounded-3xl border border-surface-border overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Database Engine Inspector</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  LibSQL / SQLite
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Turso DB Cloud & Local SQLite embedded storage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-surface-highlight transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Active Mode Card */}
          <div className="glass-card rounded-2xl p-5 border border-surface-border flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                Active Connection Mode
              </div>
              <div className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                <Server className="w-4 h-4 text-violet-400" />
                <span className="capitalize">
                  {dbMode.mode === "turso" ? "Turso Cloud Database" : "Embedded SQLite File"}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-xs font-mono text-zinc-400 mt-1">
                Target: {dbMode.url}
              </div>
            </div>

            <button
              onClick={handleTestPing}
              disabled={isPinging}
              className="px-3.5 py-2 rounded-xl bg-surface-highlight hover:bg-surface-border text-xs font-medium text-zinc-200 border border-surface-border flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isPinging ? "animate-spin" : ""}`} />
              <span>{isPinging ? "Testing..." : "Test Latency"}</span>
            </button>
          </div>

          {pingStatus && (
            <div className="p-3 rounded-xl bg-surface-card border border-surface-border text-xs text-cyan-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{pingStatus}</span>
            </div>
          )}

          {/* SQLite / Turso Schema Information */}
          <div className="glass-card rounded-2xl p-5 border border-surface-border space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Tables & Schema (Auto-Managed)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#090a0f] border border-surface-border">
                <div className="font-mono text-violet-400 font-semibold">flows</div>
                <div className="text-zinc-400 text-[11px] mt-1">Stores voice code, sprint tasks, snippets & metadata</div>
              </div>
              <div className="p-3 rounded-xl bg-[#090a0f] border border-surface-border">
                <div className="font-mono text-cyan-400 font-semibold">voice_sessions</div>
                <div className="text-zinc-400 text-[11px] mt-1">Stores voice dictation logs, word counts & audio duration</div>
              </div>
              <div className="p-3 rounded-xl bg-[#090a0f] border border-surface-border">
                <div className="font-mono text-emerald-400 font-semibold">hackathon_metrics</div>
                <div className="text-zinc-400 text-[11px] mt-1">Stores hackathon voice dev minutes & words spoken</div>
              </div>
            </div>
          </div>

          {/* Turso Cloud Config Guide */}
          <div className="glass-card rounded-2xl p-5 border border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-violet-400" />
                <span>Connect Remote Turso DB (Vercel & Production)</span>
              </h3>
              <button
                onClick={copyEnv}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                {copiedEnv ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy .env</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              When deploying to Vercel, simply provide these two environment variables in your Vercel Project Settings. When unset locally, the app automatically runs on local embedded SQLite.
            </p>

            <pre className="p-3.5 rounded-xl bg-[#090a0f] border border-surface-border font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed">
              {envSample}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-card border-t border-surface-border flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
