"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminTablePagination, { paginateItems } from "@/components/admin/AdminTablePagination";
import {
  ADMIN_SEAT_LIST_META,
  type AdminSeatListKey,
  type AdminSeatRegistrationListItem,
} from "@/lib/adminSeatRegistrations";

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

function TableSkeleton() {
  return <div className="h-96 animate-pulse rounded-2xl bg-ink/5" />;
}

type Props = {
  listKey: AdminSeatListKey;
};

export default function AdminSeatRegistrationsTable({ listKey }: Props) {
  const meta = ADMIN_SEAT_LIST_META[listKey];
  const [records, setRecords] = useState<AdminSeatRegistrationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/seat-registrations?list=${encodeURIComponent(listKey)}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to load registrations");
        setRecords([]);
        return;
      }

      setRecords(data.registrations || []);
    } catch {
      setError("Failed to load registrations");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [listKey]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    setSearch("");
    setCurrentPage(1);
  }, [listKey]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;

    return records.filter((item) => {
      return (
        item.displayName.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.phone.toLowerCase().includes(query) ||
        item.reference.toLowerCase().includes(query) ||
        item.organisationName.toLowerCase().includes(query) ||
        item.lineManagerName.toLowerCase().includes(query) ||
        item.companionName.toLowerCase().includes(query)
      );
    });
  }, [records, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const pagination = useMemo(
    () => paginateItems(filtered, currentPage),
    [filtered, currentPage]
  );

  const showLineManager = listKey === "uae-employee";
  const showMedia = listKey === "media-partners";
  const showCompanion = listKey === "seat-vip" || listKey === "media-partners";

  const headings = [
    "Name",
    "Email",
    "Phone",
    "Reference",
    ...(showLineManager ? (["Line manager"] as const) : []),
    ...(showMedia ? (["Type", "Organisation"] as const) : []),
    ...(showCompanion ? (["Companion"] as const) : []),
    "Country",
    "Status",
    "Submitted",
  ];

  return (
    <div className="rounded-2xl border border-[#382910]/10 bg-white shadow-[0_4px_24px_-4px_rgba(56,41,16,0.08)]">
      <div className="flex flex-col gap-4 border-b border-ink/8 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-xl text-ink">{meta.label}</h2>
          <p className="mt-1 font-poppins text-sm text-ink/55">
            {loading
              ? "Loading..."
              : filtered.length === 0
                ? `0 registrations · ${meta.collectionHint}`
                : `Showing ${pagination.startIndex}-${pagination.endIndex} of ${filtered.length} · ${meta.collectionHint}`}
          </p>
          <p className="mt-0.5 font-poppins text-xs text-ink/45">{meta.description}</p>
        </div>
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
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
                {headings.map((heading) => (
                  <th
                    key={heading}
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
                  <td colSpan={headings.length} className="px-5 py-16 text-center">
                    <p className="font-poppins text-sm text-ink/50">No registrations found</p>
                  </td>
                </tr>
              ) : (
                pagination.items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-[#FFFDF8]/80">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-falcon-deep/10 font-poppins text-xs font-semibold text-falcon-deep">
                          {item.displayName[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="font-poppins text-sm font-medium text-ink">
                            {item.displayName}
                          </p>
                          {item.source && (
                            <p className="mt-0.5 font-poppins text-[10px] uppercase tracking-[0.06em] text-ink/45">
                              {formatLabel(item.source)}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-poppins text-sm text-ink/70">{item.email}</td>
                    <td className="px-5 py-4 font-poppins text-sm text-ink/70">
                      {item.phone || "—"}
                    </td>
                    <td className="px-5 py-4 font-poppins text-sm text-ink/70">
                      {item.reference || "—"}
                    </td>
                    {showLineManager && (
                      <td className="px-5 py-4 font-poppins text-sm text-ink/70">
                        {item.lineManagerName || "—"}
                      </td>
                    )}
                    {showMedia && (
                      <>
                        <td className="px-5 py-4 font-poppins text-sm text-ink/70">
                          {item.partnerType ? formatLabel(item.partnerType) : "—"}
                        </td>
                        <td className="px-5 py-4 font-poppins text-sm text-ink/70">
                          {item.organisationName || "—"}
                        </td>
                      </>
                    )}
                    {showCompanion && (
                      <td className="px-5 py-4 font-poppins text-sm text-ink/70">
                        {item.companionName
                          ? `${item.companionName}${item.joiningWithSomeone ? ` (${item.joiningWithSomeone})` : ""}`
                          : item.joiningWithSomeone || "—"}
                      </td>
                    )}
                    <td className="px-5 py-4 font-poppins text-sm text-ink/70">
                      {item.country || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-ink/5 px-2.5 py-0.5 font-poppins text-[10px] uppercase tracking-[0.06em] text-ink/60">
                        {formatLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-poppins text-sm text-ink/70">
                      {formatDate(item.submittedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <AdminTablePagination
            currentPage={currentPage}
            totalItems={filtered.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
