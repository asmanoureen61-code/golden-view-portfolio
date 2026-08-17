import { createFileRoute } from "@tanstack/react-router";
import { BellRing, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { EmptyState, SectionCard, SymbolBadge } from "@/components/brand/financial";
import { AlertDialogForm } from "@/routes/app.holdings.$symbol";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatNumber } from "@/lib/format";
import { marketDataService } from "@/lib/market-data";
import { usePortfolio, type Alert } from "@/lib/portfolio-store";

export const Route = createFileRoute("/app/alerts")({
  head: () => ({
    meta: [
      { title: "Price alerts — Portfolia" },
      { name: "description", content: "Set price and movement alerts on PSX stocks you care about." },
      { property: "og:title", content: "Price alerts — Portfolia" },
      { property: "og:description", content: "Never miss a move on your PSX watchlist." },
    ],
  }),
  component: AlertsPage,
});

function describe(a: Alert) {
  if (a.condition === "MOVE") return `Daily move greater than ${formatNumber(a.target, 1)}%`;
  return `Price ${a.condition === "ABOVE" ? "above" : "below"} Rs ${formatNumber(a.target)}`;
}

function AlertsPage() {
  const { state, addAlert, toggleAlert, removeAlert } = usePortfolio();
  const [open, setOpen] = useState(false);

  return (
    <AppShell
      title="Alerts"
      description="Price triggers across your PSX universe"
      actions={<Button size="sm" onClick={() => setOpen(true)}><Plus /> New alert</Button>}
    >
      <SectionCard
        title="Your alerts"
        description={`${state.alerts.filter((a) => a.active).length} active of ${state.alerts.length}`}
        bodyClassName="p-4 sm:p-5"
      >
        {state.alerts.length === 0 ? (
          <EmptyState
            icon={<BellRing className="size-6" />}
            title="No alerts yet"
            description="Create a trigger and we'll flag it the moment the market crosses your level."
            primary={<Button onClick={() => setOpen(true)}>Create alert</Button>}
          />
        ) : (
          <ul className="space-y-2">
            {state.alerts.map((a) => {
              const meta = marketDataService.getMeta(a.symbol);
              const triggered =
                meta && a.condition === "ABOVE"
                  ? meta.price >= a.target
                  : meta && a.condition === "BELOW"
                    ? meta.price <= a.target
                    : meta
                      ? Math.abs(meta.changePercent) >= a.target
                      : false;
              return (
                <li key={a.id} className="glass-surface flex flex-wrap items-center gap-3 rounded-md p-3.5">
                  <SymbolBadge symbol={a.symbol} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{describe(a)}</span>
                    <span className="num block text-xs text-muted-foreground">
                      {meta ? `Now Rs ${formatNumber(meta.price)} · ${meta.changePercent >= 0 ? "+" : ""}${formatNumber(meta.changePercent)}%` : "Unavailable"}
                    </span>
                  </span>
                  {triggered && a.active && (
                    <span className="rounded-full border border-border-brand bg-primary/10 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-primary">
                      Triggered
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <Switch
                      checked={a.active}
                      onCheckedChange={() => toggleAlert(a.id)}
                      aria-label={`${a.active ? "Pause" : "Activate"} alert for ${a.symbol}`}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete alert for ${a.symbol}`}
                      onClick={() => {
                        removeAlert(a.id);
                        toast.success("Alert deleted");
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      <AlertDialogForm
        open={open}
        onOpenChange={setOpen}
        onSubmit={(a) => {
          addAlert(a);
          toast.success(`Alert created for ${a.symbol}`);
        }}
      />
    </AppShell>
  );
}
