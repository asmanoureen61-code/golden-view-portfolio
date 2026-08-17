import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Plus, Upload, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app/AppShell";
import { HoldingsTable } from "@/components/app/HoldingsTable";
import {
  EmptyState,
  MetricCard,
  PerformanceBadge,
  SectionCard,
  SymbolBadge,
} from "@/components/brand/financial";
import { AllocationDonut, AllocationLegend, PortfolioAreaChart } from "@/components/charts/charts";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatNumber, formatPercent } from "@/lib/format";
import { marketDataService, type Range } from "@/lib/market-data";
import { usePortfolio } from "@/lib/portfolio-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Portfolio overview — Portfolia" },
      {
        name: "description",
        content: "Your portfolio value, invested amount, profit and loss, and allocation at a glance.",
      },
      { property: "og:title", content: "Portfolio overview — Portfolia" },
      { property: "og:description", content: "Value, P/L, allocation and performance in one view." },
    ],
  }),
  component: Overview,
});

const RANGES: Range[] = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

export function RangeTabs({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  return (
    <div role="tablist" aria-label="Chart range" className="flex gap-1 rounded-md border border-border bg-surface p-1">
      {RANGES.map((r) => (
        <button
          key={r}
          role="tab"
          type="button"
          aria-selected={value === r}
          onClick={() => onChange(r)}
          className={cn(
            "rounded-sm px-2.5 py-1 text-xs font-semibold transition-colors",
            value === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

function Overview() {
  const { rows, totals, sectorAllocation, state } = usePortfolio();
  const [range, setRange] = useState<Range>("1Y");

  const history = useMemo(
    () => marketDataService.portfolioHistory(totals.marketValue || 1, range),
    [totals.marketValue, range],
  );

  const ranked = useMemo(
    () => [...rows].filter((r) => r.assetType !== "CASH").sort((a, b) => b.returnPercent - a.returnPercent),
    [rows],
  );
  const gainers = ranked.slice(0, 3);
  const losers = [...ranked].reverse().slice(0, 3);
  const recent = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  if (!rows.length) {
    return (
      <AppShell title="Overview" description="PSX · end-of-day prices">
        <EmptyState
          icon={<Wallet className="size-6" />}
          title="Your portfolio is empty"
          description="Add your first investment to start tracking performance."
          primary={
            <Button asChild>
              <Link to="/app/portfolio/add">Add first holding <ArrowRight /></Link>
            </Button>
          }
          secondary={
            <Button asChild variant="outline">
              <Link to="/app/portfolio">Import CSV</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Overview"
      description={`${state.portfolioName} · PSX end-of-day prices`}
      actions={
        <>
          <Button asChild size="sm">
            <Link to="/app/portfolio/add"><Plus /> Add holding</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/app/portfolio"><Upload /> Import CSV</Link>
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Portfolio value"
          value={totals.marketValue}
          changePercent={totals.dayChangePercent}
          hint="today"
          highlight
        />
        <MetricCard label="Total invested" value={totals.invested} hint="cost basis incl. cash" />
        <MetricCard label="Total profit" value={totals.pnl} hint="unrealised" />
        <MetricCard label="Total return" value={totals.returnPercent} decimals={2} hint="since first buy" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Portfolio performance"
          description={`Portfolio ${totals.returnPercent >= 0 ? "increased" : "decreased"} ${formatPercent(totals.returnPercent)} overall.`}
          action={<RangeTabs value={range} onChange={setRange} />}
        >
          <PortfolioAreaChart data={history} />
        </SectionCard>

        <SectionCard title="Portfolio allocation" description="Share of market value by sector">
          <AllocationDonut data={sectorAllocation} />
          <AllocationLegend data={sectorAllocation} />
        </SectionCard>
      </div>

      <SectionCard
        className="mt-4"
        title="Holdings"
        description={`${rows.length} positions`}
        action={
          <Button asChild variant="ghost" size="sm">
            <Link to="/app/portfolio">View all <ArrowRight /></Link>
          </Button>
        }
        bodyClassName="p-4 sm:p-5 overflow-hidden"
      >
        <HoldingsTable rows={rows.slice(0, 6)} compact />
      </SectionCard>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <SectionCard title="Top gainers" description="By total return">
          <MoverList rows={gainers} />
        </SectionCard>
        <SectionCard title="Top losers" description="By total return">
          <MoverList rows={losers} />
        </SectionCard>
        <SectionCard
          title="Recent transactions"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/transactions">All</Link>
            </Button>
          }
        >
          <ul className="space-y-3">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <SymbolBadge symbol={t.symbol} />
                  <span className="truncate text-xs text-muted-foreground">{formatDate(t.date)}</span>
                </span>
                <span className="num shrink-0 font-semibold">
                  {formatCurrency(t.quantity * t.price)}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard
          title="Watchlist"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/watchlist">Open</Link>
            </Button>
          }
        >
          <ul className="space-y-3">
            {state.watchlist.slice(0, 5).map((sym) => {
              const meta = marketDataService.getMeta(sym);
              return (
                <li key={sym} className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{sym}</span>
                  <span className="flex items-center gap-2">
                    <span className="num text-muted-foreground">Rs {formatNumber(meta?.price ?? 0)}</span>
                    <PerformanceBadge percent={meta?.changePercent ?? 0} />
                  </span>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </div>
    </AppShell>
  );
}

function MoverList({ rows }: { rows: { id: string; symbol: string; company: string; returnPercent: number; pnl: number }[] }) {
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
          <span className="min-w-0">
            <span className="block font-medium">{r.symbol}</span>
            <span className="block truncate text-xs text-muted-foreground">{r.company}</span>
          </span>
          <span className="shrink-0 text-right">
            <PerformanceBadge percent={r.returnPercent} />
            <span className="num mt-1 block text-xs text-muted-foreground">
              {formatCurrency(r.pnl, { sign: true })}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
