"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import AdminUserEditForm from "@/components/admin/AdminUserEditForm";
import type {
  AdminRegistrationListItem,
  AdminRegistrationRecord,
} from "@/lib/adminRegistration";
import { SHOW_VISA_SECTION } from "@/lib/featureFlags";

const TABLE_HEADINGS = [
  "Name",
  "Email",
  "Phone",
  "Submitted",
  "Qualified",
  ...(SHOW_VISA_SECTION ? (["Visa"] as const) : []),
  "Ticket",
  "Actions",
] as const;

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatLabel(value: string) {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function computeStats(registrations: AdminRegistrationListItem[]) {
  return {
    total: registrations.length,
    qualified: registrations.filter((r) => r.qualified === "yes").length,
    needsReview: registrations.filter((r) => !r.hasAdminDetails).length,
    visaApproved: registrations.filter((r) => r.visaStatus === "approved").length,
    visaPending: registrations.filter((r) =>
      ["applied", "under_processing"].includes(r.visaStatus)
    ).length,
    visaRejected: registrations.filter((r) => r.visaStatus === "rejected").length,
    ticketConfirmed: registrations.filter((r) => r.ticketStatus === "confirmed").length,
    ticketPending: registrations.filter((r) =>
      ["requested", "under_process"].includes(r.ticketStatus)
    ).length,
  };
}

type StatTone = "gold" | "green" | "blue" | "amber" | "red" | "slate";

const statToneStyles: Record<
  StatTone,
  { card: string; icon: string; value: string; label: string }
> = {
  gold: {
    card: "border-[#382910]/12 bg-gradient-to-br from-[#FDFCFA] via-[#FBF6EB] to-[#F3E5CB]",
    icon: "bg-falcon-deep/15 text-falcon-deep",
    value: "text-ink",
    label: "text-ink/55",
  },
  green: {
    card: "border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white",
    icon: "bg-emerald-100 text-emerald-700",
    value: "text-emerald-900",
    label: "text-emerald-700/70",
  },
  blue: {
    card: "border-sky-200/80 bg-gradient-to-br from-sky-50 to-white",
    icon: "bg-sky-100 text-sky-700",
    value: "text-sky-900",
    label: "text-sky-700/70",
  },
  amber: {
    card: "border-amber-200/80 bg-gradient-to-br from-amber-50 to-white",
    icon: "bg-amber-100 text-amber-700",
    value: "text-amber-900",
    label: "text-amber-700/70",
  },
  red: {
    card: "border-red-200/80 bg-gradient-to-br from-red-50 to-white",
    icon: "bg-red-100 text-red-700",
    value: "text-red-900",
    label: "text-red-700/70",
  },
  slate: {
    card: "border-ink/10 bg-white",
    icon: "bg-ink/8 text-ink/60",
    value: "text-ink",
    label: "text-ink/50",
  },
};

function StatCard({
  label,
  value,
  subtitle,
  tone,
  icon,
}: {
  label: string;
  value: number;
  subtitle?: string;
  tone: StatTone;
  icon: ReactNode;
}) {
  const styles = statToneStyles[tone];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-[0_4px_20px_-4px_rgba(56,41,16,0.1)] ${styles.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`font-poppins text-[11px] uppercase tracking-[0.1em] ${styles.label}`}>
            {label}
          </p>
          <p className={`mt-2 font-display text-4xl font-medium ${styles.value}`}>{value}</p>
          {subtitle && (
            <p className={`mt-1 font-poppins text-xs ${styles.label}`}>{subtitle}</p>
          )}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ value, type }: { value: string; type: "qualified" | "visa" | "ticket" }) {
  if (!value) {
    return (
      <span className="inline-flex rounded-full bg-ink/5 px-2.5 py-0.5 font-poppins text-[10px] uppercase tracking-[0.06em] text-ink/45">
        —
      </span>
    );
  }

  let style = "bg-ink/5 text-ink/60";

  if (type === "qualified") {
    style = value === "yes" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
  } else if (type === "visa") {
    if (value === "approved") style = "bg-emerald-100 text-emerald-800";
    else if (value === "rejected") style = "bg-red-100 text-red-800";
    else if (value === "applied" || value === "under_processing") style = "bg-sky-100 text-sky-800";
    else style = "bg-ink/5 text-ink/55";
  } else if (type === "ticket") {
    if (value === "confirmed") style = "bg-emerald-100 text-emerald-800";
    else if (value === "cancelled") style = "bg-red-100 text-red-800";
    else if (value === "requested" || value === "under_process") style = "bg-sky-100 text-sky-800";
    else style = "bg-ink/5 text-ink/55";
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 font-poppins text-[10px] font-medium uppercase tracking-[0.06em] ${style}`}
    >
      {formatLabel(value)}
    </span>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-ink/5" />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return <div className="h-96 animate-pulse rounded-2xl bg-ink/5" />;
}

type Props = {
  adminEmail: string;
};

export default function AdminDashboard({ adminEmail }: Props) {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<AdminRegistrationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRegistration, setSelectedRegistration] =
    useState<AdminRegistrationRecord | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [sendingTravelEmailId, setSendingTravelEmailId] = useState<string | null>(null);
  const [travelEmailFeedback, setTravelEmailFeedback] = useState<{
    id: string;
    message: string;
    success: boolean;
  } | null>(null);

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/registrations");
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to load registrations");
        return;
      }

      setRegistrations(data.registrations || []);
    } catch {
      setError("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const stats = useMemo(() => computeStats(registrations), [registrations]);

  async function openRegistration(id: string) {
    setSelectedId(id);
    setLoadingDetail(true);

    try {
      const response = await fetch(`/api/admin/registrations/${id}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to load registration details");
        setSelectedId(null);
        return;
      }

      setSelectedRegistration(data.registration);
    } catch {
      setError("Failed to load registration details");
      setSelectedId(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  function closeEditor() {
    setSelectedId(null);
    setSelectedRegistration(null);
  }

  function handleSaved(registration: AdminRegistrationRecord) {
    setSelectedRegistration(registration);
    setRegistrations((current) =>
      current.map((item) =>
        item.id === registration.id
          ? {
              ...item,
              firstName: registration.firstName,
              lastName: registration.lastName,
              email: registration.email,
              phone: registration.phone,
              qualified: registration.qualified,
              visaStatus: registration.visaStatus ?? "",
              ticketStatus: registration.ticketStatus ?? "",
              hasAdminDetails: true,
            }
          : item
      )
    );
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
  }

  async function handleSendTravelConfirmationEmail(item: AdminRegistrationListItem) {
    const recipientEmail = (item.email || item.registrationEmail).trim().toLowerCase();
    if (!recipientEmail) {
      setTravelEmailFeedback({
        id: item.id,
        message: "No email available for this registration.",
        success: false,
      });
      return;
    }

    setSendingTravelEmailId(item.id);
    setTravelEmailFeedback(null);

    try {
      const response = await fetch("/api/admin/send-travel-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: item.id,
          email: recipientEmail,
          firstName: item.firstName.trim(),
          locale: "en",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setTravelEmailFeedback({
          id: item.id,
          message: data.message || "Failed to send travel confirmation email",
          success: false,
        });
        return;
      }

      setTravelEmailFeedback({
        id: item.id,
        message: `Travel confirmation email sent to ${recipientEmail}.`,
        success: true,
      });
    } catch {
      setTravelEmailFeedback({
        id: item.id,
        message: "Failed to send travel confirmation email. Please try again.",
        success: false,
      });
    } finally {
      setSendingTravelEmailId(null);
    }
  }

  const filtered = registrations.filter((item) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return (
      item.fullName.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.registrationEmail.toLowerCase().includes(query) ||
      item.phone.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#F7F2E8]">
      {/* Header */}
      <header className="border-b border-[#382910]/10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 md:px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-falcon-deep font-display text-lg text-white">
              GF
            </div>
            <div>
              <p className="font-poppins text-[10px] uppercase tracking-[0.14em] text-ink/45">
                Golden Falcon Night
              </p>
              <h1 className="font-display text-2xl text-ink">Admin Dashboard</h1>
              <p className="mt-0.5 font-poppins text-xs text-ink/50">{adminEmail}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-ink/15 bg-white px-4 py-2 font-poppins text-xs uppercase tracking-[0.08em] text-ink/70 shadow-sm transition-colors hover:border-ink/25 hover:bg-ink/5"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Stats overview */}
        <div className="mb-8">
          <h2 className="font-display text-xl text-ink">Overview</h2>
          <p className="mt-1 font-poppins text-sm text-ink/55">
            Live stats from VIP registrations
          </p>

          {loading ? (
            <div className="mt-5">
              <StatsSkeleton />
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total registered"
                value={stats.total}
                subtitle="All VIP submissions"
                tone="gold"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                }
              />
              <StatCard
                label="Qualified"
                value={stats.qualified}
                subtitle="Marked as eligible"
                tone="green"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                }
              />
              {SHOW_VISA_SECTION && (
                <StatCard
                  label="Visa approved"
                  value={stats.visaApproved}
                  subtitle={stats.visaPending > 0 ? `${stats.visaPending} in progress` : "All clear"}
                  tone="blue"
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 0 0-3.75 1.875 1.875 0 0 0 0 3.75Zm-3.75 0a1.875 1.875 0 1 0 0-3.75 1.875 1.875 0 0 0 0 3.75Z" />
                    </svg>
                  }
                />
              )}
              <StatCard
                label="Ticket confirmed"
                value={stats.ticketConfirmed}
                subtitle={stats.ticketPending > 0 ? `${stats.ticketPending} in progress` : "All clear"}
                tone="green"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M4.5 18.75h15a2.25 2.25 0 0 0 2.25-2.25V5.25A2.25 2.25 0 0 0 19.5 3h-15a2.25 2.25 0 0 0-2.25 2.25v11.25A2.25 2.25 0 0 0 4.5 18.75Z" />
                  </svg>
                }
              />
              {/* <StatCard
                label="Needs review"
                value={stats.needsReview}
                subtitle="Not yet updated by admin"
                tone="amber"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                }
              /> */}
              {SHOW_VISA_SECTION && (
                <>
                  <StatCard
                    label="Visa in progress"
                    value={stats.visaPending}
                    subtitle="Applied or processing"
                    tone="blue"
                    icon={
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    }
                  />
                  <StatCard
                    label="Visa rejected"
                    value={stats.visaRejected}
                    subtitle="Requires follow-up"
                    tone="red"
                    icon={
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    }
                  />
                </>
              )}
              <StatCard
                label="Tickets in progress"
                value={stats.ticketPending}
                subtitle="Requested or processing"
                tone="slate"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                }
              />
            </div>
          )}
        </div>

        {/* Registrations table */}
        <div className="rounded-2xl border border-[#382910]/10 bg-white shadow-[0_4px_24px_-4px_rgba(56,41,16,0.08)]">
          <div className="flex flex-col gap-4 border-b border-ink/8 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-xl text-ink">VIP registrations</h2>
              <p className="mt-1 font-poppins text-sm text-ink/55">
                {loading
                  ? "Loading..."
                  : `${filtered.length} of ${registrations.length} shown`}
              </p>
            </div>
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, phone..."
                className="h-11 w-full rounded-full border border-ink/15 bg-[#FFFDF8] py-2 pl-10 pr-4 font-poppins text-sm text-ink outline-none transition-colors focus:border-falcon-deep md:w-72"
              />
            </div>
          </div>

          {loading && (
            <div className="p-6">
              <TableSkeleton />
            </div>
          )}

          {!loading && error && (
            <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="font-poppins text-sm text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-ink/8 bg-[#FFFDF8]">
                    {TABLE_HEADINGS.map((heading) => (
                        <th
                          key={heading || "action"}
                          className="px-5 py-3.5 text-left font-poppins text-[10px] uppercase tracking-[0.1em] text-ink/45"
                        >
                          {heading}
                        </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/6">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={TABLE_HEADINGS.length} className="px-5 py-16 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink/5 text-ink/30">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                          </svg>
                        </div>
                        <p className="mt-3 font-poppins text-sm text-ink/50">No registrations found</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-[#FFFDF8]/80"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-falcon-deep/10 font-poppins text-xs font-semibold text-falcon-deep">
                              {(item.fullName || item.firstName)?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div>
                              <p className="font-poppins text-sm font-medium text-ink">
                                {item.fullName || `${item.firstName} ${item.lastName}`.trim()}
                              </p>
                              {!item.hasAdminDetails && (
                                <span className="mt-0.5 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[9px] uppercase tracking-[0.08em] text-amber-800">
                                  Needs review
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-poppins text-sm text-ink/70">
                          {item.registrationEmail}
                        </td>
                        <td className="px-5 py-4 font-poppins text-sm text-ink/70">
                          {item.phone || "—"}
                        </td>
                        <td className="px-5 py-4 font-poppins text-sm text-ink/70">
                          {formatDate(item.submittedAt)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge value={item.qualified} type="qualified" />
                        </td>
                        {SHOW_VISA_SECTION && (
                          <td className="px-5 py-4">
                            <StatusBadge value={item.visaStatus} type="visa" />
                          </td>
                        )}
                        <td className="px-5 py-4">
                          <StatusBadge value={item.ticketStatus} type="ticket" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSendTravelConfirmationEmail(item)}
                              disabled={sendingTravelEmailId === item.id}
                              className="rounded-full border border-falcon-deep px-3 py-1.5 font-poppins text-[10px] uppercase tracking-[0.08em] text-falcon-deep transition-colors hover:bg-falcon-deep hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {sendingTravelEmailId === item.id ? "Sending..." : "Send email"}
                            </button>
                            <button
                              type="button"
                              onClick={() => openRegistration(item.id)}
                              disabled={loadingDetail && selectedId === item.id}
                              className="rounded-full bg-falcon-deep px-4 py-1.5 font-poppins text-[10px] uppercase tracking-[0.08em] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                            >
                              {loadingDetail && selectedId === item.id ? "..." : "Edit"}
                            </button>
                          </div>
                          {travelEmailFeedback?.id === item.id && (
                            <p
                              className={`mt-2 max-w-[220px] font-poppins text-[11px] leading-snug ${
                                travelEmailFeedback.success ? "text-emerald-700" : "text-amber-800"
                              }`}
                            >
                              {travelEmailFeedback.message}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {selectedRegistration && (
        <AdminUserEditForm
          registration={selectedRegistration}
          onClose={closeEditor}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
