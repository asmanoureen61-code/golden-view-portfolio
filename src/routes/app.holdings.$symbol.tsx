import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, Bell, Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { HoldingForm } from "@/components/app/HoldingForm";
import { PerformanceBadge, PriceChange, SectionCard } from "@/components/brand/financial";
import { PriceLineChart } from "@/components/charts/charts";
import { RangeTabs } from "@/routes/app.index";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { marketDataService, type Range } from "@/lib/market-data";
import { usePortfolio, type TransactionType } from "@/lib/portfolio-store";

export const Route = createFileRoute("/app/holdings/$symbol")({
  loader: ({ params }) => {
    const meta = marketDataService.getMeta(params.symbol);
    if (!meta) throw notFound();
    return { symbol: meta.symbol, company: meta.company };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Holding unavailable — Portfolia" }, { name: "robots", content: "noindex" }] };
    }
    const t = `${loaderData.symbol} · ${loaderData.company} — Portfolia`;
    return {
      meta: [
        { title: t },
        { name: "description", content: `Position summary, performance and transactions for ${loaderData.company}.` },
        { property: "og:title", content: t },
        { property: "og:description", content: `Track your ${loaderData.symbol} position on PSX.` },
      ],
    };
  },
  notFoundComponent: () => (
    <AppShell title="Stock not found">
      <p className="text-sm text-muted-foreground">
        That symbol isn't in the PSX universe we track yet.
      </p>
      <Button asChild className="mt-4">
        <Link to="/app/portfolio">Back to portfolio</Link>
      </Button>
    </AppShell>
  ),
  component: HoldingDetail,
});

