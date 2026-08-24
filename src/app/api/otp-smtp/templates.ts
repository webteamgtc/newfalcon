import {
  MAILGUN_DOMAIN,
  MAILGUN_FROM,
  mailgunClient,
} from "@/config/nodemailer";

export type EmailLocale = "en" | "zh";

export type GoldenFalconEmailType =
  | "welcome_otp"
  | "registration_started"
  | "invitation_earned"
  | "travel_confirmed";

export type EmailTemplateVars = {
  firstName?: string;
  otp?: string;
  ibId?: string;
  termsLink?: string;
  registrationLink?: string;
  statusSiteUrl?: string;
  bookingLink?: string;
  locale?: string;
};

const EMAIL_LOGO_URL =
  "https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/email-test.png";

const EMAIL_BANNER_URL =
  "https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/email/email-new.jpg";

const DEFAULT_TERMS_LINK = "https://www.goldenfalcon.com/policy";
const DEFAULT_STATUS_SITE = "https://www.goldenfalcon.com";
const ZH_EVENT_NAME = "金鹰节 2026";

function normalizeLocale(locale?: string): EmailLocale {
  const normalized = locale?.trim().toLowerCase() ?? "";
  if (normalized === "zh" || normalized.startsWith("zh-")) return "zh";
  return "en";
}

function resolveName(name: string | undefined, locale: EmailLocale) {
  const trimmed = name?.trim();
  if (trimmed) return trimmed;
  return locale === "zh" ? "合作伙伴" : "Partner";
}

