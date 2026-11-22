"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText, Search } from "lucide-react";

type TopPage = { path: string; views: number; avgActiveTimeSec: number };

const PAGE_SIZE = 10;

/**
 * Dashboard "Top pages" table: search by path + 10 rows per page.
 * Data is already loaded with the analytics summary, so filtering and paging happen in the browser.
 */
export default function TopPagesTable({
  pages,
  tr,
  fmtSec,
  formatNumber,
}: {
  pages: TopPage[];
  tr: (key: string, params?: Record<string, string | number>) => string;
  fmtSec: (sec: number) => string;
  formatNumber: (n: number) => string;
}) {
  const [query, setQuery] = useState("");
  const [pageState, setPage] = useState(1);

  const q = query.trim().toLowerCase();
  // Keep each page's overall rank even while searching.
  const ranked = pages.map((p, i) => ({ ...p, rank: i + 1 }));
  const rows = q ? ranked.filter((p) => p.path.toLowerCase().includes(q)) : ranked;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(pageState, totalPages); // stays valid when the date range changes
  const visible = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const maxViews = pages[0]?.views || 1;
  const from = rows.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(page * PAGE_SIZE, rows.length);

  const level = (sec: number) => (sec > 120 ? "high" : sec > 60 ? "medium" : "low");
  const dot = { high: "bg-emerald-500", medium: "bg-amber-400", low: "bg-muted-foreground/40" } as const;

  return (
    <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/20 p-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">{tr("topPages.title")}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {tr("topPages.sortedBy")} · {tr("topPages.count", { count: formatNumber(pages.length) })}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={tr("topPages.search")}
            aria-label={tr("topPages.search")}
            maxLength={200}
            className="h-9 w-full rounded-lg border border-input bg-background ps-9 pe-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/20 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-3 text-start font-medium">{tr("topPages.path")}</th>
              <th className="px-6 py-3 text-start font-medium">{tr("topPages.views")}</th>
              <th className="px-6 py-3 text-start font-medium">{tr("topPages.avgActiveTime")}</th>
              <th className="px-6 py-3 text-start font-medium">{tr("topPages.engagement")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.length ? (
              visible.map((p) => {
                const lv = level(p.avgActiveTimeSec);
                return (
                  <tr key={p.path} className="transition-colors hover:bg-muted/20">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                          {p.rank}
                        </span>
                        <span className="max-w-xs truncate font-medium text-foreground" title={p.path} dir="ltr">
                          {p.path}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-10 font-semibold tabular-nums text-foreground">{formatNumber(p.views)}</span>
                        <div className="h-2 w-24 rounded-full bg-muted">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, (p.views / maxViews) * 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 tabular-nums text-foreground">{fmtSec(p.avgActiveTimeSec)}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <span className={`size-2.5 rounded-full ${dot[lv]}`} />
                        {tr(`topPages.${lv}`)}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                      <FileText className="size-5" aria-hidden />
                    </span>
                    <p>{q ? tr("topPages.noMatch") : tr("topPages.empty")}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-3 text-xs text-muted-foreground">
          <p aria-live="polite">{tr("topPages.showing", { from, to, total: rows.length })}</p>
          {totalPages > 1 && (
            <nav className="flex items-center gap-1" aria-label={tr("topPages.pagination")}>
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                aria-label={tr("topPages.previous")}
                className="flex size-8 items-center justify-center rounded-lg border border-border bg-card transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .map((n, i, arr) => (
                  <span key={n} className="flex items-center gap-1">
                    {i > 0 && n - arr[i - 1] > 1 && <span className="px-1">…</span>}
                    <button
                      type="button"
                      onClick={() => setPage(n)}
                      aria-current={n === page ? "page" : undefined}
                      className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 font-medium tabular-nums transition ${
                        n === page
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      {n}
                    </button>
                  </span>
                ))}
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                aria-label={tr("topPages.next")}
                className="flex size-8 items-center justify-center rounded-lg border border-border bg-card transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