function HoldingDetail() {
  const { symbol } = Route.useParams();
  const { rows, state, addTransaction, addAlert } = usePortfolio();
  const [range, setRange] = useState<Range>("1Y");
  const [editOpen, setEditOpen] = useState(false);
  const [txOpen, setTxOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const meta = marketDataService.getMeta(symbol)!;
  const row = rows.find((r) => r.symbol === symbol);
  const history = useMemo(() => {
    const points = marketDataService.sparkline(symbol);
    const scale = meta.price / (points[points.length - 1] ?? 1);
    return points.map((v, i) => ({ date: `T-${points.length - i}`, value: Number((v * scale).toFixed(2)) }));
  }, [symbol, meta.price, range]);

  const txs = state.transactions.filter((t) => t.symbol === symbol);

  return (
    <AppShell
      title={`${meta.company} (${meta.symbol})`}
      description={`${meta.exchange} · ${meta.sector}`}
      actions={
        <>
          <Button asChild variant="ghost" size="sm">
            <Link to="/app/portfolio"><ArrowLeft /> Portfolio</Link>
          </Button>
          <Button size="sm" onClick={() => setTxOpen(true)}><Plus /> Add transaction</Button>
          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} disabled={!row}>
            <Pencil /> Edit holding
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAlertOpen(true)}><Bell /> Add alert</Button>
        </>
      }
    >
      <div className="glass-surface flex flex-wrap items-center gap-4 rounded-lg p-5">
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-xl border border-border-brand bg-surface text-sm font-bold text-primary"
        >
          {meta.symbol.slice(0, 3)}
        </span>
        <div className="min-w-0">
          <p className="text-lg font-semibold">{meta.company}</p>
          <p className="text-xs text-muted-foreground">{meta.symbol} · {meta.exchange}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="num text-metric-xl">Rs {formatNumber(meta.price)}</p>
          <PriceChange percent={meta.changePercent} className="mt-1" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Performance"
          description={`${meta.symbol} moved ${meta.changePercent >= 0 ? "up" : "down"} ${Math.abs(meta.changePercent).toFixed(2)}% on the last session.`}
          action={<RangeTabs value={range} onChange={setRange} />}
        >
          <PriceLineChart data={history} />
        </SectionCard>

        <SectionCard title="Position summary">
          {row ? (
            <dl className="space-y-3 text-sm">
              <Row label="Quantity" value={formatNumber(row.quantity, 0)} />
              <Row label="Average buy price" value={`Rs ${formatNumber(row.avgBuyPrice)}`} />
              <Row label="Current price" value={`Rs ${formatNumber(row.currentPrice)}`} />
              <Row label="Cost basis" value={formatCurrency(row.costBasis)} />
              <Row label="Market value" value={formatCurrency(row.marketValue)} />
              <Row
                label="Profit / loss"
                value={formatCurrency(row.pnl, { sign: true })}
                tone={row.pnl >= 0 ? "positive" : "negative"}
              />
              <div className="flex items-center justify-between pt-1">
                <dt className="text-muted-foreground">Return</dt>
                <dd><PerformanceBadge percent={row.returnPercent} /></dd>
              </div>
            </dl>
          ) : (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>You don't hold {meta.symbol} yet.</p>
              <Button asChild size="sm"><Link to="/app/portfolio/add">Add this holding</Link></Button>
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard className="mt-4" title="Transactions" description={`${txs.length} recorded`}>
        {txs.length ? (
          <ul className="divide-y divide-border text-sm">
            {txs.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <span className="w-24 text-xs font-semibold uppercase tracking-wide text-primary">
                  {t.type}
                </span>
                <span className="text-muted-foreground">{formatDate(t.date)}</span>
                <span className="num ml-auto">
                  {formatNumber(t.quantity, 0)} × Rs {formatNumber(t.price)}
                </span>
                <span className="num w-32 text-right font-semibold">
                  {formatCurrency(t.quantity * t.price)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No transactions yet. Your buy, sell, dividend and cash activity will appear here.
          </p>
        )}
      </SectionCard>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit {meta.symbol}</DialogTitle>
            <DialogDescription>Update quantity, average price or notes.</DialogDescription>
          </DialogHeader>
          {row && (
            <HoldingForm
              initial={row}
              holdingId={row.id}
              submitLabel="Save changes"
              onSaved={() => setEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <TransactionDialog
        open={txOpen}
        onOpenChange={setTxOpen}
        symbol={meta.symbol}
        defaultPrice={meta.price}
        onSubmit={(t) => {
          addTransaction(t);
          toast.success(`${t.type} transaction recorded for ${meta.symbol}`);
        }}
      />

      <AlertDialogForm
        open={alertOpen}
        onOpenChange={setAlertOpen}
        symbol={meta.symbol}
        onSubmit={(a) => {
          addAlert(a);
          toast.success(`Alert created for ${meta.symbol}`);
        }}
      />
    </AppShell>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={
          tone === "positive" ? "num font-semibold text-positive" : tone === "negative" ? "num font-semibold text-negative" : "num font-semibold"
        }
      >
        {value}
      </dd>
    </div>
  );
}

export function TransactionDialog({
  open,
  onOpenChange,
  symbol,
  defaultPrice,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  symbol?: string;
  defaultPrice?: number;
  onSubmit: (t: {
    symbol: string;
    type: TransactionType;
    quantity: number;
    price: number;
    fees: number;
    date: string;
  }) => void;
}) {
  const universe = marketDataService.listUniverse();
  const [sym, setSym] = useState(symbol ?? universe[0]!.symbol);
  const [type, setType] = useState<TransactionType>("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(defaultPrice ? String(defaultPrice) : "");
  const [fees, setFees] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add transaction</DialogTitle>
          <DialogDescription>Record a buy, sell, dividend or cash movement.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!(Number(quantity) > 0) || !(Number(price) > 0) || !date) {
              setError("Quantity, price and date are required.");
              return;
            }
            onSubmit({
              symbol: sym,
              type,
              quantity: Number(quantity),
              price: Number(price),
              fees: Number(fees) || 0,
              date,
            });
            setError("");
            setQuantity("");
            onOpenChange(false);
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tx-symbol">Symbol</Label>
              <Select value={sym} onValueChange={setSym}>
                <SelectTrigger id="tx-symbol" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {universe.map((s) => (
                    <SelectItem key={s.symbol} value={s.symbol}>{s.symbol}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tx-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
                <SelectTrigger id="tx-type" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["BUY", "SELL", "DIVIDEND", "CASH"] as TransactionType[]).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tx-qty">Quantity</Label>
              <Input id="tx-qty" type="number" min="0" step="any" className="mt-1.5" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tx-price">Price (Rs)</Label>
              <Input id="tx-price" type="number" min="0" step="any" className="mt-1.5" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tx-fees">Fees</Label>
              <Input id="tx-fees" type="number" min="0" step="any" className="mt-1.5" value={fees} onChange={(e) => setFees(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tx-date">Date</Label>
              <Input id="tx-date" type="date" className="mt-1.5" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-xs text-negative">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AlertDialogForm({
  open,
  onOpenChange,
  symbol,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  symbol?: string;
  onSubmit: (a: { symbol: string; condition: "ABOVE" | "BELOW" | "MOVE"; target: number; active: boolean }) => void;
}) {
  const universe = marketDataService.listUniverse().filter((s) => s.assetType !== "CASH");
  const [sym, setSym] = useState(symbol ?? universe[0]!.symbol);
  const [condition, setCondition] = useState<"ABOVE" | "BELOW" | "MOVE">("ABOVE");
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create price alert</DialogTitle>
          <DialogDescription>
            Example: notify me when ENGRO goes above Rs 360.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!(Number(target) > 0)) {
              setError("Enter a target value greater than zero.");
              return;
            }
            onSubmit({ symbol: sym, condition, target: Number(target), active: true });
            setError("");
            setTarget("");
            onOpenChange(false);
          }}
        >
          <div>
            <Label htmlFor="alert-symbol">Stock</Label>
            <Select value={sym} onValueChange={setSym}>
              <SelectTrigger id="alert-symbol" className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {universe.map((s) => (
                  <SelectItem key={s.symbol} value={s.symbol}>{s.symbol} — {s.company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="alert-condition">Condition</Label>
            <Select value={condition} onValueChange={(v) => setCondition(v as "ABOVE" | "BELOW" | "MOVE")}>
              <SelectTrigger id="alert-condition" className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ABOVE">Price above</SelectItem>
                <SelectItem value="BELOW">Price below</SelectItem>
                <SelectItem value="MOVE">Daily move greater than</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="alert-target">
              {condition === "MOVE" ? "Percentage move (%)" : "Target price (Rs)"}
            </Label>
            <Input
              id="alert-target"
              type="number"
              min="0"
              step="any"
              className="mt-1.5"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          {error && <p className="text-xs text-negative">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Create alert</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
