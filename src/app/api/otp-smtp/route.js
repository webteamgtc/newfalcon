import { NextResponse } from "next/server";
import {
  MAILGUN_DOMAIN,
  MAILGUN_FROM,
  mailgunClient,
} from "@/config/nodemailer";
import { generateRandomOtp, createVerificationToken } from "@/lib/otpStore";

export const runtime = "nodejs";
const processOtp = process.env.SHOW_OTP_VERIFICATION === "true";

export async function POST(req) {
  try {
    const { email, first_name, ibId, ib_id } = await req.json();
    const resolvedIbId = ibId || ib_id || "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let otp;
    let verificationToken;
    try {
      otp = generateRandomOtp();
      verificationToken = createVerificationToken(email, otp);
    } catch (storeError) {
      console.error("OTP generate error:", storeError?.message || storeError);
      return NextResponse.json(
        {
          success: false,
          message:
            storeError?.message?.includes("OTP_SECRET")
              ? "OTP service is not configured. Set OTP_SECRET in production."
              : "Failed to prepare OTP verification",
        },
        { status: 500 }
      );
    }

    const subject = "Your GTCFX OTP Code";

    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Important: Your CRM Account Password Has Been Reset</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #F7F7F7; font-family: 'Outfit', Arial, sans-serif; color: #000; text-align: left; line-height: 22px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="border-spacing: 0; width: 100%;">
        <tr>
            <td align="center" bgcolor="#F7F7F7">
                <div class="container" style="max-width: 550px; margin: 0 auto; background-color: #192055; padding: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-radius: 36px; padding: 20px; background-color: #fff; width: 100%;">
                        <tr>
                            <td class="header" style="padding: 20px; text-align: center;">
                                <img src="https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/email-test.png" alt="GTC Global Capital Trade Logo" style="max-width: 165px; height: auto;">
                            </td>
                        </tr>
                        <tr>
                            <td class="content">
                                <h2 style="color: #ffffff; text-align: center; font-size: 16px; margin: 0px auto; padding: 10px; background: #192055; border-radius: 27px; max-width: 68%; margin-bottom: 39px;">
                                    Your GTCFX OTP 
                                </h2>
                                <h3 style="font-size: 16px; color: #192055;">
                                    Dear <em>${first_name || "Client"}</em>,
                                </h3>
                                
                                <p>Thank you for choosing GTCFX.</p>

                                <p>Please use the following One-Time Password </p>
                              <p><strong style="font-size: 25px;font-weight: 800; color: #192055;">${otp}</strong></p>
                               <p>to complete your further process.</p>
                                ${resolvedIbId
        ? `<p>Your IB ID / Referral Code: <strong style="font-size: 20px;font-weight: 800; color: #192055;">${resolvedIbId}</strong></p>`
        : ""
      }
                                
                                <p>If you have any questions or need further assistance, please do not hesitate to contact us at <a href="mailto:support@gtcfx.com" style="color: #5166ff; text-decoration: underline;">support@gtcfx.com</a>. We are here to support you and ensure your experience with us is exceptional.</p>
                        
                                <p style="line-height: 30px; padding-top: 20px;">Best Regards,<br><strong style="color: #192055; margin-top:5px;">GTCFX Team</strong></p>
                            </td>
                        </tr>
                        <tr>
                            <td class="footer" style="padding: 20px 0px; font-size: 10px; color: #000; background-color: #f7f7f736; border-radius: 0 0 36px 36px; text-align: center;">
                                <div class="social-icons" style="padding-bottom: 10px;">
                                    <a href="https://www.facebook.com/gtcfxofficial" style="text-decoration: none;" target="_blank">
                                        <img alt="Facebook" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/facebook_96.png" style="width: 24px; height: 24px; margin: 0 5px;">
                                    </a>
                                    <a href="https://twitter.com/GTC_fx" style="text-decoration: none;" target="_blank">
                                        <img alt="Twitter" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/twitter_96.png" style="width: 24px; height: 24px; margin: 0 5px;">
                                    </a>
                                    <a href="https://linkedin.com/company/gtcfx-official" style="text-decoration: none;" target="_blank">
                                        <img alt="LinkedIn" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/linkedin_96.png" style="width: 24px; height: 24px; margin: 0 5px;">
                                    </a>
                                    <a href="https://www.youtube.com/channel/UCnKWakjm1b9Bm63xgwNFXHA" style="text-decoration: none;" target="_blank">
                                        <img alt="YouTube" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/youtube_96.png" style="width: 24px; height: 24px; margin: 0 5px;">
                                    </a>
                                    <a href="https://www.instagram.com/gtcfxofficial" style="text-decoration: none;" target="_blank">
                                        <img alt="Instagram" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/instagram_96.png" style="width: 24px; height: 24px; margin: 0 5px;">
                                    </a>
                                    <a href="https://www.tiktok.com/@gtcgroup_official" style="text-decoration: none;" target="_blank">
                                        <img alt="TikTok" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/tiktok_96.png" style="width: 24px; height: 24px; margin: 0 5px;">
                                    </a>
                                </div>
                                <p style="font-size: 9px; line-height: 13px; text-align: left;">
                                    Company name: GTC FX / Website: www.gtcfx.com / Email: support@gtcfx.com / Tel.: +971 800 667788
                                </p>
                                <p style="font-size: 9px; line-height: 13px; text-align: left;">
                                  Disclaimers: The information in this email is for general purposes only and does not constitute personal financial advice. Please assess the relevance of this information to your own financial goals and situation. Investing in contract for difference products carries significant risks and may not be suitable for all investors. Losses may exceed the initial deposit. You do not have ownership rights to the underlying assets of the contract. We advise seeking professional guidance to fully understand the risks before trading. Please review our user terms, risk warnings, privacy policy, and other relevant documents before making financial decisions.
                                </p>
                                <p style="font-size: 9px; line-height: 13px; text-align: left;">
                                  Note that our products and services are not available in restricted countries.
                                </p>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;

    await mailgunClient.messages.create(MAILGUN_DOMAIN, {
      from: MAILGUN_FROM,
      to: email,
      subject,
      text: `Your OTP is ${otp}`,
      html,
    });

    return NextResponse.json(
      { success: true, message: "OTP sent successfully", verificationToken, otp:processOtp ? otp : null },
      { status: 200 }
    );
  } catch (error) {
    console.error("OTP send error:", error?.message || error);
    return NextResponse.json(
      { success: false, message: "Error sending OTP" },
      { status: 500 }
    );
  }
}
