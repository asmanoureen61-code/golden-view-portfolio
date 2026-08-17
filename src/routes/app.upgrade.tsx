import { createFileRoute } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { SectionCard } from "@/components/brand/financial";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/upgrade")({
  head: () => ({
    meta: [
      { title: "Upgrade to Pro — Portfolia" },
      { name: "description", content: "Unlock realtime PSX pricing, unlimited alerts and advanced analytics." },
      { property: "og:title", content: "Upgrade to Pro — Portfolia" },
      { property: "og:description", content: "Pro tools for serious PSX investors." },
    ],
  }),
  component: UpgradePage,
});

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    cadence: "forever",
    description: "Everything you need to track one PSX portfolio.",
    features: ["1 portfolio", "Up to 20 holdings", "End-of-day pricing", "3 price alerts", "CSV import"],
    cta: "Current plan",
    featured: false,
  },
  {
    name: "Pro",
    price: "Rs 1,900",
    cadence: "per month",
    description: "Realtime data and deeper analytics for active investors.",
    features: [
      "Unlimited portfolios & holdings",
      "Realtime PSX pricing",
      "Unlimited alerts + email digest",
      "Sector & contribution analytics",
      "Dividend tracking",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    featured: true,
  },
  {
    name: "Desk",
    price: "Rs 7,500",
    cadence: "per month",
    description: "For advisors and family offices managing multiple books.",
    features: [
      "Everything in Pro",
      "Up to 25 client portfolios",
      "Consolidated reporting",
      "Excel & PDF statements",
      "Team seats",
    ],
    cta: "Talk to us",
    featured: false,
  },
];

function UpgradePage() {
  return (
    <AppShell title="Upgrade" description="Choose the plan that fits how you invest">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "glass-surface relative flex flex-col rounded-lg p-6",
              plan.featured && "brand-edge",
            )}
          >
            {plan.featured && (
              <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full border border-border-brand bg-primary/10 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-primary">
                <Sparkles className="size-3" /> Popular
              </span>
            )}
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">{plan.name}</h2>
            <p className={cn("num mt-3 text-metric-xl", plan.featured && "text-primary")}>{plan.price}</p>
            <p className="mt-1 text-xs text-subtle-foreground">{plan.cadence}</p>
            <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
            <ul className="mt-5 flex-1 space-y-2.5 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              className="mt-6"
              variant={plan.featured ? "default" : "outline"}
              disabled={plan.name === "Starter"}
            >
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>

      <SectionCard className="mt-4" title="Questions" description="Billing and plans">
        <dl className="grid grid-cols-1 gap-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium">Can I cancel anytime?</dt>
            <dd className="mt-1 text-muted-foreground">
              Yes. Plans are month to month and your data stays accessible on Starter.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Where does PSX data come from?</dt>
            <dd className="mt-1 text-muted-foreground">
              Pricing is sourced from Pakistan Stock Exchange feeds, delayed on Starter and realtime on Pro.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Do you support dividends?</dt>
            <dd className="mt-1 text-muted-foreground">
              Dividend transactions are tracked on every plan; automated dividend detection is Pro only.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Is my data private?</dt>
            <dd className="mt-1 text-muted-foreground">
              Your holdings stay on your device unless you explicitly sync them.
            </dd>
          </div>
        </dl>
      </SectionCard>
    </AppShell>
  );
}
