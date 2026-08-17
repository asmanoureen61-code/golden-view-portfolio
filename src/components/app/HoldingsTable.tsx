import { Link } from "@tanstack/react-router";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PerformanceBadge, PriceChange, SymbolBadge } from "@/components/brand/financial";
import { formatCurrency, formatNumber } from "@/lib/format";
import { usePortfolio, type HoldingRow } from "@/lib/portfolio-store";

export function HoldingsTable({
  rows,
  compact = false,
}: {
  rows: HoldingRow[];
  compact?: boolean;
}) {
  const { removeHolding } = usePortfolio();

  return (
    <>
      {/* Mobile: cards, never a horizontally scrolling table */}
      <ul className="space-y-3 md:hidden">
        {rows.map((r) => (
          <li key={r.id}>
            <Link
              to="/app/holdings/$symbol"
              params={{ symbol: r.symbol }}
              className="glass-surface flex items-center gap-3 rounded-md p-4 transition-colors hover:border-border-strong"
            >
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  {r.symbol}
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {r.company}
                  </span>
                </p>
                <p className="num mt-1 text-xs text-muted-foreground">
                  {formatNumber(r.quantity, 0)} × Rs {formatNumber(r.avgBuyPrice)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="num text-sm font-semibold">{formatCurrency(r.marketValue)}</p>
                <PriceChange percent={r.returnPercent} className="mt-1" />
              </div>
              <ChevronRight className="size-4 shrink-0 text-subtle-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden md:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Holdings with quantity, average buy price, current price, market value, profit or loss
            and allocation.
          </caption>
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-subtle-foreground">
              <th scope="col" className="py-2 pr-3 font-medium">Company</th>
              <th scope="col" className="py-2 pr-3 font-medium">Symbol</th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">Qty</th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">Avg buy</th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">Current</th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">Market value</th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">P/L</th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">Return</th>
              {!compact && (
                <th scope="col" className="py-2 pr-3 text-right font-medium">Allocation</th>
              )}
              <th scope="col" className="py-2 text-right font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/70 transition-colors hover:bg-surface/60">
                <td className="py-3 pr-3">
                  <Link
                    to="/app/holdings/$symbol"
                    params={{ symbol: r.symbol }}
                    className="font-medium hover:text-primary"
                  >
                    {r.company}
                  </Link>
                </td>
                <td className="py-3 pr-3"><SymbolBadge symbol={r.symbol} /></td>
                <td className="num py-3 pr-3 text-right">{formatNumber(r.quantity, 0)}</td>
                <td className="num py-3 pr-3 text-right">{formatNumber(r.avgBuyPrice)}</td>
                <td className="num py-3 pr-3 text-right">{formatNumber(r.currentPrice)}</td>
                <td className="num py-3 pr-3 text-right font-semibold">
                  {formatCurrency(r.marketValue)}
                </td>
                <td className="num py-3 pr-3 text-right">
                  <span className={r.pnl >= 0 ? "text-positive" : "text-negative"}>
                    {formatCurrency(r.pnl, { sign: true })}
                  </span>
                </td>
                <td className="py-3 pr-3 text-right">
                  <PerformanceBadge percent={r.returnPercent} />
                </td>
                {!compact && (
                  <td className="py-3 pr-3 text-right">
                    <span className="num text-xs text-muted-foreground">
                      {r.allocation.toFixed(1)}%
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-surface"
                    >
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(r.allocation, 100)}%` }}
                      />
                    </span>
                  </td>
                )}
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" aria-label={`Edit ${r.symbol}`}>
                      <Link to="/app/holdings/$symbol" params={{ symbol: r.symbol }}>
                        <Pencil />
                      </Link>
                    </Button>
                    {!compact && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${r.symbol}`}
                        onClick={() => {
                          removeHolding(r.id);
                          toast.success(`${r.symbol} removed from your portfolio`);
                        }}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
