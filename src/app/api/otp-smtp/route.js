// import nodemailer from 'nodemailer';
// import { NextResponse } from 'next/server';
// import otpGenerator from 'otp-generator';
// import { transporter } from '../../../config/nodemailer';

// export async function POST(req) {
//   const { email } = await req.json();
//   const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, digits: true, lowerCaseAlphabets: false });
//   const mailData = {
//     from: '"GTCFX" <portal@mx5.gtcmail.com>',
//     to: email,
//     subject: "Your GTCFX OTP Code",
//     text: `Your OTP is ${otp}`,
//     html: `
//         <!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Important: Your CRM Account Password Has Been Reset</title>
//     <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap" rel="stylesheet">
// </head>
// <body style="margin: 0; padding: 0; background-color: #F7F7F7; font-family: 'Outfit', Arial, sans-serif; color: #000; text-align: left; line-height: 22px;">
//     <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="border-spacing: 0; width: 100%;">
//         <tr>
//             <td align="center" bgcolor="#F7F7F7">
//                 <div class="container" style="max-width: 650px; margin: 0 auto; background-color: #192055; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
//                     <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-radius: 36px; padding: 20px; background-color: #fff; width: 100%;">
//                         <tr>
//                             <td class="header" style="padding: 20px; text-align: center;">
//                                 <img src="https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/email-test.png" alt="GTC Global Capital Trade Logo" style="max-width: 165px; height: auto;">
//                             </td>
//                         </tr>
//                         <tr>
//                             <td class="content">
//                                 <h2 style="color: #ffffff; text-align: center; font-size: 16px; margin: 0px auto; padding: 10px; background: #192055; border-radius: 27px; max-width: 68%; margin-bottom: 39px;">
//                                     Your GTCFX OTP
//                                 </h2>
//                                 <h3 style="font-size: 16px; color: #192055;">
//                                     Dear <em>Client</em>,
//                                 </h3>

//                                 <p>Thank you for choosing GTCFX.</p>

//                                 <p>Please use the following One-Time Password <strong style="font-size: 18px;font-weight: 800; color: #192055;">${otp}</strong> to complete your further process.</p>

//                                 <p>If you have any questions or need further assistance, please do not hesitate to contact us at <a href="mailto:support@gtcfx.com" style="color: #5166ff; text-decoration: underline;">support@gtcfx.com</a>. We are here to support you and ensure your experience with us is exceptional.</p>

