import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureDbInitialized } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDbInitialized();
    const db = getDb();
    const id = params.id;
    const body = await req.json();
    const now = Date.now();

    // Check existing
    const existing = await db.execute({
      sql: "SELECT * FROM flows WHERE id = ?",
      args: [id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Flow not found" }, { status: 404 });
    }

    const row: any = existing.rows[0];
    const title = body.title !== undefined ? body.title : row.title;
    const type = body.type !== undefined ? body.type : row.type;
    const content = body.content !== undefined ? body.content : row.content;
    const metadata = body.metadata !== undefined ? JSON.stringify(body.metadata) : row.metadata;
    const status = body.status !== undefined ? body.status : row.status;
    const isStarred = body.isStarred !== undefined ? (body.isStarred ? 1 : 0) : row.is_starred;

    await db.execute({
      sql: `UPDATE flows 
            SET title = ?, type = ?, content = ?, metadata = ?, status = ?, is_starred = ?, updated_at = ?
            WHERE id = ?`,
      args: [title, type, content, metadata, status, isStarred, now, id],
    });

    return NextResponse.json({
      success: true,
      flow: {
        id,
        title,
        type,
        content,
        metadata: metadata ? JSON.parse(metadata) : null,
        status,
        isStarred: Boolean(isStarred),
        createdAt: Number(row.created_at),
        updatedAt: now,
      },
    });
  } catch (err: any) {
    console.error("PUT /api/flows/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDbInitialized();
    const db = getDb();
    const id = params.id;

    await db.execute({
      sql: "DELETE FROM flows WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/flows/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
