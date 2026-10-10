import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureDbInitialized } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = "SELECT * FROM flows WHERE 1=1";
    const args: any[] = [];

    if (type && type !== "all") {
      query += " AND type = ?";
      args.push(type);
    }

    if (status && status !== "all") {
      query += " AND status = ?";
      args.push(status);
    }

    if (search) {
      query += " AND (title LIKE ? OR content LIKE ?)";
      args.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY is_starred DESC, created_at DESC";

    const res = await db.execute({ sql: query, args });
    const flows = res.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      type: row.type,
      content: row.content,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      status: row.status,
      isStarred: Boolean(row.is_starred),
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    }));

    return NextResponse.json({ success: true, flows });
  } catch (err: any) {
    console.error("GET /api/flows error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const db = getDb();
    const body = await req.json();

    const id = body.id || `flow-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const title = body.title?.trim() || "Untitled Voice Flow";
    const type = body.type || "snippet";
    const content = body.content || "";
    const metadata = body.metadata ? JSON.stringify(body.metadata) : null;
    const status = body.status || "active";
    const isStarred = body.isStarred ? 1 : 0;
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO flows (id, title, type, content, metadata, status, is_starred, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, title, type, content, metadata, status, isStarred, now, now],
    });

    // Update metrics
    await db.execute(`
      UPDATE hackathon_metrics 
      SET flows_created = flows_created + 1, updated_at = ${now}
      WHERE id = 'current'
    `);

    return NextResponse.json({
      success: true,
      flow: {
        id,
        title,
        type,
        content,
        metadata: body.metadata || null,
        status,
        isStarred: Boolean(isStarred),
        createdAt: now,
        updatedAt: now,
      },
    });
  } catch (err: any) {
    console.error("POST /api/flows error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
