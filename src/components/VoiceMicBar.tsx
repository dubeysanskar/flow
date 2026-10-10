"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic, MicOff, Sparkles, Code2, CheckSquare,
  FileText, Zap, Radio, Terminal, ChevronRight, CornerDownLeft,
} from "lucide-react";
import { AudioOscilloscope } from "@/components/AudioOscilloscope";

interface VoiceMicBarProps {
  onFlowCreated: () => void;
}

const INTENT_MAP = [
  { keywords: ["component", "button", "card", "modal", "ui", "react", "interface"], label: "React TSX", color: "text-violet-400" },
  { keywords: ["task", "todo", "fix", "check", "sprint", "backlog"], label: "Sprint Task", color: "text-emerald-400" },
  { keywords: ["api", "route", "endpoint", "server", "fetch", "query"], label: "REST Route", color: "text-cyan-400" },
  { keywords: ["script", "prompt", "demo", "video", "recording"], label: "Teleprompter", color: "text-amber-400" },
];

function detectIntent(text: string) {
  const lower = text.toLowerCase();
  for (const i of INTENT_MAP) {
    if (i.keywords.some((k) => lower.includes(k))) return i;
  }
  return { label: "Code Snippet", color: "text-zinc-400" };
}

export function VoiceMicBar({ onFlowCreated }: VoiceMicBarProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [mode, setMode] = useState<"code" | "task" | "prompt" | "snippet">("code");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [lastIntent, setLastIntent] = useState<ReturnType<typeof detectIntent> | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          setLastIntent(detectIntent(currentTranscript));
        };

        recognition.onerror = () => {};
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }

    setTerminalOutput([
      "WISPR FLOW STUDIO v1.0.0 — READY",
      "▸ Local SQLite / Turso LibSQL client connected.",
      "▸ Web Audio API initialized. Awaiting input.",
    ]);
  }, []);

  const addTerminalLine = (line: string) => {
    setTerminalOutput((prev) => [...prev.slice(-30), line]);
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const startListening = () => {
    setIsListening(true);
    setDurationSec(0);
    addTerminalLine("● Mic listening — speak your command...");
    timerRef.current = setInterval(() => setDurationSec((p) => p + 1), 1000);
    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch {}
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (transcript.trim()) {
      addTerminalLine(`✦ Dictated (${durationSec}s): "${transcript.slice(0, 60)}${transcript.length > 60 ? "..." : ""}"`);
    }
  };

  const handleSynthesize = async (overrideText?: string) => {
    const textToSend = overrideText || transcript;
    if (!textToSend.trim()) return;

    stopListening();
    setIsProcessing(true);
    const intent = detectIntent(textToSend);
    setLastIntent(intent);

    addTerminalLine(`⟳ Synthesizing ${intent.label}...`);

    try {
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: textToSend,
          durationSec: durationSec > 0 ? durationSec : 18,
          mode,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const flow = data.flow;
        addTerminalLine(`✓ Stored to SQLite: "${flow.title}" (${flow.type})`);
        setTranscript("");
        setDurationSec(0);
        onFlowCreated();
      } else {
        addTerminalLine(`✕ Error: ${data.error || "Synthesis failed"}`);
      }
    } catch (err: any) {
      addTerminalLine(`✕ Network error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const presets = [
    { label: "AudioEqualizer.tsx", text: "Create a React component called AudioEqualizer with 8 pulsating frequency bars" },
    { label: "TursoMigration.ts", text: "Add task to verify Turso LibSQL cloud database tables and edge connection latency" },
    { label: "EdgeCachedAPI.ts", text: "Create Next.js API route that queries SQLite database and returns cached metrics as JSON" },
    { label: "TeleprompterScript.md", text: "Draft hackathon demo video teleprompter script explaining voice-driven development with Wispr Flow" },
  ];

  const modes: { value: typeof mode; label: string }[] = [
    { value: "code",    label: "TSX Component" },
    { value: "task",    label: "Sprint Task" },
    { value: "snippet", label: "REST Route" },
    { value: "prompt",  label: "Teleprompter" },
  ];

  return (
    <div className="w-full space-y-3">
      {/* ── Main Input Deck ── */}
      <div className="rounded-xl border border-zinc-800 bg-[#121215] p-3 sm:p-4 shadow-sm">
        {/* Top Controls: Mode & Intent */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 p-0.5 rounded-lg text-xs font-mono">
            {modes.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  mode === m.value
                    ? "bg-zinc-800 text-white font-medium"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            {lastIntent && transcript && (
              <span className={`text-[11px] ${lastIntent.color}`}>
                Target: {lastIntent.label}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-zinc-500">
              <span className={`w-1.5 h-1.5 rounded-full ${isListening ? "bg-red-400 animate-pulse" : "bg-emerald-400"}`} />
              {isListening ? `Recording (${durationSec}s)` : "Engine Standby"}
            </span>
          </div>
        </div>

        {/* Input Row */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Record Button */}
          <button
            onClick={toggleListening}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium border transition-colors shrink-0 ${
              isListening
                ? "bg-red-950/40 text-red-300 border-red-500/40"
                : "bg-zinc-900 text-zinc-200 border-zinc-700/80 hover:bg-zinc-800 hover:text-white"
            } disabled:opacity-50`}
            title={isListening ? "Stop listening" : "Click to speak with Wispr Flow"}
          >
            {isListening ? (
              <>
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <MicOff className="w-3.5 h-3.5" />
                <span className="font-mono text-xs">Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-violet-400" />
                <span className="font-mono text-xs">Record</span>
              </>
            )}
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                if (e.target.value) setLastIntent(detectIntent(e.target.value));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSynthesize();
                }
              }}
              placeholder={
                isListening
                  ? "Dictating live into Wispr Flow..."
                  : "Speak or type voice command, e.g. Create responsive pricing table component..."
              }
              className="w-full bg-zinc-950 text-zinc-100 text-xs sm:text-sm px-3.5 py-2.5 pr-20 rounded-lg border border-zinc-800 focus:outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-500 font-mono"
            />

            <button
              onClick={() => handleSynthesize()}
              disabled={isProcessing || !transcript.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              {isProcessing ? (
                <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Run</span>
                  <CornerDownLeft className="w-3 h-3 text-violet-200" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Audio Oscilloscope when recording */}
        {isListening && (
          <div className="mt-3 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 p-2">
            <AudioOscilloscope isActive={isListening} color="#a78bfa" height={40} />
          </div>
        )}

        {/* Quick Voice Presets */}
        <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center gap-2 overflow-x-auto text-[11px] font-mono text-zinc-400">
          <span className="text-zinc-500 shrink-0">Presets:</span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSynthesize(preset.text)}
              disabled={isProcessing}
              className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors shrink-0"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Compact Terminal Console ── */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 overflow-hidden font-mono text-xs">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800/80 bg-zinc-900/60 text-[11px] text-zinc-500">
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3 text-zinc-400" />
            <span className="text-zinc-400">sqlite-session-logger</span>
          </div>
          <span>@libsql/client</span>
        </div>
        <div ref={terminalRef} className="h-20 overflow-y-auto p-2.5 space-y-0.5 text-[11px] leading-relaxed">
          {terminalOutput.map((line, i) => (
            <div
              key={i}
              className={
                line.startsWith("✓") ? "text-emerald-400" :
                line.startsWith("✕") ? "text-rose-400" :
                line.startsWith("●") ? "text-amber-400" :
                line.startsWith("✦") ? "text-cyan-400" :
                "text-zinc-400"
              }
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
