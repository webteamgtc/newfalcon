import { NextResponse } from "next/server";
import { saveIbEmailAccess } from "@/lib/ibEmailStore";

export const runtime = "nodejs";

function normalizeLocale(locale: unknown) {
  const normalized =
    typeof locale === "string" ? locale.trim().toLowerCase() : "";
  if (normalized === "zh" || normalized.startsWith("zh-")) return "zh";
  return "en";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const ibId =
      typeof body.ibId === "string"
        ? body.ibId.trim()
        : typeof body.ib_id === "string"
          ? body.ib_id.trim()
          : "";
    const firstName =
      typeof body.first_name === "string"
        ? body.first_name.trim()
        : typeof body.firstName === "string"
          ? body.firstName.trim()
          : "";
    const locale = normalizeLocale(body.locale);

    const result = await saveIbEmailAccess({
      email,
      ibId,
      firstName: firstName || undefined,
      locale,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Valid email and IB ID are required." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "IB access saved successfully",
    });
  } catch (error) {
    console.error("Save IB email error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save IB access" },
      { status: 500 }
    );
  }
}
