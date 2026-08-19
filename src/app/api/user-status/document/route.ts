import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import {
  getRegistrationDb,
  REGISTRATION_COLLECTION,
  STAFF_REGISTRATION_COLLECTION,
} from "@/lib/mongodb";
import { getS3Client, getBucket, isStoredPassportFile } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function collectS3Keys(doc: Record<string, unknown>) {
  const keys = new Set<string>();

  const primary = doc.passportPhoto;
  if (isStoredPassportFile(primary)) {
    keys.add(primary.s3Key);
  }

  const guest = doc.guest as Record<string, unknown> | null | undefined;
  if (guest && isStoredPassportFile(guest.passportPhoto)) {
    keys.add(guest.passportPhoto.s3Key);
  }

  return keys;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.trim().toLowerCase();
    const s3Key = searchParams.get("s3Key")?.trim();

    if (!email || !s3Key) {
      return NextResponse.json({ message: "Missing email or s3Key" }, { status: 400 });
    }

    const db = await getRegistrationDb();

    const vipRegistration = await db.collection(REGISTRATION_COLLECTION).findOne({
      email,
      formType: "vip_ticket_booking",
    });

    let allowedKeys = vipRegistration
      ? collectS3Keys(vipRegistration as Record<string, unknown>)
      : new Set<string>();

    if (!allowedKeys.size) {
      const staffRegistration = await db
        .collection(STAFF_REGISTRATION_COLLECTION)
        .findOne({ email });

      if (staffRegistration) {
        allowedKeys = collectS3Keys(staffRegistration as Record<string, unknown>);
      }
    }

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
    const contentType = object.ContentType || "application/octet-stream";

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("User status document error:", error);
    return NextResponse.json({ message: "Failed to load document" }, { status: 500 });
  }
}
