import { useNavigate } from "@tanstack/react-router";
import { Check, Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatNumber } from "@/lib/format";
import { marketDataService, type StockMeta } from "@/lib/market-data";
import { usePortfolio, type Holding } from "@/lib/portfolio-store";
import { cn } from "@/lib/utils";

interface Errors {
  stock?: string | undefined;
  quantity?: string | undefined;
  price?: string | undefined;
  date?: string | undefined;
}

export function HoldingForm({
  initial,
  holdingId,
  onSaved,
  submitLabel = "Add holding",
}: {
  initial?: Partial<Holding>;
  holdingId?: string;
  onSaved?: () => void;
  submitLabel?: string;
}) {
  const navigate = useNavigate();
  const { addHolding, updateHolding } = usePortfolio();

  const [query, setQuery] = useState(initial?.symbol ?? "");
  const [picked, setPicked] = useState<StockMeta | undefined>(
    initial?.symbol ? marketDataService.getMeta(initial.symbol) : undefined,
  );
  const [openList, setOpenList] = useState(false);
  const [quantity, setQuantity] = useState(initial?.quantity ? String(initial.quantity) : "");
  const [price, setPrice] = useState(initial?.avgBuyPrice ? String(initial.avgBuyPrice) : "");
  const [date, setDate] = useState(initial?.buyDate ?? "");
  const [fees, setFees] = useState(initial?.fees ? String(initial.fees) : "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return marketDataService
      .listUniverse()
      .filter((s) =>
        q ? s.symbol.toLowerCase().includes(q) || s.company.toLowerCase().includes(q) : true,
      )
      .slice(0, 6);
  }, [query]);

  const investment = (Number(quantity) || 0) * (Number(price) || 0);

  function validate(): boolean {
    const next: Errors = {};
    if (!picked) next.stock = "Select a stock from the list.";
    if (!(Number(quantity) > 0)) next.quantity = "Enter a quantity greater than zero.";
    if (!(Number(price) > 0)) next.price = "Enter the price you paid per share.";
    if (!date) next.date = "Choose the date you bought this holding.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !picked) return;
    setSaving(true);
    const payload = {
      symbol: picked.symbol,
      company: picked.company,
      quantity: Number(quantity),
      avgBuyPrice: Number(price),
      buyDate: date,
      assetType: picked.assetType,
      sector: picked.sector,
      fees: Number(fees) || 0,
      notes,
    };
    if (holdingId) {
      updateHolding(holdingId, payload);
      toast.success(`${picked.symbol} updated`);
    } else {
      addHolding(payload);
      toast.success(`${picked.symbol} added to your portfolio`);
    }
    setSaving(false);
    if (onSaved) onSaved();
    else void navigate({ to: "/app/portfolio" });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <Label htmlFor="stock-search">Stock</Label>
        <div className="relative mt-1.5">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
            aria-hidden="true"
          />
          <Input
            id="stock-search"
            value={query}
            autoComplete="off"
            aria-describedby={errors.stock ? "stock-error" : undefined}
            aria-invalid={Boolean(errors.stock)}
            onFocus={() => setOpenList(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setPicked(undefined);
              setOpenList(true);
            }}
            placeholder="Search symbol or company, e.g. ENGRO"
            className="pl-9"
          />
          {openList && !picked && (
            <ul className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-md border border-border-strong bg-popover p-1 shadow-elevated">
              {results.length === 0 && (
                <li className="px-3 py-2 text-sm text-muted-foreground">No PSX match found.</li>
              )}
              {results.map((s) => (
                <li key={s.symbol}>
                  <button
                    type="button"
                    onClick={() => {
                      setPicked(s);
                      setQuery(`${s.symbol} — ${s.company}`);
                      setOpenList(false);
                      setErrors((p) => ({ ...p, stock: undefined }));
                    }}
                    className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    <span className="w-20 shrink-0 font-semibold">{s.symbol}</span>
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">{s.company}</span>
                    <span className="num shrink-0 text-xs">Rs {formatNumber(s.price)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {picked && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-positive">
            <Check className="size-3.5" aria-hidden="true" />
            {picked.company} · {picked.exchange} · last Rs {formatNumber(picked.price)}
          </p>
        )}
        {errors.stock && (
          <p id="stock-error" className="mt-1.5 text-xs text-negative">{errors.stock}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="quantity" label="Quantity" error={errors.quantity}>
          <Input
            id="quantity"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="100"
          />
        </Field>
        <Field id="price" label="Buy price (PKR)" error={errors.price}>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-subtle-foreground">
              Rs
            </span>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="320"
              className="pl-9"
            />
          </div>
        </Field>
        <Field id="buy-date" label="Buy date" error={errors.date}>
          <Input id="buy-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field id="fees" label="Fees (optional)">
          <Input
            id="fees"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={fees}
            onChange={(e) => setFees(e.target.value)}
            placeholder="0"
          />
        </Field>
      </div>

      <Field id="notes" label="Notes (optional)">
        <Textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Why you bought this holding"
        />
      </Field>

      <div
        className={cn(
          "glass-surface flex flex-wrap items-center justify-between gap-2 rounded-md p-4",
          investment > 0 && "brand-edge",
        )}
      >
        <span className="text-sm text-muted-foreground">
          Investment value
          <span className="num ml-2 text-xs text-subtle-foreground">
            {formatNumber(Number(quantity) || 0, 0)} × Rs {formatNumber(Number(price) || 0)}
          </span>
        </span>
        <span className="num text-lg font-semibold text-primary">{formatCurrency(investment)}</span>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate({ to: "/app/portfolio" })}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="animate-spin" />} {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1.5 text-xs text-negative">{error}</p>}
    </div>
  );
}
