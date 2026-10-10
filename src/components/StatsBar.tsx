"use client";

import React from "react";
import { Mic, Clock, Database, Sparkles, CheckCircle2, Award } from "lucide-react";

interface StatsBarProps {
  metrics: {
    totalFlows: number;
    starredFlows: number;
    completedFlows: number;
    voiceDevMinutes: number;
    wordsSpoken: number;
    commandsExecuted: number;
  };
  dbMode: { mode: "turso" | "sqlite"; url: string };
  onOpenDbModal: () => void;
}

export function StatsBar({ metrics, dbMode, onOpenDbModal }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full">
      {/* Stat 1: Voice Dev Time */}
      <div className="glass-card rounded-2xl p-4 border border-surface-border flex items-center gap-3.5 hover:border-violet-500/40 transition-all">
        <div className="p-3 rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/20">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {metrics.voiceDevMinutes} <span className="text-xs text-zinc-400 font-normal">min</span>
          </div>
          <div className="text-xs text-zinc-400 flex items-center gap-1">
            <span>Voice Dev Logged</span>
          </div>
        </div>
      </div>

      {/* Stat 2: Words Spoken */}
      <div className="glass-card rounded-2xl p-4 border border-surface-border flex items-center gap-3.5 hover:border-violet-500/40 transition-all">
        <div className="p-3 rounded-xl bg-cyan-600/10 text-cyan-400 border border-cyan-500/20">
          <Mic className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {metrics.wordsSpoken}
          </div>
          <div className="text-xs text-zinc-400">Words Dictated</div>
        </div>
      </div>

      {/* Stat 3: Total Artifacts */}
      <div className="glass-card rounded-2xl p-4 border border-surface-border flex items-center gap-3.5 hover:border-violet-500/40 transition-all">
        <div className="p-3 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {metrics.totalFlows}
          </div>
          <div className="text-xs text-zinc-400">Flows Generated</div>
        </div>
      </div>

      {/* Stat 4: Database Engine */}
      <div
        onClick={onOpenDbModal}
        className="glass-card rounded-2xl p-4 border border-surface-border flex items-center gap-3.5 hover:border-violet-500/40 transition-all cursor-pointer group"
      >
        <div className="p-3 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
          <Database className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm sm:text-base font-bold tracking-tight text-white truncate flex items-center gap-1.5">
            <span>{dbMode.mode === "turso" ? "Turso Cloud" : "SQLite Local"}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-xs text-zinc-400 truncate">Click to inspect DB</div>
        </div>
      </div>
    </div>
  );
}
