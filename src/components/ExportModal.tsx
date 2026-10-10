"use client";

import React, { useState } from "react";
import {
  X, Download, FileJson, Code2, CheckCircle2, Loader2,
  FileText, Terminal, Github, Sparkles, Database,
} from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowCount: number;
  sessionCount: number;
}

type ExportFormat = "json" | "typescript" | "markdown";

export function ExportModal({ isOpen, onClose, flowCount, sessionCount }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);
  const [format, setFormat] = useState<ExportFormat>("json");

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/export");
      const data = await res.json();

      let content = "";
      let filename = "";
      let mimeType = "";

      if (format === "json") {
        content = JSON.stringify(data, null, 2);
        filename = `wispr-flow-export-${Date.now()}.json`;
        mimeType = "application/json";
      } else if (format === "typescript") {
        // Generate a TypeScript barrel file
        const flows = data.flows ?? [];
        const lines = [
          `// Auto-exported from Wispr Flow Studio`,
          `// Generated: ${new Date().toISOString()}`,
          `// Repo: https://github.com/dubeysanskar/flow`,
          `// Referral: https://ref.wisprflow.ai/hhg`,
          ``,
          `export interface FlowItem {`,
          `  id: string;`,
          `  title: string;`,
          `  type: "component" | "task" | "prompt" | "snippet";`,
          `  content: string;`,
          `  status: "active" | "completed";`,
          `  isStarred: boolean;`,
          `  createdAt: number;`,
          `}`,
          ``,
          `export const FLOWS: FlowItem[] = ${JSON.stringify(flows, null, 2)};`,
          ``,
          `export const VOICE_SESSIONS = ${JSON.stringify(data.sessions ?? [], null, 2)};`,
          ``,
          `export const METRICS = ${JSON.stringify(data.metrics ?? {}, null, 2)};`,
        ];
        content = lines.join("\n");
        filename = `wispr-flow-export-${Date.now()}.ts`;
        mimeType = "text/typescript";
      } else {
        // Markdown report
        const flows = data.flows ?? [];
        const metrics = data.metrics ?? {};
        const lines = [
          `# Wispr Flow Studio — Export Report`,
          ``,
          `> **Generated:** ${new Date().toLocaleString()}  `,
          `> **Repo:** [dubeysanskar/flow](https://github.com/dubeysanskar/flow)  `,
          `> **Referral:** [ref.wisprflow.ai/hhg](https://ref.wisprflow.ai/hhg)`,
          ``,
          `## 📊 Voice Dev Metrics`,
          ``,
          `| Metric | Value |`,
          `| :--- | ---: |`,
          `| Flows Created | ${flows.length} |`,
          `| Voice Dev Time | ${Math.round((metrics.voiceDevSeconds ?? 0) / 60)} minutes |`,
          `| Words Spoken | ${metrics.wordsSpoken ?? 0} |`,
          `| Commands Executed | ${metrics.commandsExecuted ?? 0} |`,
          ``,
          `## 🎙️ Voice-Generated Flows`,
          ``,
          ...flows.map((f: any) => [
            `### ${f.title}`,
            ``,
            `- **Type:** \`${f.type}\``,
            `- **Status:** ${f.status}`,
            `- **Voice Duration:** ${f.metadata?.voiceDurationSec ?? "?"}s`,
            f.metadata?.originalDictation ? `- **Dictation:** *"${f.metadata.originalDictation}"*` : "",
            ``,
            `\`\`\`${f.metadata?.language ?? "text"}`,
            f.content,
            `\`\`\``,
            ``,
          ].filter(Boolean).join("\n")),
        ];
        content = lines.join("\n");
        filename = `wispr-flow-report-${Date.now()}.md`;
        mimeType = "text/markdown";
      }

      // Trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setLastExport(filename);
    } catch (err: any) {
      alert("Export failed: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const formats: { value: ExportFormat; icon: React.FC<any>; label: string; desc: string; badge: string }[] = [
    {
      value: "json",
      icon: FileJson,
      label: "JSON Bundle",
      desc: "Full data: flows, sessions, metrics & activity",
      badge: ".json",
    },
    {
      value: "typescript",
      icon: Code2,
      label: "TypeScript Module",
      desc: "Typed exported const arrays ready to import",
      badge: ".ts",
    },
    {
      value: "markdown",
      icon: FileText,
      label: "Markdown Report",
      desc: "Human-readable development summary with code blocks",
      badge: ".md",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg glass-panel rounded-3xl border border-surface-border overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/15 border border-emerald-500/25">
              <Download className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export Voice Flows</h2>
              <p className="text-xs text-zinc-400">
                {flowCount} flows · {sessionCount} voice sessions · SQLite database
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-surface-highlight transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Format selector */}
          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-2 block">
              Export Format
            </label>
            <div className="space-y-2">
              {formats.map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFormat(f.value)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      format === f.value
                        ? "border-violet-500/50 bg-violet-600/10 shadow-sm"
                        : "border-surface-border hover:border-surface-highlight bg-surface-card/40"
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${format === f.value ? "bg-violet-500/20" : "bg-surface-highlight"}`}>
                      <Icon className={`w-4 h-4 ${format === f.value ? "text-violet-400" : "text-zinc-400"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${format === f.value ? "text-white" : "text-zinc-200"}`}>
                          {f.label}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          format === f.value ? "bg-violet-500/20 text-violet-300 border-violet-500/30" : "bg-surface-highlight text-zinc-500 border-surface-border"
                        }`}>
                          {f.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{f.desc}</p>
                    </div>
                    {format === f.value && <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* What's included */}
          <div className="p-3.5 rounded-xl bg-surface-card/60 border border-surface-border space-y-1.5">
            <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Includes</p>
            {[
              { icon: Sparkles, label: `${flowCount} synthesized voice flows` },
              { icon: Terminal, label: `${sessionCount} voice session audit logs` },
              { icon: Database, label: "Hackathon metrics & voice dev time" },
              { icon: Github, label: "Referral & repo metadata" },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                <Icon className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {lastExport && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-950/30 border border-emerald-500/20 rounded-xl px-3 py-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Downloaded: {lastExport}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex items-center justify-between gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-zinc-400 hover:text-white bg-surface-card border border-surface-border transition-all">
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-60"
          >
            {isExporting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Exporting...</>
            ) : (
              <><Download className="w-4 h-4" /> Download {format.toUpperCase()}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
