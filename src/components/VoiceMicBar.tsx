"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Sparkles, Send, Volume2, Code2, CheckSquare, FileText, Zap } from "lucide-react";

interface VoiceMicBarProps {
  onFlowCreated: () => void;
}

export function VoiceMicBar({ onFlowCreated }: VoiceMicBarProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [mode, setMode] = useState<"code" | "task" | "prompt" | "snippet">("code");
  const [speechSupported, setSpeechSupported] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Speech Recognition support in browser
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
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    setIsListening(true);
    setDurationSec(0);
    timerRef.current = setInterval(() => {
      setDurationSec((prev) => prev + 1);
    }, 1000);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Could not start native recognition:", e);
      }
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Could not stop recognition:", e);
      }
    }
  };

  const handleSynthesize = async (overrideText?: string) => {
    const textToSend = overrideText || transcript;
    if (!textToSend.trim()) return;

    stopListening();
    setIsProcessing(true);

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
        setTranscript("");
        setDurationSec(0);
        onFlowCreated();
      } else {
        alert("Error creating flow: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Synthesize request error:", err);
      alert("Failed to synthesize voice command");
    } finally {
      setIsProcessing(false);
    }
  };

  const presets = [
    {
      label: "Create Audio Equalizer Component",
      icon: Code2,
      text: "Create a React component called AudioEqualizer with 8 pulsating frequency bars and neon glow",
    },
    {
      label: "Add Turso DB Migration Task",
      icon: CheckSquare,
      text: "Add task to verify Turso LibSQL cloud database tables and edge connection latency",
    },
    {
      label: "Generate Video Teleprompter Prompt",
      icon: FileText,
      text: "Draft hackathon demo video script explaining voice-driven development with Wispr Flow",
    },
    {
      label: "Dictate Vercel Edge API Route",
      icon: Zap,
      text: "Create Next.js API route that queries SQLite database and returns cached metrics",
    },
  ];

  return (
    <div className="w-full glass-panel rounded-3xl p-5 sm:p-7 border border-surface-border shadow-2xl relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-violet-600/10 blur-3xl pointer-events-none rounded-full" />

      {/* Top Banner / Mode selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-card border border-surface-border text-xs text-zinc-300">
            <Volume2 className="w-3.5 h-3.5 text-violet-400" />
            <span>Wispr Flow Dictation Terminal</span>
          </div>
          {speechSupported && (
            <span className="text-[11px] text-emerald-400 font-mono hidden sm:inline">
              ● WebSpeech Engine Ready
            </span>
          )}
        </div>

        {/* Mode pills */}
        <div className="flex items-center p-1 rounded-xl bg-surface-card border border-surface-border text-xs">
          <button
            onClick={() => setMode("code")}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === "code"
                ? "bg-violet-600 text-white font-medium shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Voice to Code
          </button>
          <button
            onClick={() => setMode("task")}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === "task"
                ? "bg-violet-600 text-white font-medium shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Sprint Task
          </button>
          <button
            onClick={() => setMode("prompt")}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === "prompt"
                ? "bg-violet-600 text-white font-medium shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Demo Prompt
          </button>
        </div>
      </div>

      {/* Main Mic & Audio Wave Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 bg-surface-card/70 border border-surface-border rounded-2xl p-4 sm:p-5 shadow-inner">
        {/* Pulsating Mic Button */}
        <div className="relative">
          {isListening && (
            <span className="absolute -inset-2 rounded-full bg-violet-500/30 animate-ping pointer-events-none" />
          )}
          <button
            onClick={toggleListening}
            className={`relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl transition-all duration-300 shadow-xl ${
              isListening
                ? "bg-rose-500 text-white shadow-rose-500/50 scale-105"
                : "bg-gradient-to-tr from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-violet-600/40 hover:scale-105"
            }`}
            title={isListening ? "Stop listening" : "Start speaking with Wispr Flow"}
          >
            {isListening ? (
              <MicOff className="w-8 h-8 animate-pulse" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* Input / Live Transcript Text Area */}
        <div className="flex-1 w-full flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="text-zinc-400 flex items-center gap-2">
              {isListening ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-rose-400 font-medium">
                    Listening via microphone ({durationSec}s)
                  </span>
                </>
              ) : (
                <span>Speak with Wispr Flow or type natural prompt:</span>
              )}
            </span>

            {/* Audio Waveform visualization */}
            <div className="flex items-end gap-1 h-5 px-2">
              {[0.3, 0.8, 0.5, 1.0, 0.6, 0.9, 0.4, 0.7].map((height, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isListening
                      ? "bg-violet-400 animate-pulse"
                      : "bg-zinc-700 opacity-40"
                  }`}
                  style={{
                    height: isListening ? `${height * 100}%` : "30%",
                    animationDelay: `${i * 120}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSynthesize();
                }
              }}
              placeholder={
                isListening
                  ? "Speaking... (words appear here in real-time)"
                  : "Dictate with Wispr Flow or type: e.g. 'Create a voice notes card with tags and timestamps'"
              }
              className="w-full bg-[#090a0f]/80 text-white text-sm sm:text-base px-4 py-3.5 pr-28 rounded-xl border border-surface-border focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-zinc-500 font-sans"
            />

            <button
              onClick={() => handleSynthesize()}
              disabled={isProcessing || !transcript.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:hover:from-violet-600 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              {isProcessing ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Synthesizing...</span>
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

      {/* Voice Prompt Presets / Inspiration */}
      <div className="mt-4 pt-4 border-t border-surface-border/60">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-violet-400" />
            Quick Wispr Flow Presets (Demonstrating Voice-Driven Dev):
          </span>
          <span className="text-[11px] text-zinc-500 hidden sm:inline">
            Click to simulate spoken prompt
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {presets.map((preset, idx) => {
            const Icon = preset.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(preset.text);
                  handleSynthesize(preset.text);
                }}
                disabled={isProcessing}
                className="text-left p-2.5 rounded-xl bg-surface-card/40 hover:bg-surface-card border border-surface-border/60 hover:border-violet-500/40 transition-all text-xs group flex items-start gap-2.5 disabled:opacity-50"
              >
                <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-300 group-hover:bg-violet-500/20 group-hover:text-white transition-colors shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-zinc-200 group-hover:text-violet-300 truncate">
                    {preset.label}
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                    "{preset.text.slice(0, 32)}..."
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
