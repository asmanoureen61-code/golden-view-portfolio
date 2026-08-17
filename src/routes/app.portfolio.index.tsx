import { Link, createFileRoute } from "@tanstack/react-router";
import { Download, Plus, Upload, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { HoldingsTable } from "@/components/app/HoldingsTable";
import { CsvImportDialog } from "@/components/app/CsvImportDialog";
import { EmptyState, MetricCard, SectionCard } from "@/components/brand/financial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePortfolio } from "@/lib/portfolio-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/portfolio/")({
  head: () => ({
    meta: [
      { title: "My portfolio — Portfolia" },
      { name: "description", content: "All holdings with market value, profit and loss, and allocation." },
      { property: "og:title", content: "My portfolio — Portfolia" },
      { property: "og:description", content: "Filter, sort and manage every holding in your portfolio." },
    ],
  }),
  component: PortfolioPage,
});

const FILTERS = ["All", "Stocks", "ETFs", "Cash"] as const;
type Filter = (typeof FILTERS)[number];
type SortKey = "marketValue" | "returnPercent" | "pnl" | "allocation" | "company";

const SORT_LABELS: Record<SortKey, string> = {
  marketValue: "Market value",
  returnPercent: "Return %",
  pnl: "Profit / loss",
  allocation: "Allocation",
  company: "Name",
};

function PortfolioPage() {
  const { rows, totals } = usePortfolio();
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("marketValue");
  const [importOpen, setImportOpen] = useState(false);

  const visible = useMemo(() => {
    const map: Record<Filter, string | null> = { All: null, Stocks: "STOCK", ETFs: "ETF", Cash: "CASH" };
    const type = map[filter];
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => (type ? r.assetType === type : true))
      .filter((r) => (q ? r.symbol.toLowerCase().includes(q) || r.company.toLowerCase().includes(q) : true))
      .sort((a, b) =>
        sort === "company" ? a.company.localeCompare(b.company) : (b[sort] as number) - (a[sort] as number),
      );
  }, [rows, filter, query, sort]);

  function exportCsv() {
    const header = "symbol,company,quantity,avg_buy_price,current_price,market_value,pnl,return_percent";
    const body = rows
      .map((r) =>
        [r.symbol, r.company, r.quantity, r.avgBuyPrice, r.currentPrice, Math.round(r.marketValue), Math.round(r.pnl), r.returnPercent.toFixed(2)].join(","),
      )
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolia-holdings.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Portfolio exported as CSV");
  }

  return (
    <AppShell
      title="My portfolio"
      description="Holdings, allocation and performance"
      actions={
        <>
          <Button asChild size="sm">
            <Link to="/app/portfolio/add"><Plus /> Add holding</Link>
          </Button>
          <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
            <Upload /> Import CSV
          </Button>
          <Button size="sm" variant="ghost" onClick={exportCsv}>
            <Download /> Export
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Portfolio value" value={totals.marketValue} changePercent={totals.dayChangePercent} highlight />
        <MetricCard label="Total invested" value={totals.invested} />
        <MetricCard label="Total profit" value={totals.pnl} />
        <MetricCard label="Total return" value={totals.returnPercent} decimals={2} />
      </div>

      <SectionCard
        className="mt-4"
        title="Holdings"
        description={`${visible.length} of ${rows.length} shown`}
        bodyClassName="p-4 sm:p-5"
      >
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by asset type">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  filter === f
                    ? "border-border-brand bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="min-w-[180px] flex-1">
            <Label htmlFor="holdings-search" className="text-xs text-muted-foreground">
              Search holdings
            </Label>
            <Input
              id="holdings-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ENGRO, Meezan Bank…"
              className="mt-1"
            />
          </div>
          <div className="w-[170px]">
            <Label htmlFor="holdings-sort" className="text-xs text-muted-foreground">Sort by</Label>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger id="holdings-sort" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <SelectItem key={k} value={k}>{SORT_LABELS[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {visible.length ? (
          <HoldingsTable rows={visible} />
        ) : (
          <EmptyState
            icon={<Wallet className="size-6" />}
            title={rows.length ? "No holdings match those filters" : "Your portfolio is empty"}
            description={
              rows.length
                ? "Try clearing the search or switching back to All."
                : "Add your first investment to start tracking performance."
            }
            primary={
              <Button asChild>
                <Link to="/app/portfolio/add">Add first holding</Link>
              </Button>
            }
            secondary={
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                Import CSV
              </Button>
            }
          />
        )}
      </SectionCard>

      <CsvImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </AppShell>
  );
}
