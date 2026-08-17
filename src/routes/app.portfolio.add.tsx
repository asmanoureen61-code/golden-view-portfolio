import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { HoldingForm } from "@/components/app/HoldingForm";
import { SectionCard } from "@/components/brand/financial";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/portfolio/add")({
  head: () => ({
    meta: [
      { title: "Add a holding — Portfolia" },
      { name: "description", content: "Add a stock, ETF or cash position to your portfolio in a few fields." },
      { property: "og:title", content: "Add a holding — Portfolia" },
      { property: "og:description", content: "Symbol, quantity, buy price and date — that's it." },
    ],
  }),
  component: AddHolding,
});

function AddHolding() {
  return (
    <AppShell
      title="Add holding"
      description="Stocks, ETFs and cash"
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link to="/app/portfolio"><ArrowLeft /> Back to portfolio</Link>
        </Button>
      }
    >
      <div className="mx-auto max-w-2xl">
        <SectionCard
          title="New holding"
          description="We calculate your investment value as you type."
          bodyClassName="p-5 sm:p-6"
        >
          <HoldingForm />
        </SectionCard>
        <p className="mt-4 text-center text-xs text-subtle-foreground">
          Portfolia tracks and visualises your investments. It never places trades and does not give
          financial advice.
        </p>
      </div>
    </AppShell>
  );
}