function buildHeroTitle(locale: EmailLocale) {
  if (locale === "zh") {
    return `
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr>
        <td align="left" style="padding:0;font-family:Georgia,'Times New Roman',serif;font-size:67px;line-height:58px;font-weight:400;letter-spacing:-2px;color:#342412;">
          金鹰节
        </td>
      </tr>
      <tr>
        <td align="left" style="padding:0 0 0 58px;font-family:Georgia,'Times New Roman',serif;font-size:67px;line-height:58px;font-weight:400;letter-spacing:-2px;color:#342412;">
          2026
        </td>
      </tr>
    </table>`;
  }

  return `
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr>
        <td align="left" style="padding:0;font-family:Georgia,'Times New Roman',serif;font-size:67px;line-height:58px;font-weight:400;letter-spacing:-2px;color:#342412;">
          GOLDEN
        </td>
      </tr>
      <tr>
        <td align="left" style="padding:0 0 0 58px;font-family:Georgia,'Times New Roman',serif;font-size:67px;line-height:58px;font-weight:400;letter-spacing:-2px;color:#342412;">
          FALCON
        </td>
      </tr>
      <tr>
        <td align="left" style="padding:0;">
          <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td valign="bottom" style="padding:0;font-family:Georgia,'Times New Roman',serif;font-size:67px;line-height:58px;font-weight:400;letter-spacing:-2px;color:#342412;">
                NIGHT
              </td>
              <td valign="bottom" style="padding:0 0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:56px;line-height:56px;font-weight:300;letter-spacing:-2px;color:#342412;">
                2026
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

function buildEmailFooter(locale: EmailLocale) {
  if (locale === "zh") {
    return `
    <tr>
      <td align="center" style="padding:0 40px 35px 40px;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;background-color:rgba(255,255,255,0.72);border:1px solid #ead8ba;border-radius:12px;">
          <tr>
            <td align="left" style="padding:18px 22px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;font-weight:400;color:#6f6253;">
              <p style="margin:0 0 8px 0;padding:0;">
                <strong style="font-weight:700;color:#4b3a28;">GTCFX</strong>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                网站：
                <a href="https://www.gtcfx.com" target="_blank" style="color:#6f6253;text-decoration:underline;">www.gtcfx.com</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                邮箱：
                <a href="mailto:support@gtcfx.com" style="color:#6f6253;text-decoration:underline;">support@gtcfx.com</a>
              </p>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;border-top:1px solid #dfcfb6;">
                <tr>
                  <td style="padding:10px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;color:#6f6253;">
                    <p style="margin:0 0 8px 0;padding:0;">
                      <strong style="font-weight:700;color:#4b3a28;">免责声明：</strong>
                      本邮件所含信息仅供一般参考，不构成个人财务建议。请在做出任何财务决定前，确认相关信息是否适合您的财务目标、状况及需求。
                    </p>
                    <p style="margin:0;padding:0;">
                      <strong style="font-weight:700;color:#4b3a28;">重要提示：</strong>
                      GTCFX 的产品和服务不向受限国家或地区的居民提供，亦不在当地法律或法规禁止分销或使用的司法管辖区提供。
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
  }

  return `
    <tr>
      <td align="center" style="padding:0 40px 35px 40px;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;background-color:rgba(255,255,255,0.72);border:1px solid #ead8ba;border-radius:12px;">
          <tr>
            <td align="left" style="padding:18px 22px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;font-weight:400;color:#6f6253;">
              <p style="margin:0 0 8px 0;padding:0;">
                <strong style="font-weight:700;color:#4b3a28;">GTCFX</strong>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                Website:
                <a href="https://www.gtcfx.com" target="_blank" style="color:#6f6253;text-decoration:underline;">www.gtcfx.com</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                Email:
                <a href="mailto:support@gtcfx.com" style="color:#6f6253;text-decoration:underline;">support@gtcfx.com</a>
              </p>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;border-top:1px solid #dfcfb6;">
                <tr>
                  <td style="padding:10px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;color:#6f6253;">
                    <p style="margin:0 0 8px 0;padding:0;">
                      <strong style="font-weight:700;color:#4b3a28;">Disclaimer:</strong>
                      The information contained in this email is provided for general informational purposes only and does not constitute personal financial advice. Please consider whether the information is appropriate to your financial objectives, circumstances and needs before making any financial decision.
                    </p>
                    <p style="margin:0;padding:0;">
                      <strong style="font-weight:700;color:#4b3a28;">Important Notice:</strong>
                      GTCFX products and services are not available to residents of restricted countries or jurisdictions where such distribution or use would be contrary to local laws or regulations.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function buildContentCard(contentHtml: string) {
  return `
    <tr>
      <td align="left" style="padding:0 40px 30px 40px;">
        <table role="presentation" width="455" border="0" cellspacing="0" cellpadding="0" style="width:455px;max-width:455px;border-collapse:separate;background-color:#fff8ec;border:1px solid #ead8ba;border-radius:15px;">
          <tr>
            <td style="padding:20px 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:18px;font-weight:400;color:#3b2c1c;">
              ${contentHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

/** Shared Golden Falcon email shell — background hero, logo, title, content slot, footer. */
export function buildGoldenFalconEmailLayout({
  pageTitle,
  eyebrow,
  contentHtml,
  locale = "en",
}: {
  pageTitle: string;
  eyebrow: string;
  contentHtml: string;
  locale?: EmailLocale;
}) {
  const lang = normalizeLocale(locale);

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${pageTitle}</title>
</head>
<body style="margin:0;padding:0;width:100%;background-color:#292929;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;margin:0;padding:0;border-collapse:collapse;background-color:#292929;">
    <tr>
      <td align="center" style="margin:0;padding:0;">
        <table role="presentation" width="700" border="0" cellspacing="0" cellpadding="0" style="width:700px;max-width:700px;margin:0 auto;border-collapse:collapse;background-color:#f5ead7;">
          <tr>
            <td valign="top" background="${EMAIL_BANNER_URL}" style="margin:0;padding:0;background-color:#f5ead7;background-image:url('${EMAIL_BANNER_URL}');background-position:center top;background-repeat:no-repeat;background-size:cover;">
              <!--[if gte mso 9]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:700px;">
                <v:fill type="frame" src="${EMAIL_BANNER_URL}" color="#f5ead7" />
                <v:textbox inset="0,0,0,0">
              <![endif]-->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
                <tr>
                  <td align="left" style="padding:60px 58px 0 58px;">
                    <img src="${EMAIL_LOGO_URL}" width="160" alt="GTC Trusted Regulated Global" style="display:block;width:160px;max-width:160px;height:auto;margin:0;padding:0;border:0;outline:none;text-decoration:none;">
                  </td>
                </tr>
                <tr>
                  <td height="30" style="height:30px;padding:0;font-size:0;line-height:30px;">&nbsp;</td>
                </tr>
                <tr>
                  <td align="left" style="padding:0 58px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;font-weight:400;letter-spacing:8px;color:#746a5c;text-transform:uppercase;">
                    ${eyebrow}
                  </td>
                </tr>
                <tr>
                  <td align="left" style="padding:8px 58px 0 58px;">
                    ${buildHeroTitle(lang)}
                  </td>
                </tr>
                <tr>
                  <td height="24" style="height:24px;padding:0;font-size:0;line-height:24px;">&nbsp;</td>
                </tr>
                ${buildContentCard(contentHtml)}
                ${buildEmailFooter(lang)}
              </table>
              <!--[if gte mso 9]>
                </v:textbox>
              </v:rect>
              <![endif]-->
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildWelcomeOtpBody(vars: EmailTemplateVars, locale: EmailLocale) {
  const name = resolveName(vars.firstName, locale);
  const otp = vars.otp || "XXXXX";
  const ibId = vars.ibId || "XXXXX";

  if (locale === "zh") {
    return `
    <p style="margin:0 0 20px;padding:0;">尊敬的 ${name}，</p>
    <p style="margin:0 0 20px;padding:0;">
      欢迎加入 <strong style="font-weight:700;">${ZH_EVENT_NAME}。</strong>
    </p>
    <p style="margin:0 0 20px;padding:0;">
      我们很高兴您加入 GTCFX 专属之旅。${ZH_EVENT_NAME} 是我们特别打造的盛典，旨在表彰并感谢全球 IB 合作伙伴的卓越贡献。我们期待与您携手，共创难忘的体验。
    </p>
    <p style="margin:0 0 20px;padding:0;">
      请查收以下个人信息以开始注册：
    </p>
    <p style="margin:0 0 20px;padding:0;"><strong style="font-weight:700;">OTP：</strong> ${otp}</p>
    <p style="margin:0 0 20px;padding:0;"><strong style="font-weight:700;">IB ID / 推荐码：</strong> ${ibId}</p>
    <p style="margin:0 0 20px;padding:0;">
      请妥善保管这些信息，用于完成活动注册。您的 ${ZH_EVENT_NAME} 之旅由此开启。
    </p>
    <p style="margin:0 0 20px;padding:0;">
      我们非常期待在迪拜与您共同庆祝这一特殊时刻。
    </p>
    <p style="margin:0;padding:0;">此致敬礼，</p>
    <p style="margin:0;padding:0;"><strong style="font-weight:700;">GTCFX 团队</strong></p>`;
  }

  return `
    <p style="margin:0 0 20px;padding:0;">Dear ${name},</p>
    <p style="margin:0 0 20px;padding:0;">
      Welcome to <strong style="font-weight:700;">金鹰节 2026.</strong>
    </p>
    <p style="margin:0 0 20px;padding:0;">
      We are delighted to have you join this exclusive journey with GTCFX. To begin your registration, please find your personal information below:
    </p>
    <p style="margin:0 0 20px;padding:0;"><strong style="font-weight:700;">OTP:</strong> ${otp}</p>
    <p style="margin:0 0 20px;padding:0;"><strong style="font-weight:700;">IB ID / Referral Code:</strong> ${ibId}</p>
    <p style="margin:0 0 20px;padding:0;">
      Please keep these details safe and use them to complete your event registration.
    </p>
    <p style="margin:0;padding:0;">Warm regards,</p>
    <p style="margin:0;padding:0;"><strong style="font-weight:700;">The GTCFX Team</strong></p>`;
}

function buildRegistrationStartedBody(vars: EmailTemplateVars, locale: EmailLocale) {
  const name = resolveName(vars.firstName, locale);
  const termsLink = vars.termsLink || DEFAULT_TERMS_LINK;

  if (locale === "zh") {
    return `
    <p style="margin:0 0 20px;padding:0;">尊敬的 ${name}，</p>
    <p style="margin:0 0 20px;padding:0;">
      感谢您加入 <strong style="font-weight:700;">${ZH_EVENT_NAME}。</strong>
    </p>
    <p style="margin:0 0 20px;padding:0;">
      您的活动注册流程已开始。请查阅所需目标及条款与条件，以继续您的资格认证。
    </p>
    <p style="margin:0 0 20px;padding:0;">
      <strong style="font-weight:700;">条款与条件：</strong>
      请点击 <a href="${termsLink}" target="_blank" style="color:#3b2c1c;font-weight:700;text-decoration:underline;">此处</a> 阅读条款与条件。
    </p>
    <p style="margin:0 0 20px;padding:0;">
      我们期待与您及全球 GTCFX 合作伙伴共同庆祝这一特殊时刻。
    </p>
    <p style="margin:0;padding:0;">此致敬礼，</p>
    <p style="margin:0;padding:0;"><strong style="font-weight:700;">GTCFX 团队</strong></p>`;
  }

  return `
    <p style="margin:0 0 20px;padding:0;">Dear ${name},</p>
    <p style="margin:0 0 20px;padding:0;">
      Thank you for joining <strong style="font-weight:700;">金鹰节 2026.</strong>
    </p>
    <p style="margin:0 0 20px;padding:0;">
      Your event registration journey has started. Please review the required target and Terms &amp; Conditions to continue your qualification.
    </p>
    <p style="margin:0 0 20px;padding:0;">
      <strong style="font-weight:700;">Terms &amp; Conditions:</strong>
      Please click <a href="${termsLink}" target="_blank" style="color:#3b2c1c;font-weight:700;text-decoration:underline;">here</a> to read the terms and conditions.
    </p>
    <p style="margin:0 0 20px;padding:0;">
      We look forward to celebrating this special occasion with you and GTCFX partners from around the world.
    </p>
    <p style="margin:0;padding:0;">Warm regards,</p>
    <p style="margin:0;padding:0;"><strong style="font-weight:700;">The GTCFX Team</strong></p>`;
}

function buildInvitationEarnedBody(vars: EmailTemplateVars, locale: EmailLocale) {
  const name = resolveName(vars.firstName, locale);
  const registrationLink = vars.registrationLink || DEFAULT_STATUS_SITE;
  const statusSiteUrl = vars.statusSiteUrl || DEFAULT_STATUS_SITE;

  if (locale === "zh") {
    return `
    <p style="margin:0 0 20px;padding:0;">尊敬的 ${name}，</p>
    <p style="margin:0 0 20px;padding:0;"><strong style="font-weight:700;">恭喜！</strong></p>
    <p style="margin:0 0 20px;padding:0;">
      您已成功完成所需目标，获得
      <strong style="font-weight:700;">${ZH_EVENT_NAME}</strong> 专属邀请。
    </p>
    <p style="margin:0 0 20px;padding:0;">请完善您的个人及出行信息：</p>
    <p style="margin:0 0 6px;padding:0;"><strong style="font-weight:700;">注册链接：</strong></p>
    <p style="margin:0 0 20px;padding:0;">
      <a href="${registrationLink}" target="_blank" style="color:#3b2c1c;font-weight:700;text-decoration:underline;">完成注册</a>
    </p>
    <p style="margin:0 0 8px;padding:0;">我们的团队将为您安排：</p>
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 20px 0;">
      <tr><td valign="top" style="padding:0 8px 5px 0;font-size:14px;line-height:18px;color:#3b2c1c;">&bull;</td><td style="padding:0 0 5px 0;font-size:14px;line-height:18px;color:#3b2c1c;">机票</td></tr>
      <tr><td valign="top" style="padding:0 8px 5px 0;font-size:14px;line-height:18px;color:#3b2c1c;">&bull;</td><td style="padding:0 0 5px 0;font-size:14px;line-height:18px;color:#3b2c1c;">酒店住宿</td></tr>
      <tr><td valign="top" style="padding:0 8px 0 0;font-size:14px;line-height:18px;color:#3b2c1c;">&bull;</td><td style="padding:0;font-size:14px;line-height:18px;color:#3b2c1c;">活动交付详情</td></tr>
    </table>
    <p style="margin:0 0 6px;padding:0;">您可随时查看最新进展：</p>
    <p style="margin:0 0 20px;padding:0;">
      <a href="${statusSiteUrl}" target="_blank" style="color:#3b2c1c;font-weight:700;text-decoration:underline;">${statusSiteUrl}</a>
    </p>
    <p style="margin:0 0 20px;padding:0;">我们期待在迪拜欢迎您。</p>
    <p style="margin:0;padding:0;">此致敬礼，</p>
    <p style="margin:0;padding:0;"><strong style="font-weight:700;">GTCFX 团队</strong></p>`;
  }

  return `
    <p style="margin:0 0 20px;padding:0;">Dear ${name},</p>
    <p style="margin:0 0 20px;padding:0;"><strong style="font-weight:700;">Congratulations!</strong></p>
    <p style="margin:0 0 20px;padding:0;">
      You have successfully completed the required target and earned your exclusive invitation to
      <strong style="font-weight:700;">金鹰节 2026.</strong>
    </p>
    <p style="margin:0 0 20px;padding:0;">Please complete your personal and travel information below:</p>
    <p style="margin:0 0 6px;padding:0;"><strong style="font-weight:700;">Registration Link:</strong></p>
    <p style="margin:0 0 20px;padding:0;">
      <a href="${registrationLink}" target="_blank" style="color:#3b2c1c;font-weight:700;text-decoration:underline;">Complete Your Registration</a>
    </p>
    <p style="margin:0 0 8px;padding:0;">Our team will arrange your:</p>
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 20px 0;">
      <tr><td valign="top" style="padding:0 8px 5px 0;font-size:14px;line-height:18px;color:#3b2c1c;">&bull;</td><td style="padding:0 0 5px 0;font-size:14px;line-height:18px;color:#3b2c1c;">Flight ticket</td></tr>
      <tr><td valign="top" style="padding:0 8px 5px 0;font-size:14px;line-height:18px;color:#3b2c1c;">&bull;</td><td style="padding:0 0 5px 0;font-size:14px;line-height:18px;color:#3b2c1c;">Hotel accommodation</td></tr>
      <tr><td valign="top" style="padding:0 8px 0 0;font-size:14px;line-height:18px;color:#3b2c1c;">&bull;</td><td style="padding:0;font-size:14px;line-height:18px;color:#3b2c1c;">Event delivery details</td></tr>
    </table>
    <p style="margin:0 0 6px;padding:0;">You can check your latest updates anytime:</p>
    <p style="margin:0 0 20px;padding:0;">
      <a href="${statusSiteUrl}" target="_blank" style="color:#3b2c1c;font-weight:700;text-decoration:underline;">${statusSiteUrl}</a>
    </p>
    <p style="margin:0 0 20px;padding:0;">We look forward to welcoming you in Dubai.</p>
    <p style="margin:0;padding:0;">Warm regards,</p>
    <p style="margin:0;padding:0;"><strong style="font-weight:700;">The GTCFX Team</strong></p>`;
}

function buildTravelConfirmedBody(vars: EmailTemplateVars, locale: EmailLocale) {
  const name = resolveName(vars.firstName, locale);
  const bookingLink =
    vars.bookingLink || vars.statusSiteUrl || DEFAULT_STATUS_SITE;

  if (locale === "zh") {
    return `
    <p style="margin:0 0 20px;padding:0;">尊敬的 ${name}，</p>
    <p style="margin:0 0 20px;padding:0;"><strong style="font-weight:700;">欢迎抵达迪拜！</strong></p>
    <p style="margin:0 0 20px;padding:0;">
      您的 ${ZH_EVENT_NAME} 行程安排已完成。
    </p>
    <p style="margin:0 0 20px;padding:0;">
      您的航班、酒店及活动信息现已可查：
    </p>
    <p style="margin:0 0 20px;padding:0;">
      <strong style="font-weight:700;">查看预订详情：</strong>
      <a href="${bookingLink}" target="_blank" style="color:#3b2c1c;font-weight:700;text-decoration:underline;">点击此处</a>
    </p>
    <p style="margin:0 0 20px;padding:0;">
      我们期待为您打造难忘的体验。
    </p>
    <p style="margin:0 0 20px;padding:0;">
      期待在 <strong style="font-weight:700;">${ZH_EVENT_NAME}</strong> 与您相见。
    </p>
    <p style="margin:0;padding:0;">此致敬礼，</p>
    <p style="margin:0;padding:0;"><strong style="font-weight:700;">GTCFX 团队</strong></p>`;
  }

  return `
    <p style="margin:0 0 20px;padding:0;">Dear ${name},</p>
    <p style="margin:0 0 20px;padding:0;"><strong style="font-weight:700;">Welcome to Dubai!</strong></p>
    <p style="margin:0 0 20px;padding:0;">
      Your 金鹰节 2026 travel arrangements have been completed.
    </p>
    <p style="margin:0 0 20px;padding:0;">
      Your flight, hotel, and event information are now available:
    </p>
    <p style="margin:0 0 20px;padding:0;">
      <strong style="font-weight:700;">View Your Booking Details:</strong>
      <a href="${bookingLink}" target="_blank" style="color:#3b2c1c;font-weight:700;text-decoration:underline;">Click here</a>
    </p>
    <p style="margin:0 0 20px;padding:0;">
      We are excited to welcome you and create an unforgettable experience together.
    </p>
    <p style="margin:0 0 20px;padding:0;">
      See you soon at <strong style="font-weight:700;">金鹰节 2026.</strong>
    </p>
    <p style="margin:0;padding:0;">Warm regards,</p>
    <p style="margin:0;padding:0;"><strong style="font-weight:700;">The GTCFX Team</strong></p>`;
}

const EMAIL_META: Record<
  EmailLocale,
  Record<
    GoldenFalconEmailType,
    { subject: string; pageTitle: string; eyebrow: string; plainText: (vars: EmailTemplateVars) => string }
  >
> = {
  en: {
    welcome_otp: {
      subject: "Welcome to 金鹰节 2026 - Your OTP & IB Details",
      pageTitle: "金鹰节 2026 - Your OTP & IB Details",
      eyebrow: "YOU ARE INVITED",
      plainText: ({ otp = "XXXXX", ibId = "XXXXX" }) =>
        `Welcome to 金鹰节 2026. OTP: ${otp}. IB ID / Referral Code: ${ibId}.`,
    },
    registration_started: {
      subject: "Thank You for Joining 金鹰节 2026",
      pageTitle: "金鹰节 2026 - Registration Started",
      eyebrow: "REGISTRATION STARTED",
      plainText: () =>
        "Thank you for joining 金鹰节 2026. Your registration journey has started.",
    },
    invitation_earned: {
      subject: "Congratulations! Your 金鹰节 2026 Invitation Is Ready",
      pageTitle: "金鹰节 2026 - Invitation Earned",
      eyebrow: "YOU ARE INVITED",
      plainText: ({ registrationLink = DEFAULT_STATUS_SITE }) =>
        `Congratulations! Complete your registration: ${registrationLink}`,
    },
    travel_confirmed: {
      subject: "Welcome to Dubai – Your 金鹰节 2026 Details",
      pageTitle: "金鹰节 2026 - Travel Confirmed",
      eyebrow: "YOU ARE INVITED",
      plainText: ({ bookingLink, statusSiteUrl }) => {
        const link = bookingLink || statusSiteUrl || DEFAULT_STATUS_SITE;
        return `Welcome to Dubai! Your travel arrangements are complete. View your booking details: ${link}`;
      },
    },
  },
  zh: {
    welcome_otp: {
      subject: `欢迎加入${ZH_EVENT_NAME} – 您的 OTP 与 IB 详情`,
      pageTitle: `${ZH_EVENT_NAME} - OTP 和 IB 详情`,
      eyebrow: "诚挚邀请",
      plainText: ({ otp = "XXXXX", ibId = "XXXXX" }) =>
        `欢迎加入${ZH_EVENT_NAME}。OTP：${otp}。IB ID / 推荐码：${ibId}。`,
    },
    registration_started: {
      subject: `感谢您加入${ZH_EVENT_NAME} – 注册已开始`,
      pageTitle: `${ZH_EVENT_NAME} - 注册已开始`,
      eyebrow: "注册已开始",
      plainText: () => `感谢您加入${ZH_EVENT_NAME}，您的注册流程已开始。`,
    },
    invitation_earned: {
      subject: `恭喜 – 您的${ZH_EVENT_NAME} 专属邀请已准备好`,
      pageTitle: `${ZH_EVENT_NAME} - 邀请已达成`,
      eyebrow: "诚挚邀请",
      plainText: ({ registrationLink = DEFAULT_STATUS_SITE }) =>
        `恭喜！请完成${ZH_EVENT_NAME} 注册：${registrationLink}`,
    },
    travel_confirmed: {
      subject: `欢迎抵达迪拜 – 您的${ZH_EVENT_NAME} 行程已确认`,
      pageTitle: `${ZH_EVENT_NAME} - 行程已确认`,
      eyebrow: "诚挚邀请",
      plainText: ({ bookingLink, statusSiteUrl }) => {
        const link = bookingLink || statusSiteUrl || DEFAULT_STATUS_SITE;
        return `欢迎抵达迪拜！您的${ZH_EVENT_NAME} 行程安排已完成。查看预订详情：${link}`;
      },
    },
  },
};

function getMeta(type: GoldenFalconEmailType, locale?: string) {
  return EMAIL_META[normalizeLocale(locale)][type];
}

function buildBodyHtml(
  type: GoldenFalconEmailType,
  vars: EmailTemplateVars,
  locale: EmailLocale
) {
  switch (type) {
    case "welcome_otp":
      return buildWelcomeOtpBody(vars, locale);
    case "registration_started":
      return buildRegistrationStartedBody(vars, locale);
    case "invitation_earned":
      return buildInvitationEarnedBody(vars, locale);
    case "travel_confirmed":
      return buildTravelConfirmedBody(vars, locale);
    default:
      return buildWelcomeOtpBody(vars, locale);
  }
}

export function buildGoldenFalconEmailHtml(
  type: GoldenFalconEmailType,
  locale: string | undefined,
  vars: EmailTemplateVars = {}
) {
  const lang = normalizeLocale(locale);
  const meta = getMeta(type, lang);

  return buildGoldenFalconEmailLayout({
    pageTitle: meta.pageTitle,
    eyebrow: meta.eyebrow,
    contentHtml: buildBodyHtml(type, vars, lang),
    locale: lang,
  });
}

export function buildWelcomeOtpEmailHtml(vars: EmailTemplateVars & { locale?: string }) {
  const { locale, ...rest } = vars;
  return buildGoldenFalconEmailHtml("welcome_otp", locale, rest);
}

/** Admin travel-confirmed email (Email 4). */
export function buildAdminEmailHtml(vars: EmailTemplateVars & { locale?: string }) {
  const { locale, ...rest } = vars;
  return buildGoldenFalconEmailHtml("travel_confirmed", locale, rest);
}

export function getAdminEmailSubject(locale?: string) {
  return getGoldenFalconEmailSubject("travel_confirmed", locale);
}

export function getAdminEmailPlainText(
  vars: EmailTemplateVars = {},
  locale?: string
) {
  return getGoldenFalconEmailPlainText("travel_confirmed", locale, vars);
}

export function getGoldenFalconEmailSubject(
  type: GoldenFalconEmailType,
  locale?: string
) {
  return getMeta(type, locale).subject;
}

export function getWelcomeOtpEmailSubject(locale?: string) {
  return getGoldenFalconEmailSubject("welcome_otp", locale);
}

export function getGoldenFalconEmailPlainText(
  type: GoldenFalconEmailType,
  locale: string | undefined,
  vars: EmailTemplateVars = {}
) {
  return getMeta(type, locale).plainText(vars);
}

export function getWelcomeOtpEmailPlainText(
  otp: string,
  ibId: string,
  locale?: string
) {
  return getGoldenFalconEmailPlainText("welcome_otp", locale, { otp, ibId });
}

export async function sendMailgunHtmlEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  return mailgunClient.messages.create(MAILGUN_DOMAIN, {
    from: MAILGUN_FROM,
    to,
    subject,
    html,
    text,
  });
}
