"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic, MicOff, Sparkles, Volume2, Code2, CheckSquare,
  FileText, Zap, Radio, Cpu, ChevronRight, Terminal,
} from "lucide-react";
import { AudioOscilloscope } from "@/components/AudioOscilloscope";

interface VoiceMicBarProps {
  onFlowCreated: () => void;
}

const INTENT_MAP = [
  { keywords: ["component", "button", "card", "modal", "ui", "react", "interface"], label: "→ React Component", color: "text-violet-300", bg: "bg-violet-500/15 border-violet-500/30" },
  { keywords: ["task", "todo", "fix", "check", "sprint", "backlog"], label: "→ Sprint Task", color: "text-emerald-300", bg: "bg-emerald-500/15 border-emerald-500/30" },
  { keywords: ["api", "route", "endpoint", "server", "fetch", "query"], label: "→ API Route", color: "text-cyan-300", bg: "bg-cyan-500/15 border-cyan-500/30" },
  { keywords: ["script", "prompt", "demo", "video", "recording"], label: "→ Demo Script", color: "text-amber-300", bg: "bg-amber-500/15 border-amber-500/30" },
];

function detectIntent(text: string) {
  const lower = text.toLowerCase();
  for (const i of INTENT_MAP) {
    if (i.keywords.some((k) => lower.includes(k))) return i;
  }
  return { label: "→ Code Snippet", color: "text-zinc-300", bg: "bg-zinc-500/15 border-zinc-500/30" };
}

