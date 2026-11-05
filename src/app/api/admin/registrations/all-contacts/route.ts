import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { fetchAllUnifiedContactRows } from "@/lib/adminUnifiedContactsExport.server";
import {
  buildUnifiedContactsCsv,
  unifiedContactsCsvFilename,
} from "@/lib/adminUnifiedContactsExport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const rows = await fetchAllUnifiedContactRows();
    const csv = buildUnifiedContactsCsv(rows);
    const filename = unifiedContactsCsvFilename();

    return new Response("\uFEFF" + csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Admin all-contacts export error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to export registrations" },
      { status: 500 }
    );
  }
}
