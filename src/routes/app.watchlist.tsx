import { Link, createFileRoute } from "@tanstack/react-router";
import { Eye, Star, StarOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { EmptyState, PriceChange, SectionCard, SymbolBadge } from "@/components/brand/financial";
import { Sparkline } from "@/components/charts/charts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/format";
import { marketDataService } from "@/lib/market-data";
import { usePortfolio } from "@/lib/portfolio-store";

export const Route = createFileRoute("/app/watchlist")({
  head: () => ({
    meta: [
      { title: "Watchlist — Portfolia" },
      { name: "description", content: "Track PSX stocks you're considering before you commit capital." },
      { property: "og:title", content: "Watchlist — Portfolia" },
      { property: "og:description", content: "Monitor PSX symbols in one focused list." },
    ],
  }),
  component: WatchlistPage,
});

function WatchlistPage() {
  const { state, toggleWatch } = usePortfolio();
  const [query, setQuery] = useState("");

  const watched = state.watchlist
    .map((s) => marketDataService.getMeta(s))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  const suggestions = marketDataService
    .listUniverse()
    .filter(
      (s) =>
        s.assetType !== "CASH" &&
        !state.watchlist.includes(s.symbol) &&
        (query.trim() === "" ||
          s.symbol.toLowerCase().includes(query.toLowerCase()) ||
          s.company.toLowerCase().includes(query.toLowerCase())),
    )
    .slice(0, 8);

  return (
    <AppShell title="Watchlist" description="Stocks you're keeping an eye on">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Watching"
          description={`${watched.length} symbols`}
          bodyClassName="p-4 sm:p-5"
        >
          {watched.length === 0 ? (
            <EmptyState
              icon={<Eye className="size-6" />}
              title="Nothing on the watchlist"
              description="Add symbols from the panel beside this to follow their price action."
            />
          ) : (
            <ul className="space-y-2">
              {watched.map((s) => (
                <li
                  key={s.symbol}
                  className="glass-surface flex flex-wrap items-center gap-3 rounded-md p-3.5"
                >
                  <Link
                    to="/app/holdings/$symbol"
                    params={{ symbol: s.symbol }}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <SymbolBadge symbol={s.symbol} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{s.company}</span>
                      <span className="block text-xs text-muted-foreground">{s.sector}</span>
                    </span>
                  </Link>
                  <span className="hidden w-24 sm:block">
                    <Sparkline values={marketDataService.sparkline(s.symbol)} positive={s.changePercent >= 0} />
                  </span>
                  <span className="text-right">
                    <span className="num block text-sm font-semibold">Rs {formatNumber(s.price)}</span>
                    <PriceChange percent={s.changePercent} className="justify-end" />
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Remove ${s.symbol} from watchlist`}
                    onClick={() => {
                      toggleWatch(s.symbol);
                      toast.success(`${s.symbol} removed from watchlist`);
                    }}
                  >
                    <StarOff />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Add symbols" description="Search the PSX universe" bodyClassName="p-4 sm:p-5">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search e.g. HBL, Systems"
            aria-label="Search PSX symbols"
          />
          <ul className="mt-3 space-y-1.5">
            {suggestions.map((s) => (
              <li key={s.symbol} className="flex items-center gap-2 rounded-md px-1 py-1.5">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{s.symbol}</span>
                  <span className="block truncate text-xs text-muted-foreground">{s.company}</span>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toggleWatch(s.symbol);
                    toast.success(`${s.symbol} added to watchlist`);
                  }}
                >
                  <Star /> Watch
                </Button>
              </li>
            ))}
            {suggestions.length === 0 && (
              <li className="py-4 text-center text-sm text-muted-foreground">No matches.</li>
            )}
          </ul>
        </SectionCard>
      </div>
    </AppShell>
  );
}
