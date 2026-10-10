"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
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
  Mic, Search, Layers, History, Clock,
  Star, Database, Server, RefreshCw, Flame, Download,
  SlidersHorizontal, CheckCircle2,
} from "lucide-react";

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
    setTimeout(() => setConfettiTrigger(false), 2200);
  };

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
        voice("Voice Synthesis Complete", `Stored "${data.flow.title}" to SQLite`);
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
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100 selection:bg-zinc-800">
      <Header
        dbMode={dbMode}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenTeleprompter={() => setIsTeleprompterOpen(true)}
        onOpenSubmissionModal={() => setIsSubmissionModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── Studio Header & Metrics Strip ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
              <span>Voice Development Studio</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                v1.0
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              100% voice-driven development with Wispr Flow · Real-time Turso LibSQL & SQLite persistence
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121215] border border-zinc-800 text-zinc-300">
              <span className="text-zinc-500">Flows:</span>
              <span className="font-semibold text-white">{stats.totalFlows}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121215] border border-zinc-800 text-zinc-300">
              <span className="text-zinc-500">Voice Time:</span>
              <span className="font-semibold text-white">{stats.voiceDevMinutes}m</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121215] border border-zinc-800 text-zinc-300">
              <span className="text-zinc-500">Words Dictated:</span>
              <span className="font-semibold text-white">{stats.wordsSpoken.toLocaleString()}</span>
            </div>

            <button
              onClick={() => setIsDbModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121215] hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 transition-colors"
              title="Click to configure Turso Cloud DB or test connection"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-zinc-400">{dbMode.mode === "turso" ? "turso:cloud" : "sqlite:local"}</span>
            </button>
          </div>
        </div>

        {/* ── Voice Dictation Command Deck ── */}
        <VoiceMicBar
          onFlowCreated={() => {
            triggerConfetti();
            voice("Flow Synthesized", "Stored in SQLite database.");
            refreshAll();
          }}
        />

        {/* ── 2-Column Developer Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Area: Flow List & Logs (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* View Switcher & Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                <button
                  onClick={() => setActiveTab("flows")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeTab === "flows"
                      ? "bg-zinc-800 text-white font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Synthesized Flows</span>
                  <span className="px-1.5 py-0.2 rounded bg-zinc-950 text-zinc-400 text-[10px] font-mono">
                    {filteredFlows.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("sessions")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeTab === "sessions"
                      ? "bg-zinc-800 text-white font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Audit Log</span>
                  <span className="px-1.5 py-0.2 rounded bg-zinc-950 text-zinc-400 text-[10px] font-mono">
                    {sessions.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("activity")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeTab === "activity"
                      ? "bg-zinc-800 text-white font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Heatmap</span>
                </button>
              </div>

              {activeTab === "flows" && (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter flows..."
                      className="pl-8 pr-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 placeholder:text-zinc-500 w-36 sm:w-44 font-mono"
                    />
                  </div>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 px-2.5 py-1 focus:outline-none focus:border-zinc-600 font-mono"
                  >
                    <option value="all">All Types</option>
                    <option value="component">TSX Components</option>
                    <option value="task">Sprint Tasks</option>
                    <option value="snippet">REST Routes</option>
                    <option value="prompt">Teleprompter</option>
                  </select>

                  <button
                    onClick={() => setOnlyStarred(!onlyStarred)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                      onlyStarred
                        ? "bg-amber-950/40 text-amber-300 border-amber-600/40 font-medium"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <Star className={`w-3 h-3 ${onlyStarred ? "fill-amber-400 text-amber-400" : ""}`} />
                    <span>Starred</span>
                  </button>

                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors"
                    title="Export Database to JSON / TypeScript"
                  >
                    <Download className="w-3 h-3 text-zinc-400" />
                    <span>Export</span>
                  </button>
                </div>
              )}
            </div>

            {/* Flows Grid */}
            {activeTab === "flows" && (
              <>
                {isLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3 border border-zinc-800 rounded-xl bg-[#111114]">
                    <div className="w-5 h-5 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
                    <span className="text-xs text-zinc-500 font-mono">Querying SQLite database...</span>
                  </div>
                ) : filteredFlows.length === 0 ? (
                  <div className="border border-zinc-800 rounded-xl p-12 text-center bg-[#111114]">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                      <Mic className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-medium text-white">No flows found</h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                      Dictate a voice command or click a quick preset in the command bar above.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
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
              <div className="rounded-xl border border-zinc-800 overflow-hidden bg-[#111114]">
                <div className="px-4 py-3 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-white">Voice Dictation Audit Trail</span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Session transcripts logged to SQLite to verify 100% voice-driven engineering
                    </p>
                  </div>
                  <span className="font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                    {sessions.length} entries
                  </span>
                </div>

                {sessions.length === 0 ? (
                  <div className="py-10 text-center text-xs text-zinc-500 font-mono">
                    No sessions recorded yet
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-800/60">
                    {sessions.map((sess, i) => (
                      <div key={sess.id} className="p-4 hover:bg-zinc-900/40 transition-colors">
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-zinc-600 w-4 text-right">{i + 1}.</span>
                            <span className="text-xs font-semibold text-white">{sess.title}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {sess.actionType}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{sess.durationSec}s</span>
                            <span>{sess.wordsCount}w</span>
                          </div>
                        </div>
                        <div className="ml-6 font-mono text-xs text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 leading-relaxed">
                          <span className="text-zinc-600 select-none">▸ </span>"{sess.transcript}"
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Heatmap Tab */}
            {activeTab === "activity" && (
              <ActivityHeatmap sessions={sessions} flows={flows} />
            )}
          </div>

          {/* Sidebar: Inspector & Engine (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Database Engine Card */}
            <div className="rounded-xl border border-zinc-800 bg-[#121215] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Database Engine</span>
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Online
                </span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs space-y-1.5 text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Driver:</span>
                  <span>@libsql/client</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Mode:</span>
                  <span className="capitalize">{dbMode.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Target:</span>
                  <span className="truncate max-w-[150px]" title={dbMode.url}>{dbMode.url}</span>
                </div>
              </div>

              <button
                onClick={() => setIsDbModalOpen(true)}
                className="w-full py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                <span>Configure Turso / SQLite</span>
              </button>
            </div>

            {/* Compact Contribution Activity */}
            <div className="rounded-xl border border-zinc-800 bg-[#121215] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Voice Contribution Activity</span>
                </span>
                <span className="text-[11px] font-mono text-zinc-500">52 Weeks</span>
              </div>

              <div className="overflow-x-auto">
                <ActivityHeatmap sessions={sessions} flows={flows} />
              </div>
            </div>

            {/* Quick Submission & Referral Verification Box */}
            <div className="rounded-xl border border-zinc-800 bg-[#121215] p-4 space-y-3">
              <span className="text-xs font-semibold text-white">Hackathon Task Submission</span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Account created via mandatory referral link:
              </p>
              <a
                href="https://ref.wisprflow.ai/hhg"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-violet-300 hover:text-violet-200 hover:border-zinc-700 transition-colors truncate"
              >
                ref.wisprflow.ai/hhg
              </a>

              <button
                onClick={() => setIsSubmissionModalOpen(true)}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
              >
                View Submission Checklist
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ── Minimalist Footer ── */}
      <footer className="border-t border-zinc-800/80 mt-12 py-4 bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-3">
            <span className="text-zinc-300">wispr-flow-studio</span>
            <span>·</span>
            <span>Turso LibSQL & SQLite</span>
            <span>·</span>
            <a href="https://ref.wisprflow.ai/hhg" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">
              ref.wisprflow.ai/hhg
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsCommandPaletteOpen(true)} className="hover:text-zinc-300 transition-colors">
              Command Palette (⌘K)
            </button>
            <a href="https://github.com/dubeysanskar/flow" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">
              dubeysanskar/flow
            </a>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <TeleprompterModal isOpen={isTeleprompterOpen} onClose={() => setIsTeleprompterOpen(false)} />
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        dbMode={dbMode}
        onConnectionChange={refreshAll}
      />
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
