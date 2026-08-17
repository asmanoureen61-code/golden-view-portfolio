import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { AppShell } from "@/components/app/AppShell";
import { MetricCard, PerformanceBadge, SectionCard, SymbolBadge } from "@/components/brand/financial";
import { AllocationDonut, AllocationLegend, SectorBarChart } from "@/components/charts/charts";
import { formatCurrency, formatPercent } from "@/lib/format";
import { usePortfolio } from "@/lib/portfolio-store";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Portfolia" },
      { name: "description", content: "Sector exposure, concentration and contribution analysis for your PSX portfolio." },
      { property: "og:title", content: "Analytics — Portfolia" },
      { property: "og:description", content: "Understand what is actually driving your returns." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { rows, totals, sectorAllocation, assetAllocation } = usePortfolio();

  const contributions = useMemo(
    () =>
      [...rows]
        .map((r) => ({
          symbol: r.symbol,
          company: r.company,
          pnl: r.pnl,
          share: totals.pnl !== 0 ? (r.pnl / totals.pnl) * 100 : 0,
          returnPercent: r.returnPercent,
        }))
        .sort((a, b) => b.pnl - a.pnl),
    [rows, totals.pnl],
  );

  const top = [...rows].sort((a, b) => b.allocation - a.allocation);
  const concentration = top.slice(0, 3).reduce((sum, r) => sum + r.allocation, 0);
  const sectorCount = sectorAllocation.length;
  const largest = top[0];

  return (
    <AppShell title="Analytics" description="Exposure, concentration and contribution">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Portfolio value" value={totals.marketValue} />
        <StatCard
          label="Top 3 concentration"
          value={formatPercent(concentration)}
          hint="Share of value in your three largest positions"
        />
        <StatCard label="Sectors held" value={String(sectorCount)} hint="Diversification breadth" />
        <StatCard
          label="Largest position"
          value={largest ? largest.symbol : "—"}
          hint={largest ? `${formatPercent(largest.allocation)} of portfolio` : "No holdings yet"}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard title="Sector exposure" description="Where your capital sits">
          <SectorBarChart data={sectorAllocation} />
        </SectionCard>
        <SectionCard title="Asset mix" description="Stocks, ETFs and cash">
          <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
            <AllocationDonut data={assetAllocation} />
            <AllocationLegend data={assetAllocation} />
          </div>
        </SectionCard>
      </div>

      <SectionCard
        className="mt-4"
        title="Profit contribution"
        description="Which holdings move your bottom line"
        bodyClassName="p-4 sm:p-5"
      >
        <ul className="space-y-2.5">
          {contributions.map((c) => {
            const width = Math.min(Math.abs(c.share), 100);
            return (
              <li key={c.symbol} className="flex flex-wrap items-center gap-3">
                <SymbolBadge symbol={c.symbol} />
                <span className="hidden min-w-0 flex-1 truncate text-sm text-muted-foreground sm:block">
                  {c.company}
                </span>
                <span className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-surface sm:w-40">
                  <span
                    className={c.pnl >= 0 ? "block h-full rounded-full bg-positive" : "block h-full rounded-full bg-negative"}
                    style={{ width: `${width}%` }}
                  />
                </span>
                <span className="num w-32 text-right text-sm font-semibold">
                  {formatCurrency(c.pnl, { sign: true })}
                </span>
                <PerformanceBadge percent={c.returnPercent} />
              </li>
            );
          })}
        </ul>
      </SectionCard>
    </AppShell>
  );
}
