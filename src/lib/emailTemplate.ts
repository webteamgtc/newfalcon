type ConfirmationEmailOptions = {
  firstName: string;
  title: string;
  message: string;
  details?: string[];
  actionLink?: string;
  actionLabel?: string;
};

export function buildConfirmationEmailHtml({
  firstName,
  title,
  message,
  details = [],
  actionLink,
  actionLabel = "View your registration status",
}: ConfirmationEmailOptions) {
  const detailsHtml = details
    .map(
      (line) =>
        `<p style="margin: 0 0 8px; color: #192055;"><strong>${line}</strong></p>`
    )
    .join("");

  const actionHtml = actionLink
    ? `<p style="margin: 28px 0 0; text-align: center;">
        <a href="${actionLink}" style="display: inline-block; background: #192055; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-size: 14px; font-weight: 600;">
          ${actionLabel}
        </a>
      </p>
      <p style="margin: 16px 0 0; font-size: 12px; color: #666; word-break: break-all;">${actionLink}</p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
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
                                <h2 style="color: #ffffff; text-align: center; font-size: 16px; margin: 0px auto; padding: 10px; background: #192055; border-radius: 27px; max-width: 85%; margin-bottom: 39px;">
                                    ${title}
                                </h2>
                                <h3 style="font-size: 16px; color: #192055;">
                                    Dear <em>${firstName || "Client"}</em>,
                                </h3>
                                <p>${message}</p>
                                ${detailsHtml}
                                ${actionHtml}
                                <p>Our team will review your submission and contact you if any additional information is required.</p>
                                <p>If you have any questions, please contact us at <a href="mailto:support@gtcfx.com" style="color: #5166ff; text-decoration: underline;">support@gtcfx.com</a>.</p>
                                <p style="line-height: 30px; padding-top: 20px;">Best Regards,<br><strong style="color: #192055; margin-top:5px;">GTCFX Team</strong></p>
                            </td>
                        </tr>
                        <tr>
                            <td class="footer" style="padding: 20px 0px; font-size: 10px; color: #000; background-color: #f7f7f736; border-radius: 0 0 36px 36px; text-align: center;">
                                <p style="font-size: 9px; line-height: 13px; text-align: left;">
                                    Company name: GTC FX / Website: www.gtcfx.com / Email: support@gtcfx.com / Tel.: +971 800 667788
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
}

const FORM_EMAIL_CONTENT = {
  vip_ticket_booking: {
    subject: "Golden Falcon Awards — Registration Received",
    title: "Registration Received",
    message:
      "Thank you for submitting your Golden Falcon Awards UAE ticket registration. We have successfully received your details.",
    details: (referenceId?: string) =>
      referenceId ? [`Reference ID: ${referenceId}`] : [],
  },
  staff_registration: {
    subject: "GTCFX Staff Registration — Confirmation",
    title: "Staff Registration Received",
    message:
      "Thank you for completing your GTCFX staff registration. Your submission has been recorded successfully.",
    details: (referenceId?: string) =>
      referenceId ? [`Reference ID: ${referenceId}`] : [],
  },
} as const;

export type ConfirmationFormType = keyof typeof FORM_EMAIL_CONTENT;

export function getConfirmationEmailContent(
  formType: ConfirmationFormType,
  referenceId?: string
) {
  const content = FORM_EMAIL_CONTENT[formType];
  return {
    subject: content.subject,
    title: content.title,
    message: content.message,
    details: content.details(referenceId),
  };
}
