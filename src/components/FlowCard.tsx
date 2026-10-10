"use client";

import React, { useState } from "react";
import {
  Code2,
  CheckSquare,
  FileText,
  Terminal,
  Star,
  Copy,
  Check,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
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

interface FlowCardProps {
  flow: FlowItem;
  onToggleStar: (id: string, currentStarred: boolean) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
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

  const getTypeIcon = () => {
    switch (flow.type) {
      case "component":
        return <Code2 className="w-4 h-4 text-violet-400" />;
      case "task":
        return <CheckSquare className="w-4 h-4 text-emerald-400" />;
      case "prompt":
        return <FileText className="w-4 h-4 text-cyan-400" />;
      default:
        return <Terminal className="w-4 h-4 text-amber-400" />;
    }
  };

  const getTypeBadgeClass = () => {
    switch (flow.type) {
      case "component":
        return "bg-violet-500/10 text-violet-300 border-violet-500/30";
      case "task":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
      case "prompt":
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
      default:
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
    }
  };

  const isCompleted = flow.status === "completed";
  const duration = flow.metadata?.voiceDurationSec || 15;
  const tags = flow.metadata?.tags || [];

  return (
    <div
      className={`glass-card rounded-2xl border transition-all duration-200 overflow-hidden group hover:border-violet-500/40 ${
        flow.isStarred ? "border-violet-500/30 shadow-lg shadow-violet-500/5" : "border-surface-border"
      } ${isCompleted ? "opacity-75" : ""}`}
    >
      {/* Top Header */}
      <div className="p-4 sm:p-5 pb-3 flex items-start justify-between gap-3 border-b border-surface-border/50">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-surface-highlight border border-surface-border shrink-0 mt-0.5">
            {getTypeIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md border ${getTypeBadgeClass()}`}
              >
                {flow.type}
              </span>
              {duration > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                  <Clock className="w-3 h-3 text-violet-400" />
                  {duration}s voice
                </span>
              )}
            </div>
            <h3
              className={`text-base font-semibold text-white mt-1 truncate ${
                isCompleted ? "line-through text-zinc-400" : ""
              }`}
              title={flow.title}
            >
              {flow.title}
            </h3>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onToggleStar(flow.id, flow.isStarred)}
            className={`p-1.5 rounded-lg border transition-all ${
              flow.isStarred
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "text-zinc-500 hover:text-zinc-300 border-transparent hover:border-surface-border"
            }`}
            title={flow.isStarred ? "Unstar" : "Star item"}
          >
            <Star className={`w-4 h-4 ${flow.isStarred ? "fill-amber-400" : ""}`} />
          </button>

          <button
            onClick={() => onToggleStatus(flow.id, flow.status)}
            className={`p-1.5 rounded-lg border transition-all ${
              isCompleted
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "text-zinc-500 hover:text-zinc-300 border-transparent hover:border-surface-border"
            }`}
            title={isCompleted ? "Mark active" : "Mark completed"}
          >
            <CheckCircle2 className={`w-4 h-4 ${isCompleted ? "fill-emerald-400/20" : ""}`} />
          </button>

          <button
            onClick={() => onDelete(flow.id)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
            title="Delete from SQLite database"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content / Code Preview */}
      <div className="p-4 sm:p-5 pt-3">
        {flow.metadata?.originalDictation && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-surface-dark border border-surface-border text-xs text-zinc-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span className="italic truncate">"{flow.metadata.originalDictation}"</span>
          </div>
        )}

        <div className="relative rounded-xl bg-[#090a0f] border border-surface-border/80 overflow-hidden font-mono text-xs">
          <div className="flex items-center justify-between px-3 py-1.5 bg-surface-card/60 border-b border-surface-border/60 text-zinc-400">
            <span className="text-[11px] font-mono lowercase">
              {flow.metadata?.language || (flow.type === "component" ? "tsx" : "txt")}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <pre
            className={`p-3.5 text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed ${
              !expanded && flow.content.split("\n").length > 7 ? "max-h-36 overflow-hidden relative" : ""
            }`}
          >
            {flow.content}
            {!expanded && flow.content.split("\n").length > 7 && (
              <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#090a0f] to-transparent pointer-events-none" />
            )}
          </pre>

          {flow.content.split("\n").length > 7 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full py-1 text-[11px] text-center bg-surface-card/40 hover:bg-surface-card text-zinc-400 hover:text-white transition-colors border-t border-surface-border/40"
            >
              {expanded ? "Show less" : "Expand full code"}
            </button>
          )}
        </div>

        {/* Tags footer */}
        {tags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-highlight text-zinc-400 border border-surface-border"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
