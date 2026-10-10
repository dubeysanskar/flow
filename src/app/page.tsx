"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { StatsBar } from "@/components/StatsBar";
import { VoiceMicBar } from "@/components/VoiceMicBar";
import { FlowCard, FlowItem } from "@/components/FlowCard";
import { TeleprompterModal } from "@/components/TeleprompterModal";
import { DatabaseModal } from "@/components/DatabaseModal";
import { SubmissionModal } from "@/components/SubmissionModal";
import {
  Mic,
  Search,
  Filter,
  Sparkles,
  Layers,
  History,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function HomePage() {
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

  // Filter states
  const [activeTab, setActiveTab] = useState<"flows" | "sessions">("flows");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);

  const fetchFlows = useCallback(async () => {
    try {
      let url = `/api/flows?type=${typeFilter}&status=${statusFilter}`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setFlows(data.flows);
      }
    } catch (err) {
      console.error("Failed to fetch flows:", err);
    }
  }, [typeFilter, statusFilter, searchQuery]);

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
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchFlows(), fetchStats(), fetchSessions()]);
    setIsLoading(false);
  }, [fetchFlows, fetchStats, fetchSessions]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Card Actions
  const handleToggleStar = async (id: string, currentStarred: boolean) => {
    try {
      const res = await fetch(`/api/flows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred: !currentStarred }),
      });
      if (res.ok) {
        setFlows((prev) =>
          prev.map((f) => (f.id === id ? { ...f, isStarred: !currentStarred } : f))
        );
        fetchStats();
      }
    } catch (err) {
      console.error("Star toggle error:", err);
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
        setFlows((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: nextStatus } : f))
        );
        fetchStats();
      }
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item from SQLite database?")) return;
    try {
      const res = await fetch(`/api/flows/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFlows((prev) => prev.filter((f) => f.id !== id));
        fetchStats();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredFlows = flows.filter((f) => {
    if (onlyStarred && !f.isStarred) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-zinc-100">
      {/* Navigation Header */}
      <Header
        dbMode={dbMode}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenTeleprompter={() => setIsTeleprompterOpen(true)}
        onOpenSubmissionModal={() => setIsSubmissionModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative glass-panel rounded-3xl p-6 sm:p-10 border border-surface-border overflow-hidden">
          {/* Glowing gradient orbs */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-600/15 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Wispr Flow Shortlisting Task & Hackathon</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Build Entire Projects Using{" "}
              <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                Only Your Voice.
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
              Turn natural voice dictations into production React components, Turso SQLite schemas,
              and sprint tasks. Demonstrate hands-free voice-driven development powered by Wispr Flow.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="https://ref.wisprflow.ai/hhg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <span>Wispr Referral Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setIsTeleprompterOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-surface-card hover:bg-surface-highlight border border-surface-border text-zinc-200 transition-all"
              >
                <span>Open Video Recording Prompter</span>
                <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
              </button>

              <button
                onClick={() => setIsDbModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-[#090a0f] border border-surface-border transition-all"
              >
                <span>DB: {dbMode.mode === "turso" ? "Turso Cloud" : "SQLite Local"}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Metrics Bar */}
        <StatsBar
          metrics={stats}
          dbMode={dbMode}
          onOpenDbModal={() => setIsDbModalOpen(true)}
        />

        {/* Voice Dictation Terminal */}
        <VoiceMicBar onFlowCreated={refreshAll} />

        {/* Explorer Tabs & Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/60 pb-4">
            {/* Main Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("flows")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "flows"
                    ? "bg-violet-600/20 text-violet-200 border border-violet-500/40 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Layers className="w-4 h-4 text-violet-400" />
                <span>Voice Flows ({filteredFlows.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("sessions")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "sessions"
                    ? "bg-violet-600/20 text-violet-200 border border-violet-500/40 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <History className="w-4 h-4 text-cyan-400" />
                <span>Voice Log History ({sessions.length})</span>
              </button>
            </div>

            {/* Search & Filters */}
            {activeTab === "flows" && (
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search flows..."
                    className="pl-8 pr-3 py-1.5 bg-surface-card border border-surface-border rounded-xl text-xs text-white focus:outline-none focus:border-violet-500 placeholder:text-zinc-500 w-36 sm:w-44"
                  />
                </div>

                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-surface-card border border-surface-border rounded-xl text-xs text-zinc-300 px-3 py-1.5 focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="component">Components</option>
                  <option value="task">Tasks</option>
                  <option value="snippet">Snippets</option>
                  <option value="prompt">Demo Scripts</option>
                </select>

                {/* Starred Toggle */}
                <button
                  onClick={() => setOnlyStarred(!onlyStarred)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    onlyStarred
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-surface-card text-zinc-400 border-surface-border hover:text-zinc-200"
                  }`}
                >
                  Starred
                </button>
              </div>
            )}
          </div>

          {/* Tab 1: Flows Grid */}
          {activeTab === "flows" && (
            <div>
              {isLoading ? (
                <div className="py-20 text-center">
                  <div className="inline-block w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin mb-3" />
                  <p className="text-xs text-zinc-400">Loading SQLite records...</p>
                </div>
              ) : filteredFlows.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center border border-surface-border">
                  <Mic className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-white">No flows found</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                    Speak into Wispr Flow above or click one of the quick presets to generate voice
                    code and persist it in SQLite!
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
            </div>
          )}

          {/* Tab 2: Voice History Sessions */}
          {activeTab === "sessions" && (
            <div className="glass-card rounded-2xl border border-surface-border overflow-hidden">
              <div className="p-4 bg-surface-card border-b border-surface-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Voice Dictation Session Logs</h3>
                  <p className="text-xs text-zinc-400">
                    Proves 100% voice-driven development for the hackathon submission
                  </p>
                </div>
                <span className="text-xs text-violet-400 font-mono">
                  {sessions.length} sessions logged
                </span>
              </div>

              <div className="divide-y divide-surface-border/50">
                {sessions.map((sess) => (
                  <div key={sess.id} className="p-4 sm:p-5 hover:bg-surface-card/40 transition-colors">
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{sess.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/30">
                          {sess.actionType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          {sess.durationSec}s
                        </span>
                        <span>{sess.wordsCount} words</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300 font-mono bg-[#090a0f] p-3 rounded-xl border border-surface-border mt-2">
                      "{sess.transcript}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-surface-border mt-16 py-6 text-xs text-zinc-500 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Built with voice for the Wispr Flow Hackathon</span>
            <span>•</span>
            <a
              href="https://ref.wisprflow.ai/hhg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:underline"
            >
              ref.wisprflow.ai/hhg
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/dubeysanskar/flow"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub (dubeysanskar/flow)
            </a>
            <a
              href="https://forms.gle/Lv9wF8gYVHdEqfJW8"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Submission Form
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TeleprompterModal
        isOpen={isTeleprompterOpen}
        onClose={() => setIsTeleprompterOpen(false)}
      />

      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        dbMode={dbMode}
      />

      <SubmissionModal
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
      />
    </div>
  );
}
