"use client";

export const ADMIN_PAGE_SIZE = 15;

type Props = {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
};

export function paginateItems<T>(items: T[], currentPage: number, pageSize = ADMIN_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    totalPages,
    safePage,
    startIndex: items.length === 0 ? 0 : start + 1,
    endIndex: Math.min(start + pageSize, items.length),
  };
}

export default function AdminTablePagination({
  currentPage,
  totalItems,
  pageSize = ADMIN_PAGE_SIZE,
  onPageChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  if (totalItems <= pageSize) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const visiblePages = pages.filter((page) => {
    if (totalPages <= 7) return true;
    if (page === 1 || page === totalPages) return true;
    return Math.abs(page - safePage) <= 1;
  });

  return (
    <div className="flex flex-col gap-3 border-t border-ink/8 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-poppins text-xs text-ink/55">
        Page {safePage} of {totalPages}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="rounded-full border border-ink/15 px-3 py-1.5 font-poppins text-[10px] uppercase tracking-[0.08em] text-ink/70 transition-colors hover:border-ink/25 hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        {visiblePages.map((page, index) => {
          const previousPage = visiblePages[index - 1];
          const showEllipsis = previousPage != null && page - previousPage > 1;

          return (
            <span key={page} className="flex items-center gap-2">
              {showEllipsis && <span className="font-poppins text-xs text-ink/35">...</span>}
              <button
                type="button"
                onClick={() => onPageChange(page)}
                className={`min-w-8 rounded-full px-2.5 py-1.5 font-poppins text-[10px] uppercase tracking-[0.08em] transition-colors ${
                  page === safePage
                    ? "bg-falcon-deep text-white"
                    : "border border-ink/15 text-ink/70 hover:border-ink/25 hover:bg-ink/5"
                }`}
              >
                {page}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="rounded-full border border-ink/15 px-3 py-1.5 font-poppins text-[10px] uppercase tracking-[0.08em] text-ink/70 transition-colors hover:border-ink/25 hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
