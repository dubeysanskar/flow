"use client";

import React, { useState } from "react";
import {
  Code2, CheckSquare, FileText, Terminal, Star, Copy, Check,
  Trash2, CheckCircle2, Clock, Sparkles, ChevronDown, ChevronUp,
  Tag, Zap, Brain,
} from "lucide-react";

export interface FlowItem {
  id: string;
  title: string;
  type: string;
  content: string;
  metadata?: {
    tags?: string[];
    language?: string;
    voiceDurationSec?: number;
    prompt?: string;
    originalDictation?: string;
  } | null;
  status: string;
  isStarred: boolean;
  createdAt: number;
  updatedAt: number;
}

const TOKEN_PATTERNS: Array<{ regex: RegExp; cls: string }> = [
  { regex: /\b(export|import|from|function|const|let|var|return|async|await|interface|type|class|extends|implements|default|if|else|for|while|do|switch|case|break|new|typeof|instanceof|void|null|undefined|true|false)\b/g, cls: "text-violet-300 font-semibold" },
  { regex: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, cls: "text-emerald-300" },
  { regex: /\b(\d+\.?\d*)\b/g, cls: "text-amber-300" },
  { regex: /(\/\/[^\n]*)/g, cls: "text-zinc-500 italic" },
  { regex: /\b([A-Z][a-zA-Z0-9]*)\b/g, cls: "text-cyan-300" },
];

function SyntaxHighlight({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-[11.5px] font-mono leading-5">
        <tbody>
          {lines.map((line, i) => (
            <tr key={i} className="group hover:bg-white/[0.02]">
              <td className="pr-3 text-right text-zinc-600 select-none w-8 shrink-0 border-r border-zinc-800/50 align-top py-px">
                {i + 1}
              </td>
              <td className="pl-3 text-zinc-200 whitespace-pre-wrap break-all align-top py-px">
                {line}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface FlowCardProps {
  flow: FlowItem;
  onToggleStar: (id: string, current: boolean) => void;
  onToggleStatus: (id: string, current: string) => void;
  onDelete: (id: string) => void;
}

export function FlowCard({ flow, onToggleStar, onToggleStatus, onDelete }: FlowCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(flow.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCompleted = flow.status === "completed";
  const tags = flow.metadata?.tags ?? [];
  const duration = flow.metadata?.voiceDurationSec ?? 0;
  const lang = flow.metadata?.language ?? "text";

  const typeConfig: Record<string, { icon: React.FC<any>; badge: string; badgeClass: string; accentClass: string }> = {
    component: {
      icon: Code2,
      badge: "TSX",
      badgeClass: "bg-violet-500/15 text-violet-300 border-violet-500/30",
      accentClass: "border-l-violet-500",
    },
    task: {
      icon: CheckSquare,
      badge: "TASK",
      badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      accentClass: "border-l-emerald-500",
    },
    prompt: {
      icon: FileText,
      badge: "MD",
      badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      accentClass: "border-l-amber-500",
    },
    snippet: {
      icon: Terminal,
      badge: "TS",
      badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
      accentClass: "border-l-cyan-500",
    },
  };

  const cfg = typeConfig[flow.type] ?? typeConfig.snippet;
  const TypeIcon = cfg.icon;
  const lines = flow.content.split("\n").length;
  const isLong = lines > 8;

  return (
    <div
      className={`glass-card rounded-2xl border overflow-hidden card-lift transition-all duration-200 group border-l-2 ${
        flow.isStarred
          ? "border-violet-500/25 border-l-violet-500"
          : `border-surface-border hover:border-violet-500/30 ${cfg.accentClass}`
      } ${isCompleted ? "opacity-60" : ""}`}
    >
      {/* ── Header ── */}
      <div className="p-4 sm:p-5 pb-3 border-b border-surface-border/50 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-surface-highlight border border-surface-border shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
            <TypeIcon className={`w-4 h-4 ${cfg.badgeClass.split(" ")[1]}`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border font-mono ${cfg.badgeClass}`}>
                {cfg.badge}
              </span>
              {duration > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                  <Clock className="w-3 h-3 text-violet-400" />
                  {duration}s
                </span>
              )}
              {flow.metadata?.originalDictation && (
                <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                  <Brain className="w-3 h-3" />
                  voice
                </span>
              )}
            </div>

            <h3 className={`text-sm sm:text-base font-semibold mt-1 truncate ${isCompleted ? "line-through text-zinc-400" : "text-white"}`} title={flow.title}>
              {flow.title}
            </h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleStar(flow.id, flow.isStarred)}
            className={`p-1.5 rounded-lg transition-all ${
              flow.isStarred
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${flow.isStarred ? "fill-amber-400" : ""}`} />
          </button>
          <button
            onClick={() => onToggleStatus(flow.id, flow.status)}
            className={`p-1.5 rounded-lg transition-all ${
              isCompleted
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(flow.id)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Voice dictation quote ── */}
      {flow.metadata?.originalDictation && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-violet-950/30 border border-violet-800/30 flex items-start gap-2 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
          <span className="text-zinc-400 italic">"{flow.metadata.originalDictation}"</span>
        </div>
      )}

      {/* ── Code Preview ── */}
      <div className="p-4 sm:p-5 pt-3">
        <div className="rounded-xl bg-[#040509] border border-surface-border/80 overflow-hidden">
          {/* Code toolbar */}
          <div className="flex items-center justify-between px-3 py-2 bg-surface-card/50 border-b border-surface-border/60">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              </div>
              <span className="text-[11px] font-mono text-zinc-500">{lang} · {lines} lines</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white transition-colors font-mono"
            >
              {copied ? (
                <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">copied</span></>
              ) : (
                <><Copy className="w-3 h-3" /><span>copy</span></>
              )}
            </button>
          </div>

          {/* Code content */}
          <div className={`${!expanded && isLong ? "max-h-44 overflow-hidden relative" : ""}`}>
            <div className="p-3">
              <SyntaxHighlight code={expanded || !isLong ? flow.content : flow.content.split("\n").slice(0, 8).join("\n")} />
            </div>
            {!expanded && isLong && (
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#040509] to-transparent" />
            )}
          </div>

          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full py-1.5 text-[11px] flex items-center justify-center gap-1 text-zinc-500 hover:text-zinc-300 hover:bg-surface-card/30 transition-all font-mono border-t border-surface-border/40"
            >
              {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> collapse</> : <><ChevronDown className="w-3.5 h-3.5" /> show {lines - 8} more lines</>}
            </button>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            <Tag className="w-3 h-3 text-zinc-600" />
            {tags.map((tag, i) => (
              <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-highlight text-zinc-500 border border-surface-border hover:text-zinc-300 hover:border-zinc-600 transition-colors cursor-default">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
