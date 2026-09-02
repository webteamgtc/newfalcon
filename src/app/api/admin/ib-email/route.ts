import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { listIbEmailAccess } from "@/lib/ibEmailStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const records = await listIbEmailAccess();

    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error("Admin ib-email list error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load IB email records" },
      { status: 500 }
    );
  }
}
