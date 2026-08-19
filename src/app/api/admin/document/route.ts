import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getAdminSession } from "@/lib/adminAuth";
import { getRegistrationDb, REGISTRATION_COLLECTION } from "@/lib/mongodb";
import { getBucket, getS3Client, isStoredPassportFile } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function collectAdminS3Keys(doc: Record<string, unknown>) {
  const keys = new Set<string>();

  const admin = doc.adminDetails as Record<string, unknown> | undefined;
  if (admin) {
    for (const field of ["passportCopy", "visaDocument", "eTicket"]) {
      const file = admin[field];
      if (isStoredPassportFile(file)) {
        keys.add(file.s3Key);
      }
    }

    const adminGuest = admin.guest as Record<string, unknown> | undefined;
    if (adminGuest) {
      for (const field of ["passportCopy", "visaDocument", "eTicket"]) {
        const file = adminGuest[field];
        if (isStoredPassportFile(file)) {
          keys.add(file.s3Key);
        }
      }
    }
  }

  if (isStoredPassportFile(doc.passportPhoto)) {
    keys.add(doc.passportPhoto.s3Key);
  }

  const guest = doc.guest as Record<string, unknown> | undefined;
  if (guest && isStoredPassportFile(guest.passportPhoto)) {
    keys.add(guest.passportPhoto.s3Key);
  }

  return keys;
}

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim();
    const s3Key = searchParams.get("s3Key")?.trim();

    if (!id || !s3Key || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Missing id or s3Key" }, { status: 400 });
    }

    const db = await getRegistrationDb();
    const doc = await db.collection(REGISTRATION_COLLECTION).findOne({
      _id: new ObjectId(id),
      formType: "vip_ticket_booking",
    });

    if (!doc) {
      return NextResponse.json({ message: "Registration not found" }, { status: 404 });
    }

    const allowedKeys = collectAdminS3Keys(doc as Record<string, unknown>);
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
    console.error("Admin document proxy error:", error);
    return NextResponse.json({ message: "Failed to load document" }, { status: 500 });
  }
}
