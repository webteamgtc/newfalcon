type SaveIbEmailAccessPayload = {
  email: string;
  ibId: string;
  firstName?: string;
  locale?: string;
};

type SaveIbEmailAccessResponse = {
  success: boolean;
  message?: string;
};

export async function saveIbEmailAccessClient(
  payload: SaveIbEmailAccessPayload
): Promise<SaveIbEmailAccessResponse> {
  const response = await fetch("/api/ib-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as
    | SaveIbEmailAccessResponse
    | null;

  if (!response.ok || !data?.success) {
    return {
      success: false,
      message: data?.message || "Failed to save IB access",
    };
  }

  return data;
}
