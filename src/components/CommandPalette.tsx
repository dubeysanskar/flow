"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Command, Mic, Database, Sparkles, Video, Award, Layers,
  History, Star, Download, Keyboard, ExternalLink, Terminal, ChevronRight,
  CheckCircle2, FileText, Code2, Zap, X,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.FC<any>;
  iconColor?: string;
  shortcut?: string[];
  action: () => void;
  category: "navigation" | "voice" | "database" | "tools";
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSynthesizePreset: (text: string) => void;
  onOpenTeleprompter: () => void;
  onOpenDbModal: () => void;
  onOpenExport: () => void;
  onOpenSubmission: () => void;
  onOpenShortcuts: () => void;
  onToggleTab: (tab: "flows" | "sessions") => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSynthesizePreset,
  onOpenTeleprompter,
  onOpenDbModal,
  onOpenExport,
  onOpenSubmission,
  onOpenShortcuts,
  onToggleTab,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allCommands: CommandItem[] = [
    // Voice commands
    {
      id: "voice-component",
      label: "Synthesize React Component",
      description: "Dictate a voice command → auto-generate TSX component",
      icon: Code2, iconColor: "text-violet-400",
      shortcut: ["⌘", "G"],
      action: () => { onSynthesizePreset("Create a React component called VoiceCard with animated glow border and dark glassmorphism style"); onClose(); },
      category: "voice",
    },
    {
      id: "voice-task",
      label: "Create Sprint Task",
      description: "Add a voice-dictated task to SQLite",
      icon: CheckCircle2, iconColor: "text-emerald-400",
      action: () => { onSynthesizePreset("Add sprint task to verify Turso cloud database connection and test API endpoint latency"); onClose(); },
      category: "voice",
    },
    {
      id: "voice-api",
      label: "Generate API Route",
      description: "Dictate a Next.js API route handler",
      icon: Zap, iconColor: "text-cyan-400",
      action: () => { onSynthesizePreset("Create Next.js API route to query all flows from SQLite and return paginated JSON response"); onClose(); },
      category: "voice",
    },
    {
      id: "voice-script",
      label: "Write Demo Script",
      description: "Generate a demo video teleprompter prompt",
      icon: FileText, iconColor: "text-amber-400",
      action: () => { onSynthesizePreset("Write demo video script showing voice-driven development with Wispr Flow and Turso SQLite"); onClose(); },
      category: "voice",
    },
    // Navigation
    {
      id: "nav-flows",
      label: "View Synthesized Flows",
      description: "Switch to the Flows grid tab",
      icon: Layers, iconColor: "text-violet-400",
      shortcut: ["⌘", "1"],
      action: () => { onToggleTab("flows"); onClose(); },
      category: "navigation",
    },
    {
      id: "nav-sessions",
      label: "View Voice Log History",
      description: "Switch to the Sessions audit tab",
      icon: History, iconColor: "text-cyan-400",
      shortcut: ["⌘", "2"],
      action: () => { onToggleTab("sessions"); onClose(); },
      category: "navigation",
    },
    {
      id: "nav-teleprompter",
      label: "Open Demo Teleprompter",
      description: "View video recording script guide",
      icon: Video, iconColor: "text-pink-400",
      shortcut: ["⌘", "T"],
      action: () => { onOpenTeleprompter(); onClose(); },
      category: "navigation",
    },
    // Database
    {
      id: "db-inspect",
      label: "Inspect Database Engine",
      description: "View Turso / SQLite connection and ping latency",
      icon: Database, iconColor: "text-cyan-400",
      shortcut: ["⌘", "D"],
      action: () => { onOpenDbModal(); onClose(); },
      category: "database",
    },
    // Tools
    {
      id: "tools-export",
      label: "Export All Flows",
      description: "Download all flows as JSON or TypeScript bundle",
      icon: Download, iconColor: "text-emerald-400",
      shortcut: ["⌘", "E"],
      action: () => { onOpenExport(); onClose(); },
      category: "tools",
    },
    {
      id: "tools-submission",
      label: "Hackathon Submission Center",
      description: "Open checklist, referral link & Google Form",
      icon: Award, iconColor: "text-amber-400",
      shortcut: ["⌘", "S"],
      action: () => { onOpenSubmission(); onClose(); },
      category: "tools",
    },
    {
      id: "tools-shortcuts",
      label: "Keyboard Shortcuts Reference",
      description: "View all available keyboard shortcuts",
      icon: Keyboard, iconColor: "text-zinc-400",
      shortcut: ["⌘", "?"],
      action: () => { onOpenShortcuts(); onClose(); },
      category: "tools",
    },
    {
      id: "tools-referral",
      label: "Open Wispr Referral Link",
      description: "Mandatory hackathon referral: ref.wisprflow.ai/hhg",
      icon: ExternalLink, iconColor: "text-violet-300",
      action: () => { window.open("https://ref.wisprflow.ai/hhg", "_blank"); onClose(); },
      category: "tools",
    },
  ];

  const filtered = query.trim()
    ? allCommands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      )
    : allCommands;

  const grouped = {
    voice: filtered.filter((c) => c.category === "voice"),
    navigation: filtered.filter((c) => c.category === "navigation"),
    database: filtered.filter((c) => c.category === "database"),
    tools: filtered.filter((c) => c.category === "tools"),
  };

  const flatFiltered = [
    ...grouped.voice,
    ...grouped.navigation,
    ...grouped.database,
    ...grouped.tools,
  ];

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && flatFiltered[activeIndex]) {
        e.preventDefault();
        flatFiltered[activeIndex].action();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, activeIndex, flatFiltered, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!isOpen) return null;

  let flatIndex = 0;

  const renderGroup = (label: string, items: CommandItem[], labelColor: string) => {
    if (items.length === 0) return null;
    return (
      <div key={label}>
        <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-semibold text-zinc-500 sticky top-0 bg-[#0a0d1a]/90 backdrop-blur-sm">
          {label}
        </div>
        {items.map((cmd) => {
          const idx = flatIndex++;
          const isActive = idx === activeIndex;
          const Icon = cmd.icon;
          return (
            <button
              key={cmd.id}
              data-index={idx}
              onClick={cmd.action}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all text-left group ${
                isActive ? "bg-violet-600/20 border-l-2 border-violet-500" : "border-l-2 border-transparent hover:bg-surface-highlight/60"
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? "bg-violet-500/20" : "bg-surface-highlight"}`}>
                <Icon className={`w-3.5 h-3.5 ${cmd.iconColor ?? "text-zinc-400"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold truncate ${isActive ? "text-violet-200" : "text-zinc-200"}`}>
                  {cmd.label}
                </div>
                {cmd.description && (
                  <div className="text-[11px] text-zinc-500 truncate mt-px">{cmd.description}</div>
                )}
              </div>
              {cmd.shortcut && (
                <div className="flex items-center gap-1 shrink-0">
                  {cmd.shortcut.map((k, i) => (
                    <kbd key={i} className="px-1.5 py-0.5 text-[10px] font-mono bg-surface-highlight border border-surface-border rounded-md text-zinc-400">
                      {k}
                    </kbd>
                  ))}
                </div>
              )}
              <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-opacity ${isActive ? "opacity-100 text-violet-400" : "opacity-0"}`} />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/70 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl glass-panel rounded-2xl border border-surface-border overflow-hidden shadow-2xl glow-violet">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-border">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, actions, or voice presets..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none font-mono"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            {query && (
              <button onClick={() => setQuery("")} className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface-highlight border border-surface-border rounded-md text-zinc-500">esc</kbd>
          </div>
        </div>

        {/* Command list */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-1">
          {flatFiltered.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 font-mono">
              No commands found for "{query}"
            </div>
          ) : (
            <>
              {renderGroup("🎙️  Voice Synthesis", grouped.voice, "text-violet-400")}
              {renderGroup("📍  Navigation", grouped.navigation, "text-zinc-400")}
              {renderGroup("🗄️  Database", grouped.database, "text-cyan-400")}
              {renderGroup("🛠️  Tools", grouped.tools, "text-amber-400")}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-surface-border flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="text-[10px] bg-surface-highlight px-1 py-0.5 rounded border border-surface-border">↑↓</kbd> navigate</span>
            <span><kbd className="text-[10px] bg-surface-highlight px-1 py-0.5 rounded border border-surface-border">↵</kbd> select</span>
            <span><kbd className="text-[10px] bg-surface-highlight px-1 py-0.5 rounded border border-surface-border">esc</kbd> close</span>
          </div>
          <span className="text-violet-500">{flatFiltered.length} commands</span>
        </div>
      </div>
    </div>
  );
}
