import { AlertTriangle, CheckCircle2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatNumber } from "@/lib/format";
import { marketDataService } from "@/lib/market-data";
import { usePortfolio } from "@/lib/portfolio-store";
import { cn } from "@/lib/utils";

interface ParsedRow {
  symbol: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  error?: string | undefined;
}

const SAMPLE_CSV = `symbol,quantity,buy_price,buy_date
ENGRO,100,320,2025-03-14
MEBL,250,208.5,2025-01-22`;

function parseCsv(text: string): ParsedRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const header = (lines[0] ?? "").toLowerCase();
  const start = header.includes("symbol") ? 1 : 0;
  return lines.slice(start).map((line) => {
    const [symbol = "", qty = "", price = "", date = ""] = line.split(",").map((c) => c.trim());
    const quantity = Number(qty);
    const buyPrice = Number(price);
    const meta = marketDataService.getMeta(symbol);
    let error: string | undefined;
    if (!symbol) error = "Missing symbol";
    else if (!meta) error = "Symbol not found on PSX";
    else if (!Number.isFinite(quantity) || quantity <= 0) error = "Quantity must be a positive number";
    else if (!Number.isFinite(buyPrice) || buyPrice <= 0) error = "Buy price must be a positive number";
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) error = "Buy date must be YYYY-MM-DD";
    return { symbol: symbol.toUpperCase(), quantity, buyPrice, buyDate: date, error };
  });
}

export function CsvImportDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported?: () => void;
}) {
  const { addHoldings } = usePortfolio();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");

  const valid = rows.filter((r) => !r.error);
  const invalid = rows.filter((r) => r.error);

  async function handleFile(file: File) {
    setFileName(file.name);
    setRows(parseCsv(await file.text()));
  }

  function confirm() {
    addHoldings(
      valid.map((r) => {
        const meta = marketDataService.getMeta(r.symbol)!;
        return {
          symbol: r.symbol,
          company: meta.company,
          quantity: r.quantity,
          avgBuyPrice: r.buyPrice,
          buyDate: r.buyDate,
          assetType: meta.assetType,
          sector: meta.sector,
        };
      }),
    );
    toast.success(
      invalid.length
        ? `${valid.length} holdings imported, ${invalid.length} need attention`
        : `${valid.length} holdings imported successfully`,
    );
    setRows([]);
    setFileName("");
    onOpenChange(false);
    onImported?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import holdings from CSV</DialogTitle>
          <DialogDescription>
            Columns: symbol, quantity, buy_price, buy_date (YYYY-MM-DD). We preview every row before
            anything is added.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="csv-file">CSV file</Label>
            <input
              id="csv-file"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
              className="mt-1.5 block w-full cursor-pointer rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-muted-foreground file:mr-3 file:rounded-sm file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground"
            />
            {fileName && <p className="mt-1.5 text-xs text-muted-foreground">Loaded {fileName}</p>}
          </div>

          <details className="rounded-md border border-border bg-surface/60 p-3 text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium text-foreground">Expected format</summary>
            <pre className="mt-2 overflow-x-auto whitespace-pre text-[0.7rem]">{SAMPLE_CSV}</pre>
          </details>

          {rows.length > 0 && (
            <div className="rounded-md border border-border">
              <div className="flex flex-wrap items-center gap-3 border-b border-border px-3 py-2 text-xs">
                <span className="flex items-center gap-1.5 text-positive">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" /> {valid.length} ready
                </span>
                {invalid.length > 0 && (
                  <span className="flex items-center gap-1.5 text-negative">
                    <AlertTriangle className="size-3.5" aria-hidden="true" /> {invalid.length} need attention
                  </span>
                )}
              </div>
              <ul className="max-h-64 divide-y divide-border overflow-y-auto text-sm">
                {rows.map((r, i) => (
                  <li
                    key={`${r.symbol}-${i}`}
                    className={cn("flex flex-wrap items-center gap-2 px-3 py-2", r.error && "bg-negative/5")}
                  >
                    <span className="w-20 font-semibold">{r.symbol || "—"}</span>
                    <span className="num text-muted-foreground">
                      {Number.isFinite(r.quantity) ? formatNumber(r.quantity, 0) : "—"} ×{" "}
                      Rs {Number.isFinite(r.buyPrice) ? formatNumber(r.buyPrice) : "—"}
                    </span>
                    <span className="text-xs text-subtle-foreground">{r.buyDate || "—"}</span>
                    {r.error && <span className="ml-auto text-xs text-negative">{r.error}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={confirm} disabled={!valid.length}>
            <Upload /> Import {valid.length || ""} holdings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
