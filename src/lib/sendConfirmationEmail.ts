export async function sendConfirmationEmail(payload: {
  email: string;
  first_name: string;
  formType: "vip_ticket_booking" | "staff_registration";
  referenceId?: string;
  locale?: string;
  registrationLink?: string;
  statusSiteUrl?: string;
}) {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Do not block form success if confirmation email fails.
  }
}
