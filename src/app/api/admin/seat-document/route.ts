import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getAdminSession } from "@/lib/adminAuth";
import { isAdminSeatListKey } from "@/lib/adminSeatRegistrations";
import {
  collectSeatRegistrationS3Keys,
  getCollectionNameForSeatList,
} from "@/lib/adminSeatRegistrations.server";
import { getRegistrationDb } from "@/lib/mongodb";
import { getBucket, getS3Client } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const list = searchParams.get("list")?.trim() ?? "";
    const id = searchParams.get("id")?.trim();
    const s3Key = searchParams.get("s3Key")?.trim();

    if (!isAdminSeatListKey(list) || !id || !s3Key || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Missing or invalid parameters" }, { status: 400 });
    }

    const collectionName = getCollectionNameForSeatList(list);
    const db = await getRegistrationDb();
    const doc = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });

    if (!doc) {
      return NextResponse.json({ message: "Registration not found" }, { status: 404 });
    }

    const allowedKeys = collectSeatRegistrationS3Keys(doc as Record<string, unknown>);
    if (!allowedKeys.has(s3Key)) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    const object = await getS3Client().send(
      new GetObjectCommand({
        Bucket: getBucket(),
        Key: s3Key,
      })
    );

    if (!object.Body) {
      return NextResponse.json({ message: "Empty document" }, { status: 404 });
    }

    const bytes = await object.Body.transformToByteArray();

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": object.ContentType || "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("Admin seat document proxy error:", error);
    return NextResponse.json({ message: "Failed to load document" }, { status: 500 });
  }
}
