import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureDbInitialized } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const db = getDb();
    const body = await req.json();

    const transcript = body.transcript?.trim() || "";
    const durationSec = Number(body.durationSec || 15);
    const wordsCount = transcript.split(/\s+/).filter(Boolean).length;

    if (!transcript) {
      return NextResponse.json({ success: false, error: "Transcript is empty" }, { status: 400 });
    }

    // Determine type and synthesized content based on voice command analysis
    const lower = transcript.toLowerCase();
    let type: "component" | "snippet" | "task" | "prompt" = "snippet";
    let title = "Voice Created Artifact";
    let content = "";
    let language = "typescript";
    let tags = ["voice-coded", "wispr-flow"];

    if (lower.includes("component") || lower.includes("button") || lower.includes("card") || lower.includes("modal") || lower.includes("ui") || lower.includes("react")) {
      type = "component";
      title = extractTitle(transcript, "React Voice Component");
      tags.push("react", "tailwind", "ui");
      content = generateComponentCode(transcript);
    } else if (lower.includes("task") || lower.includes("todo") || lower.includes("fix") || lower.includes("check") || lower.includes("checklist")) {
      type = "task";
      title = extractTitle(transcript, "Dev Sprint Task");
      language = "markdown";
      tags.push("task", "hackathon");
      content = generateTaskContent(transcript);
    } else if (lower.includes("prompt") || lower.includes("script") || lower.includes("demo") || lower.includes("video")) {
      type = "prompt";
      title = extractTitle(transcript, "Voice Demo Script");
      language = "markdown";
      tags.push("demo", "voice-recording");
      content = generatePromptContent(transcript);
    } else {
      type = "snippet";
      title = extractTitle(transcript, "Voice Code Snippet");
      tags.push("utility", "code");
      content = generateSnippetCode(transcript);
    }

    const flowId = `flow-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const sessId = `sess-${Date.now()}`;
    const now = Date.now();

    const metadata = JSON.stringify({
      tags,
      language,
      voiceDurationSec: durationSec,
      voiceSessionId: sessId,
      originalDictation: transcript,
    });

    // Insert flow
    await db.execute({
      sql: `INSERT INTO flows (id, title, type, content, metadata, status, is_starred, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'active', 0, ?, ?)`,
      args: [flowId, title, type, content, metadata, now, now],
    });

    // Insert voice session
    await db.execute({
      sql: `INSERT INTO voice_sessions (id, title, transcript, parsed_intent, action_type, words_count, duration_sec, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [sessId, `Voice: ${title}`, transcript, `Generated ${type}`, type, wordsCount, durationSec, now],
    });

    // Update metrics
    await db.execute({
      sql: `UPDATE hackathon_metrics 
            SET voice_dev_seconds = voice_dev_seconds + ?, 
                words_spoken = words_spoken + ?, 
                commands_executed = commands_executed + 1,
                flows_created = flows_created + 1,
                updated_at = ?
            WHERE id = 'current'`,
      args: [durationSec, wordsCount, now],
    });

    return NextResponse.json({
      success: true,
      flow: {
        id: flowId,
        title,
        type,
        content,
        metadata: { tags, language, voiceDurationSec: durationSec, originalDictation: transcript },
        status: "active",
        isStarred: false,
        createdAt: now,
        updatedAt: now,
      },
      session: {
        id: sessId,
        wordsCount,
        durationSec,
      },
    });
  } catch (err: any) {
    console.error("Synthesize error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function extractTitle(text: string, fallback: string): string {
  const cleaned = text.replace(/^(create|add|generate|make|build|write|dictate)\s+/i, "");
  const words = cleaned.split(/\s+/).slice(0, 5).join(" ");
  if (!words) return fallback;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function generateComponentCode(prompt: string): string {
  const componentName = prompt.match(/(?:component|for|called)\s+([A-Za-z0-9]+)/i)?.[1] || "VoiceCard";
  const capitalized = componentName.charAt(0).toUpperCase() + componentName.slice(1);

  return `"use client";\nimport React, { useState } from "react";\n\ninterface ${capitalized}Props {\n  title?: string;\n  description?: string;\n  onAction?: () => void;\n}\n\nexport function ${capitalized}({\n  title = "${capitalized} Element",\n  description = "Voice-generated via Wispr Flow dictation",\n  onAction,\n}: ${capitalized}Props) {\n  const [active, setActive] = useState(false);\n\n  return (\n    <div className="p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-violet-500/50 transition-all duration-200 shadow-xl backdrop-blur-md">\n      <div className="flex items-center justify-between mb-3">\n        <h3 className="text-lg font-semibold text-white tracking-wide">{title}</h3>\n        <span className="px-2.5 py-1 text-xs font-mono rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">\n          Wispr Voice\n        </span>\n      </div>\n      <p className="text-sm text-zinc-400 mb-4">{description}</p>\n      <button\n        onClick={() => {\n          setActive(!active);\n          onAction?.();\n        }}\n        className="w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 active:scale-[0.98]"\n      >\n        {active ? "Activated" : "Execute Action"}\n      </button>\n    </div>\n  );\n}`;
}

function generateTaskContent(prompt: string): string {
  return `### Voice Sprint Task\n\n**Objective**: ${prompt}\n\n- [ ] Voice prompt reviewed and validated with Wispr Flow\n- [ ] Implement state management & database persistence (Turso/SQLite)\n- [ ] Run automated typecheck and unit tests\n- [ ] Verify Vercel edge runtime deployment compatibility\n\n> *Voice-dictated task logged to SQLite repository*`;
}

function generatePromptContent(prompt: string): string {
  return `### Wispr Flow Demo Video Script\n\n**Voice Prompt**: "${prompt}"\n\n1. **Screen Setup**: Start OBS or Loom with IDE and microphone display.\n2. **Voice Command**: "Wispr Flow, generate SQLite database schema with Turso client"\n3. **Live Action**: Observe transcription accuracy, speak naturally without hands on keyboard.\n4. **Verification**: Show SQLite table updated in real-time.\n5. **Submission**: Link to https://forms.gle/Lv9wF8gYVHdEqfJW8 with repo https://github.com/dubeysanskar/flow`;
}

function generateSnippetCode(prompt: string): string {
  return `// Voice-dictated utility: "${prompt}"\nimport { getDb } from "@/lib/db";\n\nexport async function executeVoiceWorkflow() {\n  const db = getDb();\n  const timestamp = Date.now();\n  \n  const result = await db.execute({\n    sql: "SELECT * FROM flows WHERE status = 'active' ORDER BY updated_at DESC",\n    args: []\n  });\n  \n  return {\n    executedAt: timestamp,\n    totalActive: result.rows.length,\n    status: "ok"\n  };\n}`;
}
