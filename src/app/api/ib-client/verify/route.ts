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
  IP_NOT_TRUSTED: {
    message: "Your current IP address is not trusted by the system.",
    status: 403,
  },
  VERIFY_FAILED: {
    message: "Unable to verify account at this time.",
    status: 500,
  },
};

function resolveErrorCode(error: unknown): string {
  if (!(error instanceof Error)) return "VERIFY_FAILED";

  const message = error.message;
  if (/不为系统可信任的IP|not trusted|trusted ip/i.test(message)) {
    return "IP_NOT_TRUSTED";
  }

  if (Object.hasOwn(ERROR_MESSAGES, message)) {
    return message;
  }

  return "VERIFY_FAILED";
}

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
    const code = resolveErrorCode(error);
    const known = ERROR_MESSAGES[code];

    console.error("IB client verify error:", error);

    return NextResponse.json(
      {
        success: false,
        code,
        message: known?.message ?? "Unable to verify account at this time",
      },
      { status: known?.status ?? 500 }
    );
  }
}
