"use client";

import React from "react";
import { Mic, Clock, Database, Sparkles, Zap } from "lucide-react";
import { useCountUp } from "@/lib/useCountUp";

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

function StatCard({
  icon: Icon,
  value,
  suffix,
  label,
  iconColor,
  bgColor,
  borderColor,
  delay = 0,
  onClick,
}: {
  icon: any;
  value: number;
  suffix?: string;
  label: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  delay?: number;
  onClick?: () => void;
}) {
  const count = useCountUp({ target: value, duration: 1600, delay });

  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-2xl p-4 sm:p-5 border ${borderColor} flex items-center gap-4 card-lift ${
        onClick ? "cursor-pointer" : ""
      } group`}
    >
      <div className={`p-3 rounded-xl ${bgColor} border ${borderColor} shrink-0 group-hover:scale-110 transition-transform duration-200`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <div className="flex items-end gap-1.5">
          <span className={`stat-number text-2xl sm:text-3xl font-bold text-white leading-none`}>
            {count.toLocaleString()}
          </span>
          {suffix && (
            <span className="text-xs text-zinc-400 font-medium mb-0.5">{suffix}</span>
          )}
        </div>
        <div className="text-xs text-zinc-400 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function DbCard({
  dbMode,
  onClick,
}: {
  dbMode: { mode: "turso" | "sqlite"; url: string };
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="glass-card holo-card rounded-2xl p-4 sm:p-5 flex items-center gap-4 card-lift cursor-pointer group"
    >
      <div className="p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 shrink-0 group-hover:scale-110 transition-transform duration-200 relative">
        <Database className="w-5 h-5 text-indigo-400" />
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#060710] animate-pulse" />
      </div>
      <div className="min-w-0">
        <div className="text-sm sm:text-base font-bold text-white truncate">
          {dbMode.mode === "turso" ? "Turso Cloud" : "SQLite Local"}
        </div>
        <div className="text-xs text-zinc-400 truncate font-mono">{dbMode.url}</div>
        <div className="mt-1 text-[10px] uppercase tracking-wider font-semibold text-emerald-400">
          ● healthy · click to inspect
        </div>
      </div>
    </div>
  );
}

export function StatsBar({ metrics, dbMode, onOpenDbModal }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        icon={Clock}
        value={metrics.voiceDevMinutes}
        suffix="min"
        label="Voice Dev Logged"
        iconColor="text-violet-400"
        bgColor="bg-violet-600/10"
        borderColor="border-violet-500/20 hover:border-violet-500/40"
        delay={0}
      />
      <StatCard
        icon={Mic}
        value={metrics.wordsSpoken}
        label="Words Dictated"
        iconColor="text-cyan-400"
        bgColor="bg-cyan-600/10"
        borderColor="border-cyan-500/20 hover:border-cyan-500/40"
        delay={150}
      />
      <StatCard
        icon={Sparkles}
        value={metrics.totalFlows}
        label="Flows Synthesized"
        iconColor="text-emerald-400"
        bgColor="bg-emerald-600/10"
        borderColor="border-emerald-500/20 hover:border-emerald-500/40"
        delay={300}
      />
      <DbCard dbMode={dbMode} onClick={onOpenDbModal} />
    </div>
  );
}
