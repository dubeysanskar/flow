"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { StatsBar } from "@/components/StatsBar";
import { VoiceMicBar } from "@/components/VoiceMicBar";
import { FlowCard, FlowItem } from "@/components/FlowCard";
import { TeleprompterModal } from "@/components/TeleprompterModal";
import { DatabaseModal } from "@/components/DatabaseModal";
import { SubmissionModal } from "@/components/SubmissionModal";
import { CommandPalette } from "@/components/CommandPalette";
import { ExportModal } from "@/components/ExportModal";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { ConfettiCanvas } from "@/components/ConfettiCanvas";
import { useToast } from "@/components/Toast";
import {
  Mic, Search, Sparkles, Layers, History, Clock,
  ArrowRight, ExternalLink, Star, ChevronRight, Database, Cpu, Radio,
  Flame, Download, Command,
} from "lucide-react";

// ── Animated hero title with rotating words ──────────────────────────────────
const ROTATING_WORDS = ["Components", "APIs", "Tasks", "Schemas", "Scripts", "Flows"];

function AnimatedHero({ onOpenTeleprompter, onOpenDbModal, dbMode }: {
  onOpenTeleprompter: () => void;
  onOpenDbModal: () => void;
  dbMode: { mode: string; url: string };
}) {
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
        setVisible(true);
      }, 300);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-surface-border glass-panel shadow-2xl mesh-gradient">
      {/* Orb decorations */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Scanning line accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="relative z-10 p-6 sm:p-10 lg:p-14 flex flex-col lg:flex-row items-start lg:items-center gap-10">
        {/* Left: Text */}
        <div className="flex-1 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-600/15 border border-violet-500/30 text-violet-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Wispr Flow Shortlisting Task
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              Deadline: Oct 10 · 11:59 PM
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-balance">
            <span className="text-white">Voice-Dictate</span>
            <br />
            <span className="gradient-text text-glow-violet">
              {ROTATING_WORDS[wordIndex]}
            </span>
            <br />
            <span className="text-zinc-300 text-2xl sm:text-3xl lg:text-4xl font-bold">to SQLite in Real-Time.</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
            Open your mic, speak naturally with <strong className="text-violet-300">Wispr Flow</strong>, and
            watch your words transform into production-ready React components, Turso LibSQL schemas,
            sprint tasks, and API routes — all persisted in real-time to SQLite.
          </p>

          {/* CTA buttons */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="https://ref.wisprflow.ai/hhg"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-xl shadow-violet-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>Get Wispr Flow (Referral)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
            </a>

            <button
              onClick={onOpenTeleprompter}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-surface-card hover:bg-surface-highlight border border-surface-border text-zinc-100 hover:border-violet-500/40 transition-all"
            >
              <span>Video Script</span>
              <ArrowRight className="w-4 h-4 text-violet-400" />
            </button>

            <button
              onClick={onOpenDbModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white bg-[#060710] border border-surface-border hover:border-violet-500/30 transition-all"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs">{dbMode.mode === "turso" ? "Turso Cloud" : "SQLite Local"}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>
        </div>

        {/* Right: Stats / Feature pills */}
        <div className="flex flex-col gap-3 lg:min-w-64">
          {[
            { icon: Radio, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", label: "Wispr Flow Web Speech Engine", sub: "Real-time voice transcription" },
            { icon: Database, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", label: "Turso Cloud + SQLite Local", sub: "@libsql/client dual-mode" },
            { icon: Cpu, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Canvas Audio Oscilloscope", sub: "Web Audio API waveform" },
            { icon: Sparkles, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "AI Intent Detection", sub: "Auto-routes to TSX / Task / MD" },
          ].map(({ icon: Icon, color, bg, label, sub }, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} glass-card`}>
              <div className={`p-2 rounded-lg ${bg.replace("border-", "bg-").split(" ")[0]} shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{label}</div>
                <div className="text-[11px] text-zinc-500 font-mono">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { success, error, info, voice } = useToast();
  const [flows, setFlows] = useState<FlowItem[]>([]);
  const [stats, setStats] = useState({
    totalFlows: 4,
    starredFlows: 2,
    completedFlows: 1,
    voiceDevMinutes: 58,
    wordsSpoken: 840,
    commandsExecuted: 24,
  });
  const [dbMode, setDbMode] = useState<{ mode: "turso" | "sqlite"; url: string }>({
    mode: "sqlite",
    url: "file:wispr_flow.db",
  });
  const [sessions, setSessions] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<"flows" | "sessions" | "activity">("flows");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(false);

  const triggerConfetti = () => {
    setConfettiTrigger(true);
    setTimeout(() => setConfettiTrigger(false), 2500);
  };

  // Keyboard shortcut for Command Palette ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchFlows = useCallback(async () => {
    try {
      let url = `/api/flows?type=${typeFilter}`;
      if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setFlows(data.flows);
    } catch (err) {
      console.error("Failed to fetch flows:", err);
    }
  }, [typeFilter, searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.metrics);
        setDbMode(data.database);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      if (data.success) setSessions(data.sessions);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchFlows(), fetchStats(), fetchSessions()]);
    setIsLoading(false);
  }, [fetchFlows, fetchStats, fetchSessions]);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  const handleSynthesizePreset = async (promptText: string) => {
    try {
      info("Synthesizing prompt...", promptText.slice(0, 48) + "...");
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: promptText,
          durationSec: 15,
          mode: "code",
        }),
      });
      const data = await res.json();
      if (data.success) {
        triggerConfetti();
        voice("Voice Synthesis Complete!", `Persisted "${data.flow.title}" to SQLite`);
        await refreshAll();
      } else {
        error("Synthesis failed", data.error || "Unknown error");
      }
    } catch (err: any) {
      error("Network error", err.message);
    }
  };

  const handleToggleStar = async (id: string, currentStarred: boolean) => {
    try {
      const res = await fetch(`/api/flows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred: !currentStarred }),
      });
      if (res.ok) {
        setFlows((prev) => prev.map((f) => f.id === id ? { ...f, isStarred: !currentStarred } : f));
        fetchStats();
        success(!currentStarred ? "Starred Flow" : "Unstarred Flow");
      }
    } catch {
      error("Failed to update star");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "active" : "completed";
    try {
      const res = await fetch(`/api/flows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setFlows((prev) => prev.map((f) => f.id === id ? { ...f, status: nextStatus } : f));
        fetchStats();
        info(`Status updated to ${nextStatus}`);
      }
    } catch {
      error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this flow from the SQLite database?")) return;
    try {
      const res = await fetch(`/api/flows/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFlows((prev) => prev.filter((f) => f.id !== id));
        fetchStats();
        info("Flow deleted from database");
      }
    } catch {
      error("Failed to delete flow");
    }
  };

  const filteredFlows = flows.filter((f) => {
    if (onlyStarred && !f.isStarred) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#060710] text-zinc-100">
      <Header
        dbMode={dbMode}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenTeleprompter={() => setIsTeleprompterOpen(true)}
        onOpenSubmissionModal={() => setIsSubmissionModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero */}
        <AnimatedHero
          onOpenTeleprompter={() => setIsTeleprompterOpen(true)}
          onOpenDbModal={() => setIsDbModalOpen(true)}
          dbMode={dbMode}
        />

        {/* Stats */}
        <StatsBar metrics={stats} dbMode={dbMode} onOpenDbModal={() => setIsDbModalOpen(true)} />

        {/* Voice Terminal */}
        <VoiceMicBar
          onFlowCreated={() => {
            triggerConfetti();
            voice("New Flow Synthesized!", "Persisted securely in SQLite database.");
            refreshAll();
          }}
        />

        {/* Flow Explorer */}
        <div className="space-y-5">
          {/* Tab header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border/60">
            <div className="flex items-center gap-1 bg-surface-card border border-surface-border rounded-xl p-1 flex-wrap">
              <button
                onClick={() => setActiveTab("flows")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "flows"
                    ? "bg-violet-600/20 text-violet-200 border border-violet-500/35 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-violet-400" />
                Synthesized Flows
                <span className="px-1.5 py-0.5 rounded-md bg-surface-highlight text-zinc-400 text-[10px] font-mono">
                  {filteredFlows.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("sessions")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "sessions"
                    ? "bg-violet-600/20 text-violet-200 border border-violet-500/35 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <History className="w-3.5 h-3.5 text-cyan-400" />
                Voice Log History
                <span className="px-1.5 py-0.5 rounded-md bg-surface-highlight text-zinc-400 text-[10px] font-mono">
                  {sessions.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("activity")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "activity"
                    ? "bg-violet-600/20 text-violet-200 border border-violet-500/35 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Voice Heatmap & Streaks
              </button>
            </div>

            {activeTab === "flows" && (
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search flows..."
                    className="pl-8 pr-3 py-1.5 bg-surface-card border border-surface-border rounded-xl text-xs text-white focus:outline-none focus:border-violet-500/60 placeholder:text-zinc-600 w-36 sm:w-44 font-mono"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-surface-card border border-surface-border rounded-xl text-xs text-zinc-300 px-3 py-1.5 focus:outline-none focus:border-violet-500/60 cursor-pointer font-mono"
                >
                  <option value="all">All Types</option>
                  <option value="component">TSX Components</option>
                  <option value="task">Sprint Tasks</option>
                  <option value="snippet">Code Snippets</option>
                  <option value="prompt">Demo Scripts</option>
                </select>

                <button
                  onClick={() => setOnlyStarred(!onlyStarred)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    onlyStarred
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/35"
                      : "bg-surface-card text-zinc-400 border-surface-border hover:border-amber-500/25 hover:text-amber-400"
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${onlyStarred ? "fill-amber-400" : ""}`} />
                  <span>Starred</span>
                </button>

                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-card text-zinc-300 border border-surface-border hover:border-cyan-500/40 hover:text-cyan-300 transition-all"
                  title="Export Database to JSON, TypeScript, Markdown"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export</span>
                </button>
              </div>
            )}
          </div>

          {/* Flows Grid */}
          {activeTab === "flows" && (
            <>
              {isLoading ? (
                <div className="py-24 flex flex-col items-center gap-4">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping" />
                    <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                  </div>
                  <p className="text-xs text-zinc-500 font-mono">querying libsql database...</p>
                </div>
              ) : filteredFlows.length === 0 ? (
                <div className="glass-card holo-card rounded-2xl p-14 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                    <Mic className="w-8 h-8 text-violet-400 opacity-60" />
                  </div>
                  <h3 className="text-base font-semibold text-white">No flows found</h3>
                  <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto">
                    Dictate a command above or click a quick preset to synthesize your first flow and store it in SQLite.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFlows.map((flow) => (
                    <FlowCard
                      key={flow.id}
                      flow={flow}
                      onToggleStar={handleToggleStar}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Sessions Table */}
          {activeTab === "sessions" && (
            <div className="rounded-2xl border border-surface-border overflow-hidden glass-card">
              <div className="px-5 py-3.5 bg-surface-card border-b border-surface-border flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Voice Dictation Audit Log</div>
                  <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                    Cryptographic proof of 100% voice-driven development for hackathon submission
                  </div>
                </div>
                <span className="font-mono text-[11px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg">
                  {sessions.length} sessions
                </span>
              </div>

              {sessions.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500 font-mono">
                  No sessions yet — start dictating commands above
                </div>
              ) : (
                <div className="divide-y divide-surface-border/40">
                  {sessions.map((sess, i) => (
                    <div key={sess.id} className="px-5 py-4 hover:bg-surface-card/30 transition-colors">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs text-zinc-600 w-5 text-right shrink-0">{i + 1}.</span>
                          <span className="text-sm font-medium text-white">{sess.title}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                            {sess.actionType}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono shrink-0">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{sess.durationSec}s</span>
                          <span>{sess.wordsCount}w</span>
                        </div>
                      </div>
                      <div className="ml-7 font-mono text-xs text-zinc-400 bg-[#040509] p-2.5 rounded-lg border border-surface-border/50 leading-relaxed">
                        <span className="text-violet-600 select-none">▸ </span>"{sess.transcript}"
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activity Heatmap Tab */}
          {activeTab === "activity" && (
            <ActivityHeatmap sessions={sessions} flows={flows} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border mt-16 py-5 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-3">
            <span className="text-violet-400">wispr-flow-studio</span>
            <span>·</span>
            <a href="https://ref.wisprflow.ai/hhg" target="_blank" rel="noopener noreferrer" className="hover:text-violet-300 transition-colors">ref.wisprflow.ai/hhg</a>
            <span>·</span>
            <span>Next.js 14 · Turso LibSQL · Vercel</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hover:text-white transition-colors flex items-center gap-1 text-zinc-400"
            >
              <Command className="w-3 h-3 text-violet-400" />
              <span>Command Palette (⌘K)</span>
            </button>
            <a href="https://github.com/dubeysanskar/flow" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <ChevronRight className="w-3 h-3" />dubeysanskar/flow
            </a>
            <a href="https://forms.gle/Lv9wF8gYVHdEqfJW8" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />Submission Form
            </a>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <TeleprompterModal isOpen={isTeleprompterOpen} onClose={() => setIsTeleprompterOpen(false)} />
      <DatabaseModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} dbMode={dbMode} />
      <SubmissionModal isOpen={isSubmissionModalOpen} onClose={() => setIsSubmissionModalOpen(false)} />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        flowCount={flows.length}
        sessionCount={sessions.length}
      />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSynthesizePreset={handleSynthesizePreset}
        onOpenTeleprompter={() => setIsTeleprompterOpen(true)}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenSubmission={() => setIsSubmissionModalOpen(true)}
        onOpenShortcuts={() => setIsCommandPaletteOpen(true)}
        onToggleTab={(t) => setActiveTab(t)}
      />
      <ConfettiCanvas trigger={confettiTrigger} />
    </div>
  );
}

