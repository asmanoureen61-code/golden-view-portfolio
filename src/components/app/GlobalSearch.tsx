import { useNavigate } from "@tanstack/react-router";
import { Eye, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { marketDataService } from "@/lib/market-data";
import { usePortfolio } from "@/lib/portfolio-store";
import { formatNumber } from "@/lib/format";
import { PerformanceBadge } from "@/components/brand/financial";

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const { state, toggleWatch } = usePortfolio();
  const universe = marketDataService.listUniverse().filter((s) => s.assetType !== "CASH");

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search by symbol or company…" />
      <CommandList>
        <CommandEmpty>No stocks matched that search.</CommandEmpty>
        <CommandGroup heading="PSX listings">
          {universe.map((s) => (
            <CommandItem
              key={s.symbol}
              value={`${s.symbol} ${s.company}`}
              onSelect={() => {
                onOpenChange(false);
                navigate({ to: "/app/holdings/$symbol", params: { symbol: s.symbol } });
              }}
              className="gap-3"
            >
              <span className="w-20 shrink-0 text-xs font-bold tracking-wide">{s.symbol}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                {s.company} · {s.exchange}
              </span>
              <span className="num text-sm">Rs {formatNumber(s.price)}</span>
              <PerformanceBadge percent={s.changePercent} />
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              navigate({ to: "/app/portfolio/add" });
            }}
          >
            <Plus className="size-4" aria-hidden="true" /> Add a holding
          </CommandItem>
          <CommandItem
            onSelect={() => {
              const next = universe.find((s) => !state.watchlist.includes(s.symbol));
              if (next) {
                toggleWatch(next.symbol);
                toast.success(`${next.symbol} added to your watchlist`);
              }
              onOpenChange(false);
              navigate({ to: "/app/watchlist" });
            }}
          >
            <Eye className="size-4" aria-hidden="true" /> Open watchlist
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
