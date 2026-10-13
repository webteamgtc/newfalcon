"use client";

import { useMemo, useState } from "react";
import type { AdminRegistrationListItem } from "@/lib/adminRegistration";
import {
  REGISTRATION_EXPORT_COLUMNS,
  REGISTRATION_EXPORT_PRESETS,
  buildRegistrationsCsv,
  csvFilename,
  downloadCsvFile,
  type RegistrationExportColumnId,
} from "@/lib/adminCsvExport";

type ExportScope = "all" | "filtered";

type Props = {
  registrations: AdminRegistrationListItem[];
  filtered: AdminRegistrationListItem[];
  disabled?: boolean;
};

const GROUP_LABELS: Record<(typeof REGISTRATION_EXPORT_COLUMNS)[number]["group"], string> = {
  core: "Registration",
  ib: "IB client",
  vip: "VIP progress",
  status: "Admin status",
};

export default function AdminRegistrationExportPanel({
  registrations,
  filtered,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [presetId, setPresetId] = useState(REGISTRATION_EXPORT_PRESETS[0].id);
  const [scope, setScope] = useState<ExportScope>("all");
  const [selectedColumns, setSelectedColumns] = useState<RegistrationExportColumnId[]>(
    REGISTRATION_EXPORT_PRESETS[0].columns
  );

  const exportRows = scope === "filtered" ? filtered : registrations;
  const groupedColumns = useMemo(() => {
    const groups = new Map<string, typeof REGISTRATION_EXPORT_COLUMNS>();
    for (const column of REGISTRATION_EXPORT_COLUMNS) {
      const label = GROUP_LABELS[column.group];
      const existing = groups.get(label) ?? [];
      existing.push(column);
      groups.set(label, existing);
    }
    return Array.from(groups.entries());
  }, []);

  function toggleColumn(columnId: RegistrationExportColumnId) {
    setPresetId("custom");
    setSelectedColumns((current) =>
      current.includes(columnId)
        ? current.filter((id) => id !== columnId)
        : [...current, columnId]
    );
  }

  function selectPreset(nextPresetId: string) {
    const preset = REGISTRATION_EXPORT_PRESETS.find((item) => item.id === nextPresetId);
    if (!preset) return;
    setPresetId(nextPresetId);
    setSelectedColumns(preset.columns);
  }

  function handleExport() {
    if (selectedColumns.length === 0 || exportRows.length === 0) return;

    const csv = buildRegistrationsCsv(exportRows, selectedColumns);
    downloadCsvFile(csvFilename("gfn-vip-registrations"), csv);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled || registrations.length === 0}
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-falcon-deep bg-white px-4 font-poppins text-xs uppercase tracking-[0.08em] text-falcon-deep transition-colors hover:bg-falcon-deep hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 11.25 12 15.75m0 0 4.5-4.5M12 15.75V3"
          />
        </svg>
        Export CSV
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-ink/45 p-4 sm:items-center"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-export-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-[#382910]/12 bg-white shadow-[0_28px_70px_-28px_rgba(56,41,16,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-ink/8 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-poppins text-[10px] uppercase tracking-[0.12em] text-ink/45">
                    VIP registrations
                  </p>
                  <h3 id="admin-export-title" className="mt-1 font-display text-2xl text-ink">
                    Export to CSV
                  </h3>
                  <p className="mt-2 font-poppins text-sm text-ink/60">
                    Choose a preset or pick columns, then download a spreadsheet-compatible file.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-ink/10 px-3 py-1.5 font-poppins text-xs text-ink/60 hover:bg-ink/5"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="max-h-[calc(90vh-11rem)] overflow-y-auto px-6 py-5">
              <div className="space-y-6">
                <div>
                  <p className="font-poppins text-xs uppercase tracking-[0.08em] text-ink/45">
                    What to export
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {REGISTRATION_EXPORT_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => selectPreset(preset.id)}
                        className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                          presetId === preset.id
                            ? "border-falcon-deep bg-[#FBF6EB]"
                            : "border-ink/12 bg-[#FFFDF8] hover:border-ink/20"
                        }`}
                      >
                        <p className="font-poppins text-sm font-medium text-ink">{preset.label}</p>
                        <p className="mt-1 font-poppins text-xs text-ink/55">{preset.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-poppins text-xs uppercase tracking-[0.08em] text-ink/45">
                    Rows to include
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink/12 px-3 py-2 font-poppins text-sm text-ink/80">
                      <input
                        type="radio"
                        name="export-scope"
                        checked={scope === "all"}
                        onChange={() => setScope("all")}
                      />
                      All registrations ({registrations.length})
                    </label>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink/12 px-3 py-2 font-poppins text-sm text-ink/80">
                      <input
                        type="radio"
                        name="export-scope"
                        checked={scope === "filtered"}
                        onChange={() => setScope("filtered")}
                      />
                      Current search results ({filtered.length})
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-poppins text-xs uppercase tracking-[0.08em] text-ink/45">
                      Columns ({selectedColumns.length})
                    </p>
                    <button
                      type="button"
                      onClick={() => selectPreset("all")}
                      className="font-poppins text-xs text-falcon-deep underline underline-offset-2"
                    >
                      Select all columns
                    </button>
                  </div>
                  <div className="mt-3 space-y-4">
                    {groupedColumns.map(([groupLabel, columns]) => (
                      <div key={groupLabel}>
                        <p className="font-poppins text-[11px] uppercase tracking-[0.08em] text-ink/40">
                          {groupLabel}
                        </p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {columns.map((column) => (
                            <label
                              key={column.id}
                              className="flex cursor-pointer items-start gap-2 rounded-lg border border-ink/8 px-3 py-2"
                            >
                              <input
                                type="checkbox"
                                className="mt-0.5"
                                checked={selectedColumns.includes(column.id)}
                                onChange={() => toggleColumn(column.id)}
                              />
                              <span className="font-poppins text-sm text-ink/80">{column.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-ink/8 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-poppins text-xs text-ink/50">
                {exportRows.length} row{exportRows.length === 1 ? "" : "s"} · {selectedColumns.length}{" "}
                column{selectedColumns.length === 1 ? "" : "s"}
              </p>
              <button
                type="button"
                onClick={handleExport}
                disabled={selectedColumns.length === 0 || exportRows.length === 0}
                className="rounded-full bg-falcon-deep px-5 py-2.5 font-poppins text-xs uppercase tracking-[0.08em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
