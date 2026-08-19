import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import {
  mergeRegistrationWithAdminDetails,
  toListItem,
} from "@/lib/adminRegistration";
import { getRegistrationDb, REGISTRATION_COLLECTION } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const db = await getRegistrationDb();
    const registrations = await db
      .collection(REGISTRATION_COLLECTION)
      .find({ formType: "vip_ticket_booking" })
      .sort({ submittedAt: -1 })
      .toArray();

    const items = registrations.map((doc) => {
      const id = String(doc._id);
      const record = mergeRegistrationWithAdminDetails(
        doc as Record<string, unknown>,
        id
      );
      return toListItem(record);
    });

    return NextResponse.json({ success: true, registrations: items });
  } catch (error) {
    console.error("Admin registrations list error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load registrations" },
      { status: 500 }
    );
  }
}
