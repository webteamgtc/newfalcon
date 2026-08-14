import { NextResponse } from "next/server";

const BLOCKED_EMAIL_DOMAINS = [
  "suijiyou.net",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "10minutemail.com",
  "tempmail.com",
  "throwaway.email",
  "temp-mail.org",
  "mohmal.com",
  "trashmail.com",
  "maildrop.cc",
  "tempail.com",
  "getnada.com",
  "mintemail.com",
  "mytrashmail.com",
  "sharklasers.com",
  "spamgourmet.com",
  "mailnesia.com",
  "meltmail.com",
  "mailcatch.com",
  "emailondeck.com",
  "fakeinbox.com",
  "dispostable.com",
  "emailfake.com",
  "getairmail.com",
  "mailin8r.com",
  "mailme.lv",
  "tempr.email",
  "tmpmail.org",
  "mail.tm",
  "emailnator.com",
];

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { valid: false, reason: "Email is required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();
    const domain = emailLower.split("@").pop();

    // 1. Block disposable domains
    if (BLOCKED_EMAIL_DOMAINS.includes(domain)) {
      return NextResponse.json(
        { valid: false, reason: "blocked_domain" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { valid: true, reason: "valid" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { valid: false, reason: "validation_error", error: error.message },
      { status: 500 }
    );
  }
}

