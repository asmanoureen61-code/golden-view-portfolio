import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { SectionCard } from "@/components/brand/financial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePortfolio } from "@/lib/portfolio-store";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Portfolia" },
      { name: "description", content: "Rename your portfolio, manage preferences and reset your data." },
      { property: "og:title", content: "Settings — Portfolia" },
      { property: "og:description", content: "Control how Portfolia tracks your PSX portfolio." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { state, setPortfolioName, resetToSample, clearAll } = usePortfolio();
  const [name, setName] = useState(state.portfolioName);
  const [compact, setCompact] = useState(false);
  const [alertsEmail, setAlertsEmail] = useState(true);

  return (
    <AppShell title="Settings" description="Portfolio preferences and data">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard title="Portfolio" description="How your portfolio is labelled across the app">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setPortfolioName(name.trim() || "My Portfolio");
              toast.success("Portfolio name updated");
            }}
          >
            <div>
              <Label htmlFor="portfolio-name">Portfolio name</Label>
              <Input
                id="portfolio-name"
                className="mt-1.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="base-currency">Base currency</Label>
              <Input id="base-currency" className="mt-1.5" value="PKR (Rs)" readOnly aria-readonly="true" />
              <p className="mt-1.5 text-xs text-subtle-foreground">
                PSX positions are tracked in Pakistani Rupees.
              </p>
            </div>
            <Button type="submit">Save changes</Button>
          </form>
        </SectionCard>

        <SectionCard title="Preferences" description="Display and notification defaults">
          <ul className="space-y-4 text-sm">
            <li className="flex items-start justify-between gap-4">
              <span>
                <span className="block font-medium">Compact number formatting</span>
                <span className="block text-xs text-muted-foreground">
                  Show large values as 1.2M instead of 1,200,000.
                </span>
              </span>
              <Switch checked={compact} onCheckedChange={setCompact} aria-label="Compact number formatting" />
            </li>
            <li className="flex items-start justify-between gap-4">
              <span>
                <span className="block font-medium">Email me when alerts trigger</span>
                <span className="block text-xs text-muted-foreground">
                  Daily digest of triggered price alerts.
                </span>
              </span>
              <Switch checked={alertsEmail} onCheckedChange={setAlertsEmail} aria-label="Email alert digest" />
            </li>
          </ul>
        </SectionCard>

        <SectionCard
          className="xl:col-span-2"
          title="Data"
          description="Your portfolio is stored privately on this device"
        >
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetToSample();
                toast.success("Sample PSX portfolio restored");
              }}
            >
              Load sample portfolio
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearAll();
                toast.success("All portfolio data cleared");
              }}
            >
              Clear all data
            </Button>
          </div>
          <p className="mt-3 text-xs text-subtle-foreground">
            Clearing removes {state.holdings.length} holdings and {state.transactions.length} transactions.
            This cannot be undone.
          </p>
        </SectionCard>
      </div>
    </AppShell>
  );
}
