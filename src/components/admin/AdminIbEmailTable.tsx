"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminTablePagination, { paginateItems } from "@/components/admin/AdminTablePagination";
import type { IbEmailListItem } from "@/lib/ibEmailStore";

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function TableSkeleton() {
  return <div className="h-96 animate-pulse rounded-2xl bg-ink/5" />;
}

const TABLE_HEADINGS = ["Email", "IB ID", "First Name", "Locale", "Submitted"] as const;

export default function AdminIbEmailTable() {
  const [records, setRecords] = useState<IbEmailListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/ib-email");
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to load IB email records");
        return;
      }

      setRecords(data.records || []);
    } catch {
      setError("Failed to load IB email records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;

    return records.filter(
      (item) =>
        item.email.toLowerCase().includes(query) ||
        item.ibId.toLowerCase().includes(query) ||
        item.firstName.toLowerCase().includes(query) ||
        item.locale.toLowerCase().includes(query)
    );
  }, [records, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const pagination = useMemo(
    () => paginateItems(filtered, currentPage),
    [filtered, currentPage]
  );

  return (
    <div className="rounded-2xl border border-[#382910]/10 bg-white shadow-[0_4px_24px_-4px_rgba(56,41,16,0.08)]">
      <div className="flex flex-col gap-4 border-b border-ink/8 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-xl text-ink">IB email access</h2>
          <p className="mt-1 font-poppins text-sm text-ink/55">
            {loading
              ? "Loading..."
              : filtered.length === 0
                ? "0 records · read only"
                : `Showing ${pagination.startIndex}-${pagination.endIndex} of ${filtered.length} · read only`}
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
            placeholder="Search email, IB ID, name..."
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
                  <td colSpan={TABLE_HEADINGS.length} className="px-5 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink/5 text-ink/30">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        />
                      </svg>
                    </div>
                    <p className="mt-3 font-poppins text-sm text-ink/50">No IB email records found</p>
                  </td>
                </tr>
              ) : (
                pagination.items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-[#FFFDF8]/80">
                    <td className="px-5 py-4 font-poppins text-sm text-ink/80">{item.email}</td>
                    <td className="px-5 py-4 font-poppins text-sm font-medium text-ink">
                      {item.ibId}
                    </td>
                    <td className="px-5 py-4 font-poppins text-sm text-ink/70">
                      {item.firstName || "—"}
                    </td>
                    <td className="px-5 py-4 font-poppins text-sm uppercase text-ink/70">
                      {item.locale || "—"}
                    </td>
                    <td className="px-5 py-4 font-poppins text-sm text-ink/70">
                      {formatDate(item.createdAt)}
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
