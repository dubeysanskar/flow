"use client";

import React from "react";
import { Mic, Database, ExternalLink, Sparkles, CheckCircle2, Github, Video, Command, Download } from "lucide-react";

interface HeaderProps {
  dbMode: { mode: "turso" | "sqlite"; url: string };
  onOpenDbModal: () => void;
  onOpenTeleprompter: () => void;
  onOpenSubmissionModal: () => void;
  onOpenCommandPalette?: () => void;
  onOpenExport?: () => void;
}

export function Header({
  dbMode,
  onOpenDbModal,
  onOpenTeleprompter,
  onOpenSubmissionModal,
  onOpenCommandPalette,
  onOpenExport,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 shadow-lg shadow-violet-600/30">
            <Mic className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#090a0f] animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#090a0f]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">Wispr Flow</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Studio
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">Voice-Driven Developer Command Center</p>
          </div>
        </div>

        {/* Center / Action Badges */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Wispr Referral Pill */}
          <a
            href="https://ref.wisprflow.ai/hhg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-950/60 hover:bg-violet-900/60 border border-violet-500/40 text-violet-200 transition-all hover:scale-105 shadow-sm group"
            title="Mandatory Hackathon Referral Link: ref.wisprflow.ai/hhg"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span>Wispr Referral Verified</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          {/* Database Engine Pill */}
          <button
            onClick={onOpenDbModal}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface-card hover:bg-surface-highlight border border-surface-border text-zinc-300 transition-all hover:border-violet-500/50"
            title="Inspect Database status and Turso/SQLite configuration"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="capitalize">
              {dbMode.mode === "turso" ? "Turso Cloud DB" : "SQLite Local"}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Command Palette Trigger */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono bg-surface-card hover:bg-surface-highlight border border-surface-border hover:border-violet-500/40 text-zinc-400 hover:text-zinc-200 transition-all"
              title="Open Command Palette (⌘K)"
            >
              <Command className="w-3.5 h-3.5 text-violet-400" />
              <span>⌘K</span>
            </button>
          )}

          {/* Export Center Trigger */}
          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-surface-card hover:bg-surface-highlight border border-surface-border hover:border-cyan-500/40 text-zinc-300 transition-all"
              title="Export database to JSON / TS / Markdown"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          <button
            onClick={onOpenTeleprompter}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700 transition-all"
            title="Open Demo Video Recording Teleprompter"
          >
            <Video className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">Demo Script</span>
          </button>

          <button
            onClick={onOpenSubmissionModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-600/30 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Task Submission</span>
          </button>

          <a
            href="https://github.com/dubeysanskar/flow"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-surface-card hover:bg-surface-highlight border border-surface-border transition-all"
            title="View GitHub Repository dubeysanskar/flow"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}

