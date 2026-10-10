import { NextResponse } from "next/server";
import { getDb, ensureDbInitialized } from "@/lib/db";

export async function GET() {
  try {
    await ensureDbInitialized();
    const db = getDb();

    const flowsRes = await db.execute(`
      SELECT id, title, type, content, metadata, status, is_starred, created_at, updated_at
      FROM flows ORDER BY created_at ASC
    `);

    const sessionsRes = await db.execute(`
      SELECT id, title, transcript, parsed_intent, action_type, words_count, duration_sec, created_at
      FROM voice_sessions ORDER BY created_at ASC
    `);

    const metricsRes = await db.execute("SELECT * FROM hackathon_metrics WHERE id = 'current'");
    const metricsRow: any = metricsRes.rows[0] ?? {};

    const flows = flowsRes.rows.map((row: any) => {
      let meta = null;
      if (row.metadata) {
        try {
          meta = typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata;
        } catch {
          meta = null;
        }
      }
      return {
        id: row.id,
        title: row.title,
        type: row.type,
        content: row.content,
        metadata: meta,
        status: row.status,
        isStarred: Boolean(row.is_starred),
        createdAt: Number(row.created_at),
        updatedAt: Number(row.updated_at),
      };
    });

    const sessions = sessionsRes.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      transcript: row.transcript,
      parsedIntent: row.parsed_intent,
      actionType: row.action_type,
      wordsCount: Number(row.words_count ?? 0),
      durationSec: Number(row.duration_sec ?? 0),
      createdAt: Number(row.created_at),
    }));

    // Build daily activity for heatmap — aggregate by date (UTC)
    const activityMap: Record<string, { count: number; words: number; seconds: number }> = {};

    sessions.forEach((s) => {
      const date = new Date(s.createdAt).toISOString().slice(0, 10); // "YYYY-MM-DD"
      if (!activityMap[date]) activityMap[date] = { count: 0, words: 0, seconds: 0 };
      activityMap[date].count++;
      activityMap[date].words += s.wordsCount;
      activityMap[date].seconds += s.durationSec;
    });

    flows.forEach((f) => {
      const date = new Date(f.createdAt).toISOString().slice(0, 10);
      if (!activityMap[date]) activityMap[date] = { count: 0, words: 0, seconds: 0 };
      activityMap[date].count++;
    });

    const activity = Object.entries(activityMap).map(([date, data]) => ({ date, ...data }));

    const bundle = {
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
      project: "wispr-flow-studio",
      repoUrl: "https://github.com/dubeysanskar/flow",
      referralUrl: "https://ref.wisprflow.ai/hhg",
      metrics: {
        voiceDevSeconds: Number(metricsRow.voice_dev_seconds ?? 3480),
        wordsSpoken: Number(metricsRow.words_spoken ?? 840),
        commandsExecuted: Number(metricsRow.commands_executed ?? 24),
        flowsCreated: flows.length,
        sessionsLogged: sessions.length,
      },
      activity,
      flows,
      sessions,
    };

    return new Response(JSON.stringify(bundle, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="wispr-flow-export-${Date.now()}.json"`,
      },
    });
  } catch (err: any) {
    console.error("GET /api/export error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
