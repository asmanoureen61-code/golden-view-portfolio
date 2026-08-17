/**
 * marketDataService — single abstraction over market data.
 *
 * The MVP resolves prices from a deterministic mock dataset so the UI can be
 * developed without a provider. Swap `provider` for a real feed (Twelve Data,
 * Finnhub, a PSX-compatible provider) by implementing the same interface inside
 * a server function — API keys must never reach the browser.
 */

export type AssetType = "STOCK" | "ETF" | "CASH";

export interface StockMeta {
  symbol: string;
  company: string;
  exchange: string;
  sector: string;
  assetType: AssetType;
  price: number;
  changePercent: number;
}

export interface Quote {
  symbol: string;
  price: number;
  changePercent: number;
  change: number;
  asOf: string;
}

export interface PricePoint {
  date: string;
  value: number;
}

export type Range = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

const UNIVERSE: StockMeta[] = [
  { symbol: "ENGRO", company: "Engro Corporation", exchange: "PSX", sector: "Fertilizer", assetType: "STOCK", price: 352.4, changePercent: 1.84 },
  { symbol: "MEBL", company: "Meezan Bank", exchange: "PSX", sector: "Banking", assetType: "STOCK", price: 268.9, changePercent: 2.61 },
  { symbol: "SYS", company: "Systems Limited", exchange: "PSX", sector: "Technology", assetType: "STOCK", price: 412.75, changePercent: -1.12 },
  { symbol: "FFC", company: "Fauji Fertilizer Company", exchange: "PSX", sector: "Fertilizer", assetType: "STOCK", price: 148.3, changePercent: 0.62 },
  { symbol: "LUCK", company: "Lucky Cement", exchange: "PSX", sector: "Materials", assetType: "STOCK", price: 921.5, changePercent: -0.48 },
  { symbol: "UBL", company: "United Bank Limited", exchange: "PSX", sector: "Banking", assetType: "STOCK", price: 305.15, changePercent: 3.12 },
  { symbol: "HBL", company: "Habib Bank Limited", exchange: "PSX", sector: "Banking", assetType: "STOCK", price: 141.9, changePercent: -0.74 },
  { symbol: "OGDC", company: "Oil & Gas Development Co.", exchange: "PSX", sector: "Energy", assetType: "STOCK", price: 218.6, changePercent: 1.05 },
  { symbol: "PPL", company: "Pakistan Petroleum Ltd.", exchange: "PSX", sector: "Energy", assetType: "STOCK", price: 176.25, changePercent: -1.68 },
  { symbol: "TRG", company: "TRG Pakistan", exchange: "PSX", sector: "Technology", assetType: "STOCK", price: 62.4, changePercent: 4.21 },
  { symbol: "MCB", company: "MCB Bank Limited", exchange: "PSX", sector: "Banking", assetType: "STOCK", price: 267.8, changePercent: 0.38 },
  { symbol: "PSO", company: "Pakistan State Oil", exchange: "PSX", sector: "Energy", assetType: "STOCK", price: 389.05, changePercent: -2.14 },
  { symbol: "NBPGETF", company: "NBP Pakistan Growth ETF", exchange: "PSX", sector: "ETF", assetType: "ETF", price: 18.42, changePercent: 0.81 },
  { symbol: "MZNPETF", company: "Meezan Pakistan ETF", exchange: "PSX", sector: "ETF", assetType: "ETF", price: 14.96, changePercent: 1.23 },
  { symbol: "CASH", company: "Cash & Equivalents", exchange: "—", sector: "Cash", assetType: "CASH", price: 1, changePercent: 0 },
];

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Deterministic pseudo-random series so SSR and client render identically. */
function series(seed: string, points: number, start: number, drift: number, vol: number): number[] {
  const out: number[] = [];
  let value = start;
  for (let i = 0; i < points; i++) {
    const r = (Math.sin(hash(`${seed}:${i}`) % 10000) + Math.cos(i * 1.7)) / 2;
    value = value * (1 + drift / points + r * vol);
    out.push(Math.max(value, start * 0.4));
  }
  return out;
}

const RANGE_POINTS: Record<Range, number> = { "1D": 26, "1W": 28, "1M": 30, "3M": 45, "1Y": 52, ALL: 60 };
const RANGE_DRIFT: Record<Range, number> = { "1D": 0.018, "1W": 0.03, "1M": 0.052, "3M": 0.081, "1Y": 0.135, ALL: 0.19 };

export const marketDataService = {
  listUniverse(): StockMeta[] {
    return UNIVERSE;
  },

  async searchStocks(query: string): Promise<StockMeta[]> {
    const q = query.trim().toLowerCase();
    if (!q) return UNIVERSE.filter((s) => s.assetType !== "CASH").slice(0, 8);
    return UNIVERSE.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.company.toLowerCase().includes(q),
    ).slice(0, 10);
  },

  getMeta(symbol: string): StockMeta | undefined {
    return UNIVERSE.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
  },

  async getQuote(symbol: string): Promise<Quote> {
    const meta = this.getMeta(symbol);
    const price = meta?.price ?? 100;
    const changePercent = meta?.changePercent ?? 0;
    return {
      symbol: symbol.toUpperCase(),
      price,
      changePercent,
      change: (price * changePercent) / 100,
      asOf: "end of day",
    };
  },

  async getHistoricalPrices(symbol: string, range: Range = "1Y"): Promise<PricePoint[]> {
    const meta = this.getMeta(symbol);
    const points = RANGE_POINTS[range];
    const end = meta?.price ?? 100;
    const values = series(`${symbol}:${range}`, points, end / (1 + RANGE_DRIFT[range]), RANGE_DRIFT[range], 0.012);
    return values.map((v, i) => ({ date: labelFor(range, i, points), value: Number(v.toFixed(2)) }));
  },

  /** Portfolio-level history, scaled to a current value. */
  portfolioHistory(currentValue: number, range: Range = "1Y"): PricePoint[] {
    const points = RANGE_POINTS[range];
    const drift = RANGE_DRIFT[range];
    const values = series(`portfolio:${range}`, points, currentValue / (1 + drift), drift, 0.008);
    const scale = currentValue / (values[values.length - 1] ?? 1);
    return values.map((v, i) => ({
      date: labelFor(range, i, points),
      value: Math.round(v * scale),
    }));
  },

  sparkline(symbol: string): number[] {
    return series(`${symbol}:spark`, 18, 100, (this.getMeta(symbol)?.changePercent ?? 0) / 100, 0.01);
  },

  async getMarketStatus() {
    return { market: "PSX", open: false, label: "PSX closed — end-of-day prices", asOf: "Today, 3:30 PM PKT" };
  },
};

function labelFor(range: Range, index: number, points: number) {
  if (range === "1D") {
    const minutes = 9 * 60 + 30 + index * 14;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  const daysBack = range === "1W" ? 7 : range === "1M" ? 30 : range === "3M" ? 90 : range === "1Y" ? 365 : 900;
  const d = new Date(Date.UTC(2026, 7, 17));
  d.setUTCDate(d.getUTCDate() - Math.round(((points - 1 - index) / (points - 1)) * daysBack));
  return d.toISOString().slice(0, 10);
}
