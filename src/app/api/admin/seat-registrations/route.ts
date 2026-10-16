import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import {
  getCollectionNameForSeatList,
  isAdminSeatListKey,
  mapSeatRegistrationDocument,
} from "@/lib/adminSeatRegistrations";
import { getRegistrationDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const list = searchParams.get("list")?.trim() ?? "";

    if (!isAdminSeatListKey(list)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing list parameter" },
        { status: 400 }
      );
    }

    const collectionName = getCollectionNameForSeatList(list);
    const db = await getRegistrationDb();
    const documents = await db
      .collection(collectionName)
      .find({})
      .sort({ submittedAt: -1 })
      .toArray();

    const registrations = documents.map((doc) =>
      mapSeatRegistrationDocument(doc as Record<string, unknown>, String(doc._id))
    );

    return NextResponse.json({
      success: true,
      list,
      collection: collectionName,
      registrations,
    });
  } catch (error) {
    console.error("Admin seat registrations list error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load registrations" },
      { status: 500 }
    );
  }
}
