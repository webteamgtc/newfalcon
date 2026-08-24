export async function sendRegistrationStartedEmail(payload: {
  email: string;
  first_name?: string;
  firstName?: string;
  locale?: string;
  termsLink?: string;
}) {
  const response = await fetch("/api/send-registration-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string }
    | null;

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Failed to send registration started email");
  }

  return data;
}