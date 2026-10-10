import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { setDbConnection, ensureDbInitialized, getDbMode } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mode, url, authToken, saveToEnv } = body;

    if (mode === "sqlite") {
      // Revert to local embedded SQLite
      setDbConnection();
      await ensureDbInitialized();

      // Optionally update .env.local
      if (saveToEnv) {
        try {
          const envPath = path.join(process.cwd(), ".env.local");
          let content = "";
          if (fs.existsSync(envPath)) {
            content = fs.readFileSync(envPath, "utf-8");
            content = content
              .replace(/TURSO_DATABASE_URL=.*/g, "TURSO_DATABASE_URL=")
              .replace(/TURSO_AUTH_TOKEN=.*/g, "TURSO_AUTH_TOKEN=");
          } else {
            content = "TURSO_DATABASE_URL=\nTURSO_AUTH_TOKEN=\n";
          }
          fs.writeFileSync(envPath, content, "utf-8");
        } catch {}
      }

      return NextResponse.json({
        success: true,
        database: getDbMode(),
        message: "Switched to local SQLite database (wispr_flow.db)",
      });
    }

    if (!url || !url.trim()) {
      return NextResponse.json(
        { success: false, error: "Turso database URL is required (e.g. libsql://your-db.turso.io)" },
        { status: 400 }
      );
    }

    const cleanUrl = url.trim();
    const cleanToken = authToken?.trim() || "";

    // Test connection first
    const startTime = Date.now();
    const testClient = createClient({
      url: cleanUrl,
      authToken: cleanToken || undefined,
    });

    // Execute ping query
    await testClient.execute("SELECT 1 as ping");
    const latencyMs = Date.now() - startTime;

    // Apply connection globally in server
    setDbConnection(cleanUrl, cleanToken);
    await ensureDbInitialized();

    // Persist to .env.local if requested or by default
    try {
      const envPath = path.join(process.cwd(), ".env.local");
      const envContent = `# Turso Cloud DB (Configured via UI)\nTURSO_DATABASE_URL=${cleanUrl}\nTURSO_AUTH_TOKEN=${cleanToken}\n`;
      fs.writeFileSync(envPath, envContent, "utf-8");
    } catch {}

    return NextResponse.json({
      success: true,
      database: getDbMode(),
      latencyMs,
      message: `Connected successfully to Turso Cloud DB (${latencyMs}ms latency)`,
    });
  } catch (err: any) {
    console.error("Database connection error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to connect to Turso database",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const startTime = Date.now();
    await ensureDbInitialized();
    const latencyMs = Date.now() - startTime;
    return NextResponse.json({
      success: true,
      database: getDbMode(),
      status: "connected",
      latencyMs,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        status: "disconnected",
      },
      { status: 500 }
    );
  }
}
