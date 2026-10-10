"use client";

import React from "react";
import {
  Mic, Database, ExternalLink, Sparkles, CheckCircle2,
  Github, Video, Command, Download, GitBranch,
} from "lucide-react";

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
    <header className="sticky top-0 z-40 w-full bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand & Repo Crumb */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700/80 text-zinc-100 shadow-sm">
              <Mic className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-white">wispr</span>
              <span className="text-zinc-600 font-mono text-xs">/</span>
              <span className="font-medium text-xs text-zinc-300">flow</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <GitBranch className="w-3 h-3 text-zinc-500" />
            <span>main</span>
          </div>

          {/* Database Engine Pill */}
          <button
            onClick={onOpenDbModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 transition-colors"
            title="Inspect Database status and Turso / SQLite connection"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{dbMode.mode === "turso" ? "turso-cloud" : "sqlite:local"}</span>
          </button>
        </div>

        {/* Center: Command Palette Trigger */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 transition-all w-64 justify-between font-mono"
          >
            <span className="text-zinc-500 text-xs">Type a command or search...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-400">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Export */}
          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
              title="Export database to JSON / TypeScript"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export</span>
            </button>
          )}

          {/* Teleprompter Script */}
          <button
            onClick={onOpenTeleprompter}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            title="Video recording teleprompter guide"
          >
            <Video className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Script</span>
          </button>

          {/* Referral Verified */}
          <a
            href="https://ref.wisprflow.ai/hhg"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-violet-300 bg-violet-950/40 hover:bg-violet-950/70 border border-violet-800/40 transition-colors"
            title="Wispr Referral Account Verified (ref.wisprflow.ai/hhg)"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Referral Verified</span>
            <ExternalLink className="w-2.5 h-2.5 text-violet-400 opacity-70" />
          </a>

          {/* Task Submission */}
          <button
            onClick={onOpenSubmissionModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-200" />
            <span>Submission</span>
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com/dubeysanskar/flow"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            title="GitHub: dubeysanskar/flow"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
