import { createFileRoute } from "@tanstack/react-router";
import { Plus, Receipt } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { EmptyState, SectionCard, SymbolBadge } from "@/components/brand/financial";
import { TransactionDialog } from "@/routes/app.holdings.$symbol";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { usePortfolio, type TransactionType } from "@/lib/portfolio-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Portfolia" },
      { name: "description", content: "Every buy, sell, dividend and cash movement in your portfolio." },
      { property: "og:title", content: "Transactions — Portfolia" },
      { property: "og:description", content: "A clear history of your portfolio activity." },
    ],
  }),
  component: TransactionsPage,
});

const TYPES: (TransactionType | "ALL")[] = ["ALL", "BUY", "SELL", "DIVIDEND", "CASH"];

const TYPE_CLASS: Record<TransactionType, string> = {
  BUY: "border-positive/30 bg-positive/10 text-positive",
  SELL: "border-negative/30 bg-negative/10 text-negative",
  DIVIDEND: "border-border-brand bg-primary/10 text-primary",
  CASH: "border-border bg-surface text-muted-foreground",
};

function TransactionsPage() {
  const { state, addTransaction } = usePortfolio();
  const [filter, setFilter] = useState<TransactionType | "ALL">("ALL");
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () =>
      [...state.transactions]
        .filter((t) => (filter === "ALL" ? true : t.type === filter))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [state.transactions, filter],
  );

  return (
    <AppShell
      title="Transactions"
      description="Buys, sells, dividends and cash"
      actions={<Button size="sm" onClick={() => setOpen(true)}><Plus /> Add transaction</Button>}
    >
      <SectionCard title="Activity" description={`${rows.length} records`} bodyClassName="p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap gap-1" role="group" aria-label="Filter transactions by type">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={filter === t}
              onClick={() => setFilter(t)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === t
                  ? "border-border-brand bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={<Receipt className="size-6" />}
            title="No transactions yet"
            description="Your buy, sell, dividend and cash activity will appear here."
            primary={<Button onClick={() => setOpen(true)}>Add transaction</Button>}
          />
        ) : (
          <>
            <ul className="space-y-3 md:hidden">
              {rows.map((t) => (
                <li key={t.id} className="glass-surface rounded-md p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <SymbolBadge symbol={t.symbol} />
                      <span className={cn("rounded-full border px-2 py-0.5 text-[0.65rem] font-bold", TYPE_CLASS[t.type])}>
                        {t.type}
                      </span>
                    </span>
                    <span className="num text-sm font-semibold">{formatCurrency(t.quantity * t.price)}</span>
                  </div>
                  <p className="num mt-2 text-xs text-muted-foreground">
                    {formatDate(t.date)} · {formatNumber(t.quantity, 0)} × Rs {formatNumber(t.price)} · fees Rs{" "}
                    {formatNumber(t.fees, 0)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="hidden md:block">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">Transaction history</caption>
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-subtle-foreground">
                    <th scope="col" className="py-2 pr-3 font-medium">Date</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Symbol</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Type</th>
                    <th scope="col" className="py-2 pr-3 text-right font-medium">Quantity</th>
                    <th scope="col" className="py-2 pr-3 text-right font-medium">Price</th>
                    <th scope="col" className="py-2 pr-3 text-right font-medium">Fees</th>
                    <th scope="col" className="py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id} className="border-b border-border/70 hover:bg-surface/60">
                      <td className="py-3 pr-3 text-muted-foreground">{formatDate(t.date)}</td>
                      <td className="py-3 pr-3"><SymbolBadge symbol={t.symbol} /></td>
                      <td className="py-3 pr-3">
                        <span className={cn("rounded-full border px-2 py-0.5 text-[0.65rem] font-bold", TYPE_CLASS[t.type])}>
                          {t.type}
                        </span>
                      </td>
                      <td className="num py-3 pr-3 text-right">{formatNumber(t.quantity, 0)}</td>
                      <td className="num py-3 pr-3 text-right">Rs {formatNumber(t.price)}</td>
                      <td className="num py-3 pr-3 text-right text-muted-foreground">Rs {formatNumber(t.fees, 0)}</td>
                      <td className="num py-3 text-right font-semibold">{formatCurrency(t.quantity * t.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </SectionCard>

      <TransactionDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={(t) => {
          addTransaction(t);
          toast.success(`${t.type} transaction recorded for ${t.symbol}`);
        }}
      />
    </AppShell>
  );
}
