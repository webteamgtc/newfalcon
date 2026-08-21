import { NextResponse } from "next/server";
import { verifyIbClient } from "@/lib/ibPerformanceApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, { message: string; status: number }> = {
  NOT_REGISTERED: {
    message: "This email is not registered with GTCFX.",
    status: 404,
  },
  INACTIVE: {
    message: "This account is not active. Please contact support.",
    status: 403,
  },
};

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const result = await verifyIbClient(email);

    return NextResponse.json({
      success: true,
      client: result.client,
      performance: result.performance,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const known = ERROR_MESSAGES[code];

    if (known) {
      return NextResponse.json(
        { success: false, code, message: known.message },
        { status: known.status }
      );
    }

    console.error("IB client verify error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to verify account at this time",
      },
      { status: 500 }
    );
  }
}
