import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureDbInitialized } from "@/lib/db";

export async function GET() {
  try {
    await ensureDbInitialized();
    const db = getDb();

    const res = await db.execute("SELECT * FROM voice_sessions ORDER BY created_at DESC LIMIT 50");
    const sessions = res.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      transcript: row.transcript,
      parsedIntent: row.parsed_intent,
      actionType: row.action_type,
      wordsCount: Number(row.words_count || 0),
      durationSec: Number(row.duration_sec || 0),
      createdAt: Number(row.created_at),
    }));

    return NextResponse.json({ success: true, sessions });
  } catch (err: any) {
    console.error("GET /api/sessions error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const db = getDb();
    const body = await req.json();

    const id = body.id || `sess-${Date.now()}`;
    const title = body.title || "Voice Session";
    const transcript = body.transcript || "";
    const parsedIntent = body.parsedIntent || "Voice dictation";
    const actionType = body.actionType || "command";
    const wordsCount = Number(body.wordsCount || transcript.trim().split(/\s+/).filter(Boolean).length);
    const durationSec = Number(body.durationSec || 0);
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO voice_sessions (id, title, transcript, parsed_intent, action_type, words_count, duration_sec, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, title, transcript, parsedIntent, actionType, wordsCount, durationSec, now],
    });

    // Update aggregate metrics
    await db.execute({
      sql: `UPDATE hackathon_metrics 
            SET voice_dev_seconds = voice_dev_seconds + ?, 
                words_spoken = words_spoken + ?, 
                commands_executed = commands_executed + 1,
                updated_at = ?
            WHERE id = 'current'`,
      args: [durationSec, wordsCount, now],
    });

    return NextResponse.json({
      success: true,
      session: {
        id,
        title,
        transcript,
        parsedIntent,
        actionType,
        wordsCount,
        durationSec,
        createdAt: now,
      },
    });
  } catch (err: any) {
    console.error("POST /api/sessions error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
