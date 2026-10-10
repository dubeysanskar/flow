"use client";

import React, { useState } from "react";
import { X, Award, ExternalLink, CheckCircle2, Copy, Check, AlertTriangle, Github, Video, Calendar } from "lucide-react";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmissionModal({ isOpen, onClose }: SubmissionModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const submissionSummary = `Wispr Flow Shortlisting Task Submission
Project: Wispr Flow Studio (Voice-Driven Dev Workspace)
GitHub Repo: https://github.com/dubeysanskar/flow
Referral Account: https://ref.wisprflow.ai/hhg
Database: Turso (LibSQL SQLite) & Embedded SQLite
Deployment: Vercel Ready (vercel.json configured)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(submissionSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl glass-panel rounded-3xl border border-surface-border overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Wispr Flow Submission Center</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  Final Task
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Checklist, links, and submission requirements
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Important Notice */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-amber-300 text-sm">Mandatory Referral Requirement</div>
              <div>
                Your Wispr Flow account MUST be created using the official referral link:{" "}
                <a
                  href="https://ref.wisprflow.ai/hhg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-bold text-white hover:text-amber-200"
                >
                  https://ref.wisprflow.ai/hhg
                </a>
                . Accounts created through any other link will not be counted.
              </div>
            </div>
          </div>

          {/* Submission Checklist */}
          <div className="glass-card rounded-2xl p-5 border border-surface-border space-y-3">
            <h3 className="text-sm font-semibold text-white">Submission Checklist</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Account registered via Wispr referral link (ref.wisprflow.ai/hhg)</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Voice-driven development project created</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SQLite & Turso database storage configured</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>vercel.json configuration attached</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Repository pushed to GitHub: github.com/dubeysanskar/flow</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Video className="w-4 h-4 text-violet-400 shrink-0" />
                <span>Demo video showing you using Wispr Flow and your voice to build it</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Deadline: October 10, 2026, 11:59 PM (Today!)</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://github.com/dubeysanskar/flow"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-surface-card hover:bg-surface-highlight border border-surface-border flex items-center justify-between text-xs text-zinc-200 transition-all group"
            >
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-white" />
                <span className="font-semibold">GitHub Repo (flow)</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
            </a>

            <a
              href="https://forms.gle/Lv9wF8gYVHdEqfJW8"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center justify-between text-xs font-semibold shadow-md transition-all group"
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-300" />
                <span>Open Google Form</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-card border-t border-surface-border flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-highlight hover:bg-surface-border text-xs font-medium text-zinc-200 border border-surface-border transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Submission Summary</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