//                                 <p style="line-height: 30px; padding-top: 20px;">Best Regards,<br><strong style="color: #192055; margin-top:5px;">GTCFX Team</strong></p>
//                             </td>
//                         </tr>
//                         <tr>
//                             <td class="footer" style="padding: 20px 0px; font-size: 10px; color: #000; background-color: #f7f7f736; border-radius: 0 0 36px 36px; text-align: center;">
//                                 <div class="social-icons" style="padding-bottom: 10px;">
//                                     <a href="https://www.facebook.com/gtcfxofficial" style="text-decoration: none;" target="_blank">
//                                         <img alt="Facebook" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/facebook_96.png" style="width: 24px; height: 24px; margin: 0 5px;">
//                                     </a>
//                                     <a href="https://twitter.com/GTC_fx" style="text-decoration: none;" target="_blank">
//                                         <img alt="Twitter" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/twitter_96.png" style="width: 24px; height: 24px; margin: 0 5px;">
//                                     </a>
//                                     <a href="https://linkedin.com/company/gtcfx-official" style="text-decoration: none;" target="_blank">
//                                         <img alt="LinkedIn" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/linkedin_96.png" style="width: 24px; height: 24px; margin: 0 5px;">
//                                     </a>
//                                     <a href="https://www.youtube.com/channel/UCnKWakjm1b9Bm63xgwNFXHA" style="text-decoration: none;" target="_blank">
//                                         <img alt="YouTube" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/youtube_96.png" style="width: 24px; height: 24px; margin: 0 5px;">
//                                     </a>
//                                     <a href="https://www.instagram.com/gtcfxofficial" style="text-decoration: none;" target="_blank">
//                                         <img alt="Instagram" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/instagram_96.png" style="width: 24px; height: 24px; margin: 0 5px;">
//                                     </a>
//                                     <a href="https://www.tiktok.com/@gtcgroup_official" style="text-decoration: none;" target="_blank">
//                                         <img alt="TikTok" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/tiktok_96.png" style="width: 24px; height: 24px; margin: 0 5px;">
//                                     </a>
//                                 </div>
//                                 <p style="font-size: 9px; line-height: 13px; text-align: left;">
//                                     Company name: GTC FX / Website: www.gtcfx.com / Email: support@gtcfx.com / Tel.: +971 800 667788
//                                 </p>
//                                 <p style="font-size: 9px; line-height: 13px; text-align: left;">
//                                   Disclaimers: The information in this email is for general purposes only and does not constitute personal financial advice. Please assess the relevance of this information to your own financial goals and situation. Investing in contract for difference products carries significant risks and may not be suitable for all investors. Losses may exceed the initial deposit. You do not have ownership rights to the underlying assets of the contract. We advise seeking professional guidance to fully understand the risks before trading. Please review our user terms, risk warnings, privacy policy, and other relevant documents before making financial decisions.
//                                 </p>
//                                 <p style="font-size: 9px; line-height: 13px; text-align: left;">
//                                   Note that our products and services are not available in restricted countries.
//                                 </p>
//                             </td>
//                         </tr>
//                     </table>
//                 </div>
//             </td>
//         </tr>
//     </table>
// </body>
// </html>
//         `
//   };
//   try {
//     await transporter.sendMail(mailData);
//     return NextResponse.json({ message: otp }, { status: 200 })
//   } catch (error) {
//     console.log(error);
//     return NextResponse.json({ message: 'Error Sending OTP' }, { status: 500 })
//   }
// }

import { NextResponse } from "next/server";
import otpGenerator from "otp-generator";
import { MAILGUN_DOMAIN, MAILGUN_FROM, mailgunClient } from "../../config/nodemailer";


