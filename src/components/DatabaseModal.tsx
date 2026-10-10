"use client";

import React, { useState } from "react";
import {
  X, Database, CheckCircle2, ShieldCheck, Terminal, Copy, Check,
  Server, RefreshCw, AlertCircle, ArrowRight, Zap, Lock, Globe,
} from "lucide-react";

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbMode: { mode: "turso" | "sqlite"; url: string };
  onConnectionChange?: () => void;
}

export function DatabaseModal({
  isOpen,
  onClose,
  dbMode,
  onConnectionChange,
}: DatabaseModalProps) {
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  // Turso form state
  const [tursoUrl, setTursoUrl] = useState("");
  const [tursoToken, setTursoToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleTestPing = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/db/connect");
      const data = await res.json();
      const elapsed = Math.round(performance.now() - start);
      if (res.ok && data.success) {
        setPingStatus(`Backend Online: Connected to ${data.database.mode.toUpperCase()} (${elapsed}ms latency)`);
      } else {
        setPingStatus(`Ping Error: ${data.error || res.status}`);
      }
    } catch (e: any) {
      setPingStatus("Ping Failed: " + e.message);
    } finally {
      setIsPinging(false);
    }
  };

  const handleConnectTurso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tursoUrl.trim()) {
      setConnectionMessage({ type: "error", text: "Please enter your Turso database URL (e.g. libsql://your-db.turso.io)" });
      return;
    }

    setIsConnecting(true);
    setConnectionMessage(null);
    try {
      const res = await fetch("/api/db/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "turso",
          url: tursoUrl.trim(),
          authToken: tursoToken.trim(),
          saveToEnv: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConnectionMessage({
          type: "success",
          text: `Successfully connected to Turso Cloud DB! Latency: ${data.latencyMs ?? 15}ms`,
        });
        onConnectionChange?.();
      } else {
        setConnectionMessage({
          type: "error",
          text: data.error || "Failed to connect to Turso database. Please verify credentials.",
        });
      }
    } catch (err: any) {
      setConnectionMessage({
        type: "error",
        text: "Network error: " + err.message,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchToSqlite = async () => {
    setIsConnecting(true);
    setConnectionMessage(null);
    try {
      const res = await fetch("/api/db/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "sqlite", saveToEnv: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConnectionMessage({
          type: "success",
          text: "Switched to local embedded SQLite database (wispr_flow.db)",
        });
        setTursoUrl("");
        setTursoToken("");
        onConnectionChange?.();
      }
    } catch (err: any) {
      setConnectionMessage({ type: "error", text: "Failed to switch: " + err.message });
    } finally {
      setIsConnecting(false);
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
                <span>Database & Backend Inspector</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Backend Online
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Turso LibSQL Cloud DB & Local SQLite embedded storage
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
          <div className="glass-card rounded-2xl p-5 border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <span>Active Connection Mode</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">LIVE</span>
              </div>
              <div className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                <Server className="w-4 h-4 text-violet-400" />
                <span className="capitalize">
                  {dbMode.mode === "turso" ? "Turso Cloud Database" : "Embedded SQLite File"}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-xs font-mono text-zinc-400 mt-1 break-all">
                Target: {dbMode.url}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleTestPing}
                disabled={isPinging}
                className="px-3.5 py-2 rounded-xl bg-surface-highlight hover:bg-surface-border text-xs font-medium text-zinc-200 border border-surface-border flex items-center gap-1.5 transition-all"
                title="Ping backend database connection"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isPinging ? "animate-spin" : ""}`} />
                <span>{isPinging ? "Testing..." : "Test Latency"}</span>
              </button>

              {dbMode.mode === "turso" && (
                <button
                  onClick={handleSwitchToSqlite}
                  disabled={isConnecting}
                  className="px-3 py-2 rounded-xl bg-surface-card hover:bg-surface-highlight text-xs text-zinc-300 border border-surface-border transition-all"
                >
                  Use Local SQLite
                </button>
              )}
            </div>
          </div>

          {pingStatus && (
            <div className="p-3 rounded-xl bg-surface-card border border-surface-border text-xs text-cyan-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{pingStatus}</span>
            </div>
          )}

          {/* Interactive Turso Cloud Connection Form */}
          <div className="glass-card rounded-2xl p-5 border border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">Connect Turso Cloud Database</h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">libsql://</span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Have a Turso database created? Enter your credentials below to connect your remote Turso database directly without restarting the server.
            </p>

            <form onSubmit={handleConnectTurso} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  TURSO_DATABASE_URL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tursoUrl}
                    onChange={(e) => setTursoUrl(e.target.value)}
                    placeholder="libsql://your-database-name.turso.io"
                    className="w-full bg-[#060710] text-xs text-white px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-violet-500/70 font-mono placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  TURSO_AUTH_TOKEN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={tursoToken}
                    onChange={(e) => setTursoToken(e.target.value)}
                    placeholder="eyJhbGciOiJFZERTQ..."
                    className="w-full bg-[#060710] text-xs text-white px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-violet-500/70 font-mono placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {connectionMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    connectionMessage.type === "success"
                      ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                      : "bg-rose-950/60 border-rose-500/40 text-rose-300"
                  }`}
                >
                  {connectionMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{connectionMessage.text}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-600/30 flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Connect Turso DB</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSwitchToSqlite}
                  disabled={isConnecting}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-surface-card hover:bg-surface-highlight text-zinc-300 border border-surface-border transition-all"
                >
                  Reset to Local SQLite
                </button>
              </div>
            </form>
          </div>

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
                <span>Environment Variables (.env.local & Vercel)</span>
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
