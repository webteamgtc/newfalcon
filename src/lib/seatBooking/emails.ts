import {
  buildGoldenFalconEmailLayout,
  sendMailgunHtmlEmail,
} from "@/app/api/otp-smtp/templates";

type Locale = "en" | "zh";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function normalizeEmailLocale(locale: unknown): Locale {
  const value = typeof locale === "string" ? locale.trim().toLowerCase() : "";
  return value === "zh" || value.startsWith("zh-") ? "zh" : "en";
}

const P = 'style="margin:0 0 20px;padding:0;"';

export async function sendSeatOtpEmail(opts: {
  to: string;
  name?: string;
  otp: string;
  locale: Locale;
}) {
  const name = escapeHtml(opts.name?.trim() || (opts.locale === "zh" ? "嘉宾" : "Guest"));
  const otp = escapeHtml(opts.otp);

  const content =
    opts.locale === "zh"
      ? `<p ${P}>尊敬的 ${name}，</p>
         <p ${P}>感谢您预订 <strong>金鹰节 2026</strong> 的席位。请使用以下验证码确认您的电子邮箱：</p>
         <p style="margin:0 0 20px;padding:0;font-size:28px;letter-spacing:8px;"><strong>${otp}</strong></p>
         <p ${P}>验证码将在 2 分钟后失效。如非本人操作，请忽略此邮件。</p>
         <p style="margin:0;padding:0;">此致敬礼，</p>
         <p style="margin:0;padding:0;"><strong>GTCFX 团队</strong></p>`
      : `<p ${P}>Dear ${name},</p>
         <p ${P}>Thank you for booking your seat at the <strong>Golden Falcon Awards 2026</strong>. Use the code below to verify your email address:</p>
         <p style="margin:0 0 20px;padding:0;font-size:28px;letter-spacing:8px;"><strong>${otp}</strong></p>
         <p ${P}>This code expires in 2 minutes. If you didn't request it, you can ignore this email.</p>
         <p style="margin:0;padding:0;">Warm regards,</p>
         <p style="margin:0;padding:0;"><strong>The GTCFX Team</strong></p>`;

  const subject =
    opts.locale === "zh"
      ? `您的金鹰节 2026 验证码：${opts.otp}`
      : `Your Golden Falcon Awards 2026 verification code: ${opts.otp}`;

  const html = buildGoldenFalconEmailLayout({
    pageTitle: subject,
    eyebrow: opts.locale === "zh" ? "席位预订" : "Seat Booking",
    contentHtml: content,
    locale: opts.locale,
  });

  const text =
    opts.locale === "zh"
      ? `您的验证码：${opts.otp}（2 分钟内有效）`
      : `Your verification code: ${opts.otp} (valid for 2 minutes)`;

  return sendMailgunHtmlEmail({ to: opts.to, subject, html, text });
}

export async function sendSeatReceivedEmail(opts: {
  to: string;
  name: string;
  categoryLabel: string;
  reference: string;
  locale: Locale;
}) {
  const name = escapeHtml(opts.name);
  const category = escapeHtml(opts.categoryLabel);
  const reference = escapeHtml(opts.reference);

  const content =
    opts.locale === "zh"
      ? `<p ${P}>尊敬的 ${name}，</p>
         <p ${P}>感谢您抽出宝贵时间。我们已收到您的 <strong>${category}</strong> 席位申请。</p>
         <p ${P}>我们的团队将仔细核对您的信息，并尽快与您联系。</p>
         <p ${P}><strong>参考编号：</strong> ${reference}</p>
         <p style="margin:0;padding:0;">此致敬礼，</p>
         <p style="margin:0;padding:0;"><strong>GTCFX 团队</strong></p>`
      : `<p ${P}>Dear ${name},</p>
         <p ${P}>Thank you for your time. We have received your <strong>${category}</strong> seat request for the Golden Falcon Awards 2026.</p>
         <p ${P}>Our team will double-check your information and get back to you soon.</p>
         <p ${P}><strong>Reference:</strong> ${reference}</p>
         <p style="margin:0;padding:0;">Warm regards,</p>
         <p style="margin:0;padding:0;"><strong>The GTCFX Team</strong></p>`;

  const subject =
    opts.locale === "zh"
      ? "我们已收到您的金鹰节 2026 席位申请"
      : "We've received your Golden Falcon Awards 2026 seat request";

  const html = buildGoldenFalconEmailLayout({
    pageTitle: subject,
    eyebrow: opts.locale === "zh" ? "申请已收到" : "Request Received",
    contentHtml: content,
    locale: opts.locale,
  });

  const text =
    opts.locale === "zh"
      ? `感谢您的时间。我们已收到您的申请，将核对信息后尽快与您联系。参考编号：${opts.reference}`
      : `Thank you for your time. We've received your information, will double-check it and get back to you soon. Reference: ${opts.reference}`;

  return sendMailgunHtmlEmail({ to: opts.to, subject, html, text });
}