export function VoiceMicBar({ onFlowCreated }: VoiceMicBarProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [mode, setMode] = useState<"code" | "task" | "prompt" | "snippet">("code");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [typewriterText, setTypewriterText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastIntent, setLastIntent] = useState<ReturnType<typeof detectIntent> | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll terminal
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

    // Seed terminal with boot messages
    const bootLines = [
      "WISPR FLOW STUDIO v1.0.0 — VOICE ENGINE INITIALIZING...",
      "▸ LibSQL / Turso SQLite client ready.",
      "▸ Web Speech API checked.",
      "▸ Audio context initialized.",
      "System nominal. Awaiting voice input.",
    ];
    bootLines.forEach((line, i) => {
      setTimeout(() => {
        setTerminalOutput((prev) => [...prev, line]);
      }, i * 200);
    });
  }, []);

  const addTerminalLine = (line: string) => {
    setTerminalOutput((prev) => [...prev.slice(-30), line]); // Keep last 30 lines
  };

  const startTypewriter = (text: string) => {
    setIsTyping(true);
    setTypewriterText("");
    let i = 0;
    const type = () => {
      if (i <= text.length) {
        setTypewriterText(text.slice(0, i));
        i++;
        typewriterRef.current = setTimeout(type, 12);
      } else {
        setIsTyping(false);
      }
    };
    type();
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const startListening = () => {
    setIsListening(true);
    setDurationSec(0);
    addTerminalLine("● Microphone armed — speak your command...");
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
      addTerminalLine(`✦ Captured (${durationSec}s): "${transcript.slice(0, 60)}${transcript.length > 60 ? "..." : ""}"`);
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
    addTerminalLine(`  Routing to /api/synthesize`);

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
        addTerminalLine(`✓ Persisted to SQLite: "${flow.title}"`);
        addTerminalLine(`  ID: ${flow.id} | Type: ${flow.type} | ${flow.metadata?.voiceDurationSec ?? 18}s voice`);
        addTerminalLine(`  Saved ${flow.content.split("\n").length} lines → ${flow.metadata?.language ?? "text"}`);
        startTypewriter(flow.content.slice(0, 300));
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
    {
      label: "Audio Equalizer Component",
      icon: Code2,
      badge: "TSX",
      badgeColor: "bg-violet-500/15 text-violet-300",
      text: "Create a React component called AudioEqualizer with 8 pulsating frequency bars and neon violet glow",
    },
    {
      label: "Turso DB Migration Task",
      icon: CheckSquare,
      badge: "TASK",
      badgeColor: "bg-emerald-500/15 text-emerald-300",
      text: "Add task to verify Turso LibSQL cloud database tables and edge connection latency",
    },
    {
      label: "Demo Video Script",
      icon: FileText,
      badge: "MD",
      badgeColor: "bg-amber-500/15 text-amber-300",
      text: "Draft hackathon demo video teleprompter script explaining voice-driven development with Wispr Flow",
    },
    {
      label: "Vercel Edge API Route",
      icon: Zap,
      badge: "API",
      badgeColor: "bg-cyan-500/15 text-cyan-300",
      text: "Create Next.js API route that queries SQLite database and returns cached metrics as JSON",
    },
  ];

  const modes: { value: typeof mode; label: string; desc: string }[] = [
    { value: "code",    label: "Voice → Code",  desc: "TypeScript / TSX" },
    { value: "task",    label: "Sprint Task",    desc: "Markdown task" },
    { value: "prompt",  label: "Demo Script",   desc: "Video teleprompter" },
    { value: "snippet", label: "Snippet",        desc: "Utility function" },
  ];

  return (
    <div className="w-full space-y-4">
      {/* ─────────────── MAIN MIC PANEL ─────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-surface-border glass-panel shadow-2xl">
        {/* Scan line when listening */}
        {isListening && <div className="scan-line" />}

        {/* Background glow */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isListening ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-violet-600/8 blur-3xl" />
        </div>

        <div className="relative z-10 p-5 sm:p-7">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-card border border-surface-border text-xs">
                <Radio className={`w-3.5 h-3.5 ${isListening ? "text-rose-400 animate-pulse" : "text-zinc-500"}`} />
                <span className="font-mono text-zinc-300">Wispr Flow Terminal</span>
                {speechSupported && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-emerald-400" title="Web Speech API ready" />
                )}
              </div>
              {lastIntent && transcript && (
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${lastIntent.bg} ${lastIntent.color} font-mono`}>
                  {lastIntent.label}
                </span>
              )}
            </div>

            {/* Mode Selector */}
            <div className="flex items-center p-1 gap-0.5 rounded-xl bg-surface-card border border-surface-border text-xs">
              {modes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  title={m.desc}
                  className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                    mode === m.value
                      ? "bg-violet-600 text-white shadow-sm shadow-violet-600/30"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-surface-highlight"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Mic + Oscilloscope */}
          <div className="flex flex-col md:flex-row items-stretch gap-5">
            {/* Mic Button with Rings */}
            <div className="flex flex-col items-center justify-center gap-3 py-3 md:py-0 md:pr-5 md:border-r border-surface-border">
              <div className="relative flex items-center justify-center">
                {/* Ring pulses */}
                {isListening && (
                  <>
                    <span className="mic-ring absolute w-20 h-20 rounded-full border border-violet-500/40" />
                    <span className="mic-ring absolute w-20 h-20 rounded-full border border-violet-500/30" />
                    <span className="mic-ring absolute w-20 h-20 rounded-full border border-violet-500/20" />
                  </>
                )}

                <button
                  onClick={toggleListening}
                  disabled={isProcessing}
                  className={`relative z-10 flex flex-col items-center justify-center w-20 h-20 rounded-2xl transition-all duration-300 shadow-2xl font-display text-xs font-bold tracking-wider ${
                    isListening
                      ? "bg-rose-500 text-white shadow-rose-500/50 scale-105 glow-rose"
                      : "bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-700 text-white hover:scale-105 glow-violet"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isListening ? "Stop listening" : "Start voice capture"}
                >
                  {isListening ? <MicOff className="w-8 h-8 mb-0.5" /> : <Mic className="w-8 h-8 mb-0.5" />}
                  <span className="text-[9px] opacity-80">{isListening ? "STOP" : "SPEAK"}</span>
                </button>
              </div>

              {isListening && (
                <div className="text-center">
                  <div className="font-mono text-rose-400 text-xs font-semibold animate-pulse">
                    ● REC {durationSec}s
                  </div>
                </div>
              )}
            </div>

            {/* Right: Oscilloscope + Input */}
            <div className="flex-1 flex flex-col gap-3">
              {/* Canvas Oscilloscope */}
              <div className="rounded-xl overflow-hidden bg-[#060710]/80 border border-surface-border">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-surface-border/60 bg-surface-card/40">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                    <Cpu className="w-3 h-3 text-violet-400" />
                    <span>{isListening ? "LIVE AUDIO WAVEFORM" : "IDLE · WAVEFORM STANDBY"}</span>
                  </div>
                  {isProcessing && (
                    <div className="flex items-center gap-1.5 text-[11px] text-violet-400 font-mono">
                      <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                      SYNTHESIZING
                    </div>
                  )}
                </div>
                <AudioOscilloscope
                  isActive={isListening}
                  color={isListening ? "#f87171" : "#8b5cf6"}
                  height={72}
                />
              </div>

              {/* Text input */}
              <div className="relative">
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
                      ? "Transcribing in real-time..."
                      : "Speak or type: 'Create an audio equalizer component with glowing neon bars...'"
                  }
                  className="w-full bg-[#060710] text-white text-sm px-4 py-3.5 pr-36 rounded-xl border border-surface-border focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 transition-all placeholder:text-zinc-600 font-mono"
                />

                <button
                  onClick={() => handleSynthesize()}
                  disabled={isProcessing || !transcript.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/25"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Synthesize</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="mt-5 pt-5 border-t border-surface-border/50">
            <div className="flex items-center gap-2 mb-3 text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
              <Sparkles className="w-3 h-3 text-violet-400" />
              Quick Voice Presets — click to simulate Wispr Flow dictation
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {presets.map((preset, idx) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSynthesize(preset.text)}
                    disabled={isProcessing}
                    className="text-left p-3 rounded-xl border border-surface-border/60 hover:border-violet-500/40 bg-surface-card/30 hover:bg-surface-card transition-all text-xs group flex flex-col gap-2 disabled:opacity-50 card-lift"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-300 group-hover:bg-violet-500/20 transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${preset.badgeColor}`}>
                        {preset.badge}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-100 group-hover:text-violet-200 transition-colors">
                        {preset.label}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5 truncate">
                        "{preset.text.slice(0, 36)}..."
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-violet-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-3 h-3" />
                      <span>Synthesize</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────── TERMINAL OUTPUT ─────────────── */}
      <div className="rounded-2xl border border-surface-border overflow-hidden bg-[#040509] shadow-xl">
        {/* Terminal header bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-surface-card border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/70" />
              <span className="w-3 h-3 rounded-full bg-amber-500/70" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
              <Terminal className="w-3.5 h-3.5 text-violet-400" />
              <span>wispr-flow — synthesis terminal</span>
            </div>
          </div>
          <div className="text-[11px] font-mono text-zinc-600">libsql/sqlite · turso</div>
        </div>

        {/* Terminal lines */}
        <div ref={terminalRef} className="h-28 overflow-y-auto p-3 space-y-0.5 font-mono text-[11px] leading-5">
          {terminalOutput.map((line, i) => (
            <div
              key={i}
              className={`${
                line.startsWith("✓") ? "text-emerald-400" :
                line.startsWith("✕") ? "text-rose-400" :
                line.startsWith("⟳") ? "text-violet-400" :
                line.startsWith("●") ? "text-rose-400" :
                line.startsWith("✦") ? "text-cyan-400" :
                line.startsWith("  ") ? "text-zinc-500" :
                "text-zinc-300"
              }`}
            >
              {line.startsWith("  ") ? (
                <span><span className="text-zinc-600 select-none">  │ </span>{line.trim()}</span>
              ) : (
                <span><span className="text-violet-600 select-none">~ </span>{line}</span>
              )}
            </div>
          ))}

          {/* Typewriter preview */}
          {(typewriterText || isTyping) && (
            <div className="mt-2 pt-2 border-t border-surface-border/50">
              <div className="text-[10px] text-violet-400 mb-1">▸ synthesized output preview:</div>
              <pre className={`text-emerald-300 text-[11px] whitespace-pre-wrap ${isTyping ? "typewriter-cursor" : ""}`}>
                {typewriterText}
              </pre>
            </div>
          )}

          {/* Idle cursor */}
          {!isProcessing && !isTyping && terminalOutput.length > 0 && (
            <div className="text-violet-600 font-mono">
              <span className="typewriter-cursor" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
