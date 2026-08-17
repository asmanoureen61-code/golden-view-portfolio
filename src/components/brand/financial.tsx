import { cn } from "@/lib/utils";
import { formatCurrency, formatPercent, trend } from "@/lib/format";
import { AnimatedNumber } from "@/components/motion/Reveal";
import type { ReactNode } from "react";

const toneClass = {
  positive: "text-positive",
  negative: "text-negative",
  flat: "text-muted-foreground",
};

/** Percentage / value change with arrow + sign — never color alone. */
export function PriceChange({
  percent,
  amount,
  className,
  size = "sm",
}: {
  percent: number;
  amount?: number;
  className?: string;
  size?: "sm" | "md";
}) {
  const t = trend(percent);
  return (
    <span
      className={cn(
        "num inline-flex items-center gap-1 font-semibold",
        size === "sm" ? "text-sm" : "text-base",
        toneClass[t.tone],
        className,
      )}
    >
      <span aria-hidden="true">{t.arrow}</span>
      {formatPercent(percent)}
      {amount !== undefined && (
        <span className="text-muted-foreground">({formatCurrency(amount, { sign: true })})</span>
      )}
      <span className="sr-only">{t.word}</span>
    </span>
  );
}

export function PerformanceBadge({ percent, className }: { percent: number; className?: string }) {
  const t = trend(percent);
  return (
    <span
      className={cn(
        "num inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
        t.tone === "positive" && "border-positive/30 bg-positive/10 text-positive",
        t.tone === "negative" && "border-negative/30 bg-negative/10 text-negative",
        t.tone === "flat" && "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      <span aria-hidden="true">{t.arrow}</span>
      {formatPercent(percent)}
      <span className="sr-only">{t.word}</span>
    </span>
  );
}

export function SymbolBadge({ symbol, className }: { symbol: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-border bg-surface px-2 py-0.5 text-[0.7rem] font-bold tracking-[0.08em] text-muted-foreground",
        className,
      )}
    >
      {symbol}
    </span>
  );
}

export function MetricCard({
  label,
  value,
  changePercent,
  hint,
  highlight,
  decimals = 0,
}: {
  label: string;
  value: number;
  changePercent?: number;
  hint?: string;
  highlight?: boolean;
  decimals?: number;
}) {
  return (
    <div
      className={cn(
        "glass-surface relative overflow-hidden rounded-lg p-5 sm:p-6 transition-colors hover:border-border-strong",
        highlight && "brand-edge",
      )}
    >
      {highlight && <span aria-hidden="true" className="card-glow pointer-events-none absolute inset-0" />}
      <p className="relative text-xs font-medium tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("relative mt-2 text-metric-xl", highlight && "text-primary")}>
        <AnimatedNumber value={value} format={(n) => formatCurrency(n, { decimals })} />
      </p>
      <div className="relative mt-2 flex flex-wrap items-center gap-2">
        {changePercent !== undefined && <PriceChange percent={changePercent} />}
        {hint && <span className="text-xs text-subtle-foreground">{hint}</span>}
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("glass-surface rounded-lg", className)}>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </header>
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function EmptyState({
  title,
  description,
  primary,
  secondary,
  icon,
}: {
  title: string;
  description: string;
  primary?: ReactNode;
  secondary?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-strong px-6 py-14 text-center">
      {icon && (
        <span aria-hidden="true" className="grid size-12 place-items-center rounded-xl bg-surface text-primary">
          {icon}
        </span>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {primary}
        {secondary}
      </div>
    </div>
  );
}
