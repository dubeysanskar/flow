import { NextResponse } from "next/server";
import { getDb, ensureDbInitialized, getDbMode } from "@/lib/db";

export async function GET() {
  try {
    await ensureDbInitialized();
    const db = getDb();
    const dbMode = getDbMode();

    const flowsRes = await db.execute("SELECT COUNT(*) as count FROM flows");
    const starredRes = await db.execute("SELECT COUNT(*) as count FROM flows WHERE is_starred = 1");
    const completedRes = await db.execute("SELECT COUNT(*) as count FROM flows WHERE status = 'completed'");
    const metricsRes = await db.execute("SELECT * FROM hackathon_metrics WHERE id = 'current'");

    const totalFlows = Number(flowsRes.rows[0]?.count || 0);
    const starredFlows = Number(starredRes.rows[0]?.count || 0);
    const completedFlows = Number(completedRes.rows[0]?.count || 0);

    const metricsRow: any = metricsRes.rows[0] || {};
    const voiceDevSeconds = Number(metricsRow.voice_dev_seconds || 3480);
    const wordsSpoken = Number(metricsRow.words_spoken || 840);
    const commandsExecuted = Number(metricsRow.commands_executed || 24);

    return NextResponse.json({
      success: true,
      database: {
        mode: dbMode.mode,
        url: dbMode.url,
        isTurso: dbMode.mode === "turso",
        status: "healthy",
      },
      metrics: {
        totalFlows,
        starredFlows,
        completedFlows,
        voiceDevMinutes: Math.round(voiceDevSeconds / 60),
        voiceDevSeconds,
        wordsSpoken,
        commandsExecuted,
        referralUrl: process.env.NEXT_PUBLIC_WISPR_REFERRAL_URL || "https://ref.wisprflow.ai/hhg",
        submissionFormUrl: "https://forms.gle/Lv9wF8gYVHdEqfJW8",
        repoUrl: "https://github.com/dubeysanskar/flow",
      },
    });
  } catch (err: any) {
    console.error("GET /api/stats error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
