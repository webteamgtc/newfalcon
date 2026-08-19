import { NextResponse } from "next/server";
import {
  adminSessionCookieOptions,
  createAdminSessionToken,
  verifyAdminCredentials,
} from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!verifyAdminCredentials(email, password)) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken(email);
    const response = NextResponse.json({ success: true, email });
    response.cookies.set(adminSessionCookieOptions(token));
    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}