export async function POST(req) {
  try {
    const { email, first_name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 6-digit numeric OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });

    const subject = "Your GTCFX OTP Code";

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Don’t Miss Your Chance to Switch to GTC!</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:#ffffff;font-family:'Poppins',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Poppins', sans-serif; padding: 20px;">
      <tr>
        <td align="center">

          <table width="650" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0; border-radius:8px;padding:30px; padding-top: 20px; background-color: #182063;">
            <tr>
              <td align="center" style="padding-bottom: 20px;">
                <img src="https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/social/new-logo.webp" alt="GTC Logo" style="width: 160px;" />
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size:20px;font-weight:600;color:#bf9b30;padding-bottom:10px;">
                Confirm your Entry: <br>OTP for the Falcon Golden Awards 2026
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size:14px;color:#ffff;padding-bottom:20px;">
                Enter this 6-digit code to verify your email and receive your unique Lucky Number.
              </td>
            </tr>
            <tr><td style="border-top: 2px solid #e0e0e0; padding: 15px 0;"></td></tr>
            <tr>
              <td style="font-size:14px;color:#ffff;padding-bottom:10px;">
                Dear ${first_name || "Client"},
              </td>
            </tr>
            <tr>
              <td style="font-size:14px;color:#ffff;padding-bottom:10px;">
                Thanks for registering for the <span style="color:#bf9b30; font-weight: 600">Falcon Golden Awards 2026</span>. To complete your entry, please verify your email by entering the OTP below on the form.
              </td>
            </tr>
            <tr>
              <td style="font-size:14px;color:#ffff;padding-bottom:10px;">
                Here’s the OTP that you’ll need to enter into the form.
              </td>

                  <tr>
              <td style="font-size:30px;font-weight:600;color:#bf9b30;padding:20px 0px;">
                ${otp}
              </td>
            </tr>

            </tr>

        
            <tr>
              <td style="font-size:14px;color:#ffff;padding-bottom:20px;">
                If you need any help, our Customer Care team is available via Live Chat on our website or by email at support@gtcfx.com.
              </td>
            </tr>
      
            <tr>
              <td style="font-size:14px;color:#ffff;padding-bottom:30px;">
                Have a great day,<br>Your GTC Family
              </td>
            </tr>
            <tr><td style="border-top: 2px solid #e0e0e0; padding: 15px 0;"></td></tr>
            <tr>
              <td style="padding-top: 0px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left">
                      <img src="https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/social/new-logo.webp" alt="GTC Logo" style="width: 160px;" />
                    </td>
                    <td align="right" style="font-size: 13px; color: #fff; line-height: 25px;">
                      📞 Phone: +971 800 667788<br/>
                      ✉️ Email: <a href="mailto:support@gtcfx.com" style="color: #fff; text-decoration: none;">support@gtcfx.com</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Add Legal + Social sections here if needed -->
             <!-- Legal Footer -->
<tr>
  <td style="font-size: 11px; color: #ccc; padding: 20px 0px; line-height: 1.5;">

    This website is owned and operated by GTC Global Ltd, a limited company incorporated in Mauritius (company number: C188049) and licensed by the Financial Services Commission, Mauritius (No. GB22200292) to trade as an SEC-2.1B Investment Dealer. Registered Address: Cyberati Lounge, Ground Floor, The Catalyst, Silicon Avenue, 40 Cybercity, 72201 Ebene, Republic of Mauritius. The financial services and products promoted on this website are offered by GTC Global Ltd and GTC Global Trade Capital Co. Limited, a company authorised by the Vanuatu Financial Services Commission of the Republic of Vanuatu, Company License Number: 40354.
   
  </td>
</tr>

<!-- Social Media Footer -->
<tr>
  <td style="padding-top: 30px; text-align: center;">
    <table align="center" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding: 0 5px;">
          <a href="https://www.facebook.com/GTCFXGlobalTradeCapital" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="20" height="20" style="display:block;">
          </a>
        </td>
        <td style="padding: 0 5px;">
          <a href="https://x.com/GTC_fx" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/3670/3670151.png" alt="X" width="20" height="20" style="display:block;">
          </a>
        </td>
        <td style="padding: 0 5px;">
          <a href="https://www.youtube.com/channel/UCnKWakjm1b9Bm63xgwNFXHA" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" width="20" height="20" style="display:block;">
          </a>
        </td>
        <td style="padding: 0 5px;">
          <a href="https://linkedin.com/company/gtcfx-official" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" alt="LinkedIn" width="20" height="20" style="display:block;">
          </a>
        </td>
        <td style="padding: 0 5px;">
          <a href="https://www.instagram.com/gtcfxofficial/" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" width="20" height="20" style="display:block;">
          </a>
        </td>
        <td style="padding: 0 5px;">
          <a href="https://api.whatsapp.com/send/?phone=448000488461&text&type=phone_number&app_absent=0" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp" width="20" height="20" style="display:block;">
          </a>
        </td>
        <td style="padding: 0 5px;">
          <a href="https://t.me/gtc_vip_signal" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" alt="Telegram" width="20" height="20" style="display:block;">
          </a>
        </td>
        <td style="padding: 0 5px;">
          <a href="GTCFX - Global Trade Capital on TikTok" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok" width="20" height="20" style="display:block;">
          </a>
        </td>
      </tr>
    </table>
  </td>
</tr>

<tr>
  <td align="center" style="font-size: 12px; color: #ccc; padding-top: 15px;">
    &copy; Copyright 2025 GTCFX – All Rights Reserved
  </td>
</tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    const res = await mailgunClient.messages.create(MAILGUN_DOMAIN, {
      from: MAILGUN_FROM,
      to: email,
      subject,
      text: `Your OTP is ${otp}`,
      html,
    });

    // Return OTP (adjust to your security model; often you don't return the OTP)
    return NextResponse.json({ id: res.id, message: otp }, { status: 200 });
  } catch (error) {
    console.error("Mailgun error:", error?.message || error);
    return NextResponse.json({ message: "Error Sending OTP" }, { status: 500 });
  }
}
