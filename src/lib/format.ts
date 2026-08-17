export function formatCurrency(value: number, opts?: { decimals?: number; sign?: boolean }) {
  const decimals = opts?.decimals ?? 0;
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-PK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const sign = value < 0 ? "-" : opts?.sign ? "+" : "";
  return `${sign}Rs ${formatted}`;
}

export function formatNumber(value: number, decimals = 2) {
  return value.toLocaleString("en-PK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value: number, opts?: { sign?: boolean }) {
  const sign = value < 0 ? "-" : opts?.sign === false ? "" : "+";
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Accessible direction word + arrow for financial values (never color alone). */
export function trend(value: number) {
  if (value > 0) return { arrow: "↑", word: "up", tone: "positive" as const };
  if (value < 0) return { arrow: "↓", word: "down", tone: "negative" as const };
  return { arrow: "→", word: "flat", tone: "flat" as const };
}
