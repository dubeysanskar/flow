"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Play, Pause, RotateCcw, Video, Mic, CheckCircle2, Copy, Check } from "lucide-react";

interface TeleprompterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_SCRIPTS = [
  {
    step: 1,
    title: "Introduction & Wispr Flow Setup",
    spoken: "Hey everyone! For this project, I used Wispr Flow to build an entire voice-driven developer workspace without typing code manually.",
    notes: "Show screen with Wispr Flow active and microphone armed.",
  },
  {
    step: 2,
    title: "Voice-driven UI Component Synthesis",
    spoken: "Wispr Flow, create a React component called AudioEqualizer with eight glowing neon violet bars that react when voice input is detected.",
    notes: "Speak naturally into microphone. Show code synthesis appearing on screen instantly.",
  },
  {
    step: 3,
    title: "Database Persistence via Turso & SQLite",
    spoken: "Now let's add a database task: Wispr Flow, log task to verify Turso LibSQL cloud connection with local SQLite fallback.",
    notes: "Demonstrate real-time SQLite record creation in the database engine.",
  },
  {
    step: 4,
    title: "Hands-Free Sprint Workflow",
    spoken: "Wispr Flow, mark task completed and generate production Vercel deployment configuration.",
    notes: "Show hands off keyboard to emphasize 100% voice-driven development.",
  },
  {
    step: 5,
    title: "Conclusion & Submission",
    spoken: "All code, logs, and sessions were created with voice using Wispr Flow, backed by Turso SQLite and deployed to Vercel.",
    notes: "Show repository link github.com/dubeysanskar/flow and wrap up.",
  },
];

export function TeleprompterModal({ isOpen, onClose }: TeleprompterModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop += speed;
        }
      }, 50);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, speed]);

  if (!isOpen) return null;

  const handleCopyPrompt = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl glass-panel rounded-3xl border border-surface-border overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Video Recording Teleprompter</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Live Script
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Step-by-step recording guide to demonstrate Wispr Flow voice development
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-surface-highlight transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Toolbar */}
        <div className="px-5 py-3 bg-[#090a0f] border-b border-surface-border flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isPlaying
                  ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/30"
                  : "bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30"
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? "Pause Scroll" : "Auto Scroll"}</span>
            </button>

            <button
              onClick={() => {
                if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
              }}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-surface-card border border-surface-border"
              title="Reset scroll to top"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span>Scroll Speed:</span>
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                  speed === s
                    ? "bg-violet-600/30 text-violet-300 border border-violet-500/40"
                    : "bg-surface-card hover:bg-surface-highlight text-zinc-400"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Script Content */}
        <div
          ref={scrollContainerRef}
          className="p-6 overflow-y-auto space-y-6 flex-1 scroll-smooth"
        >
          {DEMO_SCRIPTS.map((item, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-5 border border-surface-border hover:border-violet-500/40 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">
                  Step {item.step} • {item.title}
                </span>

                <button
                  onClick={() => handleCopyPrompt(item.spoken, idx)}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Line</span>
                    </>
                  )}
                </button>
              </div>

              {/* What to say */}
              <div className="my-3 p-3.5 rounded-xl bg-[#090a0f] border border-surface-border">
                <div className="text-[11px] uppercase tracking-wider text-violet-400 font-semibold mb-1 flex items-center gap-1.5">
                  <Mic className="w-3 h-3" />
                  What to speak into Wispr Flow:
                </div>
                <p className="text-base text-zinc-100 font-medium leading-relaxed">
                  "{item.spoken}"
                </p>
              </div>

              {/* What to show */}
              <div className="text-xs text-zinc-400 flex items-center gap-2">
                <span className="font-semibold text-zinc-300">Action on camera:</span>
                <span>{item.notes}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-card border-t border-surface-border flex items-center justify-between text-xs text-zinc-400">
          <span>Submission Deadline: October 10, 2026, 11:59 PM</span>
          <a
            href="https://forms.gle/Lv9wF8gYVHdEqfJW8"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
          >
            Open Google Submission Form →
          </a>
        </div>
      </div>
    </div>
  );
}
