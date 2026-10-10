import { createClient, Client } from "@libsql/client";

let cachedClient: Client | null = null;
let isInitialized = false;

export function getDb(): Client {
  if (cachedClient) return cachedClient;

  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (url) {
    // Turso DB Cloud connection
    cachedClient = createClient({
      url,
      authToken: authToken || undefined,
    });
  } else {
    // Local SQLite fallback file
    cachedClient = createClient({
      url: "file:wispr_flow.db",
    });
  }

  return cachedClient;
}

export function getDbMode(): { mode: "turso" | "sqlite"; url: string } {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  if (url) {
    return { mode: "turso", url: url.replace(/:[^:]*@/, ":***@") };
  }
  return { mode: "sqlite", url: "file:wispr_flow.db" };
}

export async function ensureDbInitialized(): Promise<void> {
  if (isInitialized) return;
  const db = getDb();

  // Create tables if they do not exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS flows (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      is_starred INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS voice_sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      transcript TEXT NOT NULL,
      parsed_intent TEXT NOT NULL,
      action_type TEXT NOT NULL,
      words_count INTEGER DEFAULT 0,
      duration_sec INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS hackathon_metrics (
      id TEXT PRIMARY KEY,
      voice_dev_seconds INTEGER DEFAULT 0,
      words_spoken INTEGER DEFAULT 0,
      commands_executed INTEGER DEFAULT 0,
      flows_created INTEGER DEFAULT 0,
      updated_at INTEGER NOT NULL
    )
  `);

  // Check if we need to seed initial sample data
  const countRes = await db.execute("SELECT COUNT(*) as count FROM flows");
  const row = countRes.rows[0];
  const count = Number(row?.count ?? 0);

  if (count === 0) {
    await seedInitialData(db);
  }

  isInitialized = true;
}

async function seedInitialData(db: Client): Promise<void> {
  const now = Date.now();

  const initialFlows = [
    {
      id: "flow-1",
      title: "Wispr Flow Referral & Verification",
      type: "task",
      content: "Ensure account created via mandatory referral link https://ref.wisprflow.ai/hhg before deadline.",
      metadata: JSON.stringify({
        tags: ["hackathon", "wispr-flow", "critical"],
        language: "markdown",
        voiceDurationSec: 18,
        priority: "high"
      }),
      status: "completed",
      is_starred: 1,
      created_at: now - 3600000 * 5,
      updated_at: now - 3600000 * 5,
    },
    {
      id: "flow-2",
      title: "Voice-Generated AudioWave Visualizer Component",
      type: "component",
      content: `export function VoiceVisualizer({ active }: { active: boolean }) {\n  return (\n    <div className="flex items-end gap-1 h-8">\n      {[0.4, 0.9, 0.6, 1.0, 0.7, 0.3].map((height, i) => (\n        <span \n          key={i}\n          className={\`w-1 bg-violet-400 rounded-full transition-all duration-150 \${active ? "animate-pulse" : "opacity-30"}\`}\n          style={{ height: active ? \`\${height * 100}%\` : "20%" }}\n        />\n      ))}\n    </div>\n  );\n}`,
      metadata: JSON.stringify({
        tags: ["react", "audio", "ui"],
        language: "typescript",
        voiceDurationSec: 42,
        prompt: "Create a 6-bar audio equalizer visualizer that reacts when listening is active"
      }),
      status: "active",
      is_starred: 1,
      created_at: now - 3600000 * 3,
      updated_at: now - 3600000 * 3,
    },
    {
      id: "flow-3",
      title: "Turso & LibSQL Cloud DB Schema Migrator",
      type: "snippet",
      content: `import { createClient } from "@libsql/client";\n\nexport const turso = createClient({\n  url: process.env.TURSO_DATABASE_URL || "file:wispr_flow.db",\n  authToken: process.env.TURSO_AUTH_TOKEN\n});`,
      metadata: JSON.stringify({
        tags: ["turso", "sqlite", "database"],
        language: "typescript",
        voiceDurationSec: 28,
        prompt: "Setup Turso client with fallback to local SQLite database file"
      }),
      status: "active",
      is_starred: 0,
      created_at: now - 3600000 * 2,
      updated_at: now - 3600000 * 2,
    },
    {
      id: "flow-4",
      title: "Voice Development Video Recording Script",
      type: "prompt",
      content: "Script for hackathon submission video:\n1. Show screen with Wispr Flow open & microphone armed.\n2. Dictate: 'Create a voice note to track video submission checklist'.\n3. Show instantaneous voice-to-code synthesis and Turso SQLite persistence.\n4. Highlight submission form link (https://forms.gle/Lv9wF8gYVHdEqfJW8).",
      metadata: JSON.stringify({
        tags: ["demo", "video", "wispr-flow"],
        language: "markdown",
        voiceDurationSec: 35
      }),
      status: "active",
      is_starred: 1,
      created_at: now - 3600000 * 1,
      updated_at: now - 3600000 * 1,
    }
  ];

  for (const item of initialFlows) {
    await db.execute({
      sql: `INSERT INTO flows (id, title, type, content, metadata, status, is_starred, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        item.id,
        item.title,
        item.type,
        item.content,
        item.metadata,
        item.status,
        item.is_starred,
        item.created_at,
        item.updated_at
      ]
    });
  }

  const initialSessions = [
    {
      id: "sess-1",
      title: "Voice-driven Architecture Setup",
      transcript: "Initialize Next.js project with Tailwind CSS, LibSQL client for Turso SQLite database, and Vercel deployment configuration.",
      parsed_intent: "Setup stack & dependencies",
      action_type: "command",
      words_count: 22,
      duration_sec: 14,
      created_at: now - 3600000 * 4
    },
    {
      id: "sess-2",
      title: "Voice Component Dictation",
      transcript: "Dictate real-time audio wave equalizer with animated pulse bars and neon violet theme.",
      parsed_intent: "Create VoiceVisualizer React component",
      action_type: "component",
      words_count: 16,
      duration_sec: 12,
      created_at: now - 3600000 * 2
    }
  ];

  for (const s of initialSessions) {
    await db.execute({
      sql: `INSERT INTO voice_sessions (id, title, transcript, parsed_intent, action_type, words_count, duration_sec, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [s.id, s.title, s.transcript, s.parsed_intent, s.action_type, s.words_count, s.duration_sec, s.created_at]
    });
  }

  await db.execute({
    sql: `INSERT OR REPLACE INTO hackathon_metrics (id, voice_dev_seconds, words_spoken, commands_executed, flows_created, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: ["current", 3480, 840, 24, 4, now]
  });
}
