import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ChartPie,
  Eye,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Plus,
  Receipt,
  Search,
  Settings,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";

import { Logo, LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GlobalSearch } from "@/components/app/GlobalSearch";
import { usePortfolio } from "@/lib/portfolio-store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/app/portfolio", label: "Portfolio", icon: Wallet },
  { to: "/app/transactions", label: "Transactions", icon: Receipt },
  { to: "/app/analytics", label: "Analytics", icon: ChartPie },
  { to: "/app/watchlist", label: "Watchlist", icon: Eye },
  { to: "/app/alerts", label: "Alerts", icon: Bell },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

function useActivePath() {
  return useRouterState({ select: (s) => s.location.pathname });
}

function isActive(pathname: string, to: string, exact?: boolean) {
  return exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useActivePath();
  return (
    <nav aria-label="Main" className="flex flex-1 flex-col gap-1 px-3">
      {NAV.map((item) => {
        const active = isActive(pathname, item.to, "exact" in item ? item.exact : false);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="sidebar-active"
                className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                aria-hidden="true"
              />
            )}
            <item.icon className={cn("size-[18px]", active && "text-primary")} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UpgradeCard() {
  return (
    <div className="glass-surface brand-edge m-3 rounded-lg p-4">
      <span className="card-glow pointer-events-none absolute inset-0 rounded-lg" aria-hidden="true" />
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="size-4 text-primary" aria-hidden="true" />
        Portfolia Premium
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Multiple portfolios, sector risk analytics and unlimited alerts.
      </p>
      <Button asChild size="sm" className="mt-3 w-full">
        <Link to="/app/upgrade">See plans</Link>
      </Button>
    </div>
  );
}

const MOBILE_NAV = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/app/portfolio", label: "Portfolio", icon: Wallet },
  { to: "/app/portfolio/add", label: "Add", icon: Plus, primary: true },
  { to: "/app/watchlist", label: "Watchlist", icon: Eye },
] as const;

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useActivePath();
  const navigate = useNavigate();
  const { state } = usePortfolio();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="px-5 py-5">
          <Logo />
        </div>
        <SidebarNav />
        <UpgradeCard />
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Sheet open={mobileNav} onOpenChange={setMobileNav}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] bg-sidebar p-0">
                <SheetTitle className="px-5 py-5">
                  <Logo />
                </SheetTitle>
                <SidebarNav onNavigate={() => setMobileNav(false)} />
                <UpgradeCard />
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>
              {description && (
                <p className="truncate text-xs text-muted-foreground">{description}</p>
              )}
            </div>

            <span className="hidden items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground md:inline-flex">
              <Wallet className="size-3.5 text-primary" aria-hidden="true" />
              {state.portfolioName}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="gap-2 text-muted-foreground"
            >
              <Search className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Search stocks</span>
              <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[0.65rem] md:inline">
                ⌘K
              </kbd>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Alerts"
              onClick={() => navigate({ to: "/app/alerts" })}
              className="relative"
            >
              <Bell />
              {state.alerts.some((a) => a.active) && (
                <span
                  aria-hidden="true"
                  className="absolute right-2 top-2 size-2 rounded-full bg-primary"
                />
              )}
            </Button>

            <Link
              to="/app/settings"
              aria-label="Profile and settings"
              className="grid size-9 shrink-0 place-items-center rounded-full border border-border-brand bg-surface text-sm font-bold text-primary"
            >
              AH
            </Link>
          </div>
        </header>

        <main id="main" className="mx-auto max-w-[1600px] px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-12">
          {actions && <div className="mb-5 flex flex-wrap items-center gap-2">{actions}</div>}
          {children}
        </main>
      </div>

      <nav
        aria-label="Primary mobile"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {MOBILE_NAV.map((item) => {
            const active = isActive(pathname, item.to, "exact" in item ? item.exact : false);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-[0.65rem] font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-md",
                      "primary" in item && item.primary && "bg-primary text-primary-foreground",
                    )}
                  >
                    <item.icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex min-h-[56px] w-full flex-col items-center justify-center gap-1 px-1 py-2 text-[0.65rem] font-medium text-muted-foreground"
                >
                  <span className="grid size-7 place-items-center rounded-md">
                    <MoreHorizontal className="size-[18px]" aria-hidden="true" />
                  </span>
                  More
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="bg-sidebar pb-8">
                <SheetTitle className="px-4 pb-2 pt-1 text-sm">All sections</SheetTitle>
                <SidebarNav onNavigate={() => setMoreOpen(false)} />
              </SheetContent>
            </Sheet>
          </li>
        </ul>
      </nav>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <span className="sr-only">
        <LogoMark />
      </span>
    </div>
  );
}
