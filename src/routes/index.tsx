import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  ChartPie,
  FileSpreadsheet,
  LineChart,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { HeroVisual } from "@/components/marketing/HeroVisual";
import { AnimatedNumber, Reveal, RevealLines } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portfolia — PSX Stock Portfolio Tracker" },
      {
        name: "description",
        content:
          "Track your Pakistan Stock Exchange portfolio with premium dashboards, sector analytics, CSV import and price alerts — built for PSX investors.",
      },
      { property: "og:title", content: "Portfolia — PSX Stock Portfolio Tracker" },
      {
        property: "og:description",
        content:
          "Premium PSX portfolio tracking: live P/L, sector allocation, transaction history and alerts in one dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Wallet,
    title: "Every holding, one view",
    body: "Buy price, current price, quantity and unrealised P/L for each PSX stock — updated the moment you edit a position.",
  },
  {
    icon: ChartPie,
    title: "Sector allocation analytics",
    body: "See how much of your capital sits in banking, fertilizer, cement or tech, and spot concentration risk early.",
  },
  {
    icon: LineChart,
    title: "Performance over time",
    body: "Cinematic portfolio charts across 1D to ALL ranges, with best and worst performers surfaced automatically.",
  },
  {
    icon: FileSpreadsheet,
    title: "CSV import & export",
    body: "Bring your broker statement in as a CSV, preview every row, fix errors, then export your book any time.",
  },
  {
    icon: Bell,
    title: "Price alerts",
    body: "Set targets above or below the market and keep a watchlist of PSX symbols you're waiting to enter.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Your portfolio is stored on your device. No brokerage login, no account required to get started.",
  },
] as const;

const STEPS = [
  { n: "01", title: "Add your holdings", body: "Search the PSX universe or import a CSV from your broker in seconds." },
  { n: "02", title: "See the full picture", body: "Value, cost, profit and allocation calculated instantly across the book." },
  { n: "03", title: "Track and act", body: "Watch symbols, set alerts and review transactions as your positions evolve." },
] as const;

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <nav aria-label="Marketing" className="ml-auto hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
            <Link to="/app/upgrade" className="transition-colors hover:text-foreground">Pricing</Link>
          </nav>
          <Button asChild size="sm" className="ml-auto gap-1.5 md:ml-0">
            <Link to="/app">
              Open dashboard
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 sm:pt-20">
          <span className="hero-glow pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-[1200px] items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <Reveal as="span" className="inline-flex items-center gap-2 rounded-full border border-border-brand bg-surface px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
                Built for Pakistan Stock Exchange investors
              </Reveal>

              <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                <RevealLines
                  lines={[
                    "Your PSX portfolio,",
                    <>finally <span className="text-primary">in focus</span>.</>,
                  ]}
                />
              </h1>

              <Reveal delay={0.25}>
                <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                  Portfolia turns scattered broker statements into a single premium dashboard —
                  live profit and loss, sector allocation, transaction history and alerts for every
                  position you hold.
                </p>
              </Reveal>

              <Reveal delay={0.35} className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/app">
                    Start tracking free
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/app/portfolio/add">Add your first holding</Link>
                </Button>
              </Reveal>

              <Reveal delay={0.45} className="mt-10 grid max-w-lg grid-cols-3 gap-4">
                <div>
                  <AnimatedNumber
                    value={1248500}
                    format={(n) => formatCurrency(n)}
                    className="block text-lg font-bold text-primary sm:text-xl"
                  />
                  <p className="mt-0.5 text-xs text-muted-foreground">Tracked in demo book</p>
                </div>
                <div>
                  <AnimatedNumber
                    value={120}
                    format={(n) => `${formatNumber(n, 0)}+`}
                    className="block text-lg font-bold sm:text-xl"
                  />
                  <p className="mt-0.5 text-xs text-muted-foreground">PSX symbols searchable</p>
                </div>
                <div>
                  <AnimatedNumber
                    value={13.5}
                    format={(n) => `${formatNumber(n, 1)}%`}
                    className="block text-lg font-bold text-positive sm:text-xl"
                  />
                  <p className="mt-0.5 text-xs text-muted-foreground">Sample return shown</p>
                </div>
              </Reveal>
            </div>

            <HeroVisual />
          </div>
        </section>

        <section id="features" className="border-t border-border px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[1200px]">
            <Reveal>
              <h2 className="text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
                Everything a PSX investor keeps in a spreadsheet — done properly
              </h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Purpose-built for the Pakistani market: rupee formatting, PSX sectors and
                end-of-day pricing, wrapped in an interface that stays readable on a phone.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * 0.06}>
                  <article className="glass-surface brand-edge relative h-full rounded-xl p-5 transition-transform duration-300 hover:-translate-y-1">
                    <span className="card-glow pointer-events-none absolute inset-0 rounded-xl" aria-hidden="true" />
                    <span className="grid size-10 place-items-center rounded-lg border border-border-brand bg-surface">
                      <f.icon className="size-5 text-primary" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="border-t border-border px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[1200px]">
            <Reveal>
              <h2 className="text-2xl font-bold tracking-[-0.02em] sm:text-3xl">Three steps to clarity</h2>
            </Reveal>
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <Reveal as="li" key={s.n} delay={i * 0.08}>
                  <div className="h-full rounded-xl border border-border bg-surface/60 p-6">
                    <span className="num text-sm font-bold text-primary">{s.n}</span>
                    <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-border px-4 py-20 sm:px-6">
          <Reveal className="mx-auto max-w-[880px]">
            <div className="glass-surface brand-edge relative overflow-hidden rounded-2xl px-6 py-12 text-center sm:px-12">
              <span className="hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
              <h2 className="relative text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
                Open your dashboard in one click
              </h2>
              <p className="relative mx-auto mt-3 max-w-xl text-muted-foreground">
                No sign-up, no brokerage credentials. Load the demo book, replace it with your own
                positions and keep everything on your device.
              </p>
              <Button asChild size="lg" className="relative mt-7 gap-2">
                <Link to="/app">
                  Launch Portfolia
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <Logo />
          <p>Prices are indicative end-of-day data. Not investment advice.</p>
        </div>
      </footer>
    </div>
  );
}
