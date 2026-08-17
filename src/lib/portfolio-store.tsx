import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { marketDataService, type AssetType } from "./market-data";

export interface Holding {
  id: string;
  symbol: string;
  company: string;
  quantity: number;
  avgBuyPrice: number;
  buyDate: string;
  assetType: AssetType;
  sector: string;
  fees?: number;
  notes?: string;
}

export type TransactionType = "BUY" | "SELL" | "DIVIDEND" | "CASH";

export interface Transaction {
  id: string;
  symbol: string;
  type: TransactionType;
  quantity: number;
  price: number;
  fees: number;
  date: string;
}

export interface Alert {
  id: string;
  symbol: string;
  condition: "ABOVE" | "BELOW" | "MOVE";
  target: number;
  active: boolean;
}

export interface PortfolioState {
  portfolioName: string;
  holdings: Holding[];
  transactions: Transaction[];
  watchlist: string[];
  alerts: Alert[];
  onboarded: boolean;
}

const SAMPLE: PortfolioState = {
  portfolioName: "Long Term PSX",
  onboarded: true,
  holdings: [
    { id: "h1", symbol: "ENGRO", company: "Engro Corporation", quantity: 850, avgBuyPrice: 296.5, buyDate: "2025-02-11", assetType: "STOCK", sector: "Fertilizer" },
    { id: "h2", symbol: "MEBL", company: "Meezan Bank", quantity: 1200, avgBuyPrice: 214.2, buyDate: "2024-11-04", assetType: "STOCK", sector: "Banking" },
    { id: "h3", symbol: "SYS", company: "Systems Limited", quantity: 420, avgBuyPrice: 438.0, buyDate: "2025-05-19", assetType: "STOCK", sector: "Technology" },
    { id: "h4", symbol: "FFC", company: "Fauji Fertilizer Company", quantity: 1500, avgBuyPrice: 131.75, buyDate: "2025-01-08", assetType: "STOCK", sector: "Fertilizer" },
    { id: "h5", symbol: "LUCK", company: "Lucky Cement", quantity: 160, avgBuyPrice: 845.0, buyDate: "2024-09-23", assetType: "STOCK", sector: "Materials" },
    { id: "h6", symbol: "OGDC", company: "Oil & Gas Development Co.", quantity: 600, avgBuyPrice: 199.4, buyDate: "2025-03-27", assetType: "STOCK", sector: "Energy" },
    { id: "h7", symbol: "NBPGETF", company: "NBP Pakistan Growth ETF", quantity: 4000, avgBuyPrice: 17.1, buyDate: "2025-04-15", assetType: "ETF", sector: "ETF" },
    { id: "h8", symbol: "CASH", company: "Cash & Equivalents", quantity: 78000, avgBuyPrice: 1, buyDate: "2025-06-01", assetType: "CASH", sector: "Cash" },
  ],
  transactions: [
    { id: "t1", symbol: "MEBL", type: "BUY", quantity: 1200, price: 214.2, fees: 385, date: "2024-11-04" },
    { id: "t2", symbol: "LUCK", type: "BUY", quantity: 160, price: 845.0, fees: 410, date: "2024-09-23" },
    { id: "t3", symbol: "FFC", type: "BUY", quantity: 1500, price: 131.75, fees: 295, date: "2025-01-08" },
    { id: "t4", symbol: "ENGRO", type: "BUY", quantity: 850, price: 296.5, fees: 340, date: "2025-02-11" },
    { id: "t5", symbol: "OGDC", type: "BUY", quantity: 600, price: 199.4, fees: 250, date: "2025-03-27" },
    { id: "t6", symbol: "NBPGETF", type: "BUY", quantity: 4000, price: 17.1, fees: 120, date: "2025-04-15" },
    { id: "t7", symbol: "SYS", type: "BUY", quantity: 420, price: 438.0, fees: 365, date: "2025-05-19" },
    { id: "t8", symbol: "MEBL", type: "DIVIDEND", quantity: 1200, price: 3.5, fees: 0, date: "2025-07-02" },
    { id: "t9", symbol: "CASH", type: "CASH", quantity: 78000, price: 1, fees: 0, date: "2025-06-01" },
    { id: "t10", symbol: "PSO", type: "SELL", quantity: 200, price: 402.5, fees: 310, date: "2025-07-28" },
  ],
  watchlist: ["UBL", "TRG", "HBL", "PPL", "MCB"],
  alerts: [
    { id: "a1", symbol: "ENGRO", condition: "ABOVE", target: 360, active: true },
    { id: "a2", symbol: "SYS", condition: "BELOW", target: 400, active: true },
    { id: "a3", symbol: "TRG", condition: "MOVE", target: 5, active: false },
  ],
};

const EMPTY: PortfolioState = {
  portfolioName: "My Portfolio",
  holdings: [],
  transactions: [],
  watchlist: [],
  alerts: [],
  onboarded: false,
};

export interface HoldingRow extends Holding {
  currentPrice: number;
  dayChangePercent: number;
  costBasis: number;
  marketValue: number;
  pnl: number;
  returnPercent: number;
  allocation: number;
}

interface Store {
  state: PortfolioState;
  rows: HoldingRow[];
  totals: {
    marketValue: number;
    invested: number;
    pnl: number;
    returnPercent: number;
    dayChangePercent: number;
  };
  sectorAllocation: { name: string; value: number; percent: number }[];
  assetAllocation: { name: string; value: number; percent: number }[];
  addHolding: (h: Omit<Holding, "id">) => void;
  addHoldings: (h: Omit<Holding, "id">[]) => void;
  updateHolding: (id: string, patch: Partial<Holding>) => void;
  removeHolding: (id: string) => void;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  toggleWatch: (symbol: string) => void;
  addAlert: (a: Omit<Alert, "id">) => void;
  toggleAlert: (id: string) => void;
  removeAlert: (id: string) => void;
  setPortfolioName: (name: string) => void;
  resetToSample: () => void;
  clearAll: () => void;
}

const KEY = "portfolia.state.v1";
const StoreContext = createContext<Store | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PortfolioState>(SAMPLE);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...SAMPLE, ...(JSON.parse(raw) as PortfolioState) });
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  const persist = useCallback((next: PortfolioState) => {
    setState(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const update = useCallback(
    (fn: (prev: PortfolioState) => PortfolioState) => {
      setState((prev) => {
        const next = fn(prev);
        try {
          window.localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const rows = useMemo<HoldingRow[]>(() => {
    const enriched = state.holdings.map((h) => {
      const meta = marketDataService.getMeta(h.symbol);
      const currentPrice = h.assetType === "CASH" ? 1 : (meta?.price ?? h.avgBuyPrice);
      const costBasis = h.quantity * h.avgBuyPrice;
      const marketValue = h.quantity * currentPrice;
      const pnl = marketValue - costBasis;
      return {
        ...h,
        currentPrice,
        dayChangePercent: meta?.changePercent ?? 0,
        costBasis,
        marketValue,
        pnl,
        returnPercent: costBasis ? (pnl / costBasis) * 100 : 0,
        allocation: 0,
      };
    });
    const total = enriched.reduce((s, r) => s + r.marketValue, 0) || 1;
    return enriched.map((r) => ({ ...r, allocation: (r.marketValue / total) * 100 }));
  }, [state.holdings]);

  const totals = useMemo(() => {
    const marketValue = rows.reduce((s, r) => s + r.marketValue, 0);
    const invested = rows.reduce((s, r) => s + r.costBasis, 0);
    const pnl = marketValue - invested;
    const dayChange = rows.reduce((s, r) => s + (r.marketValue * r.dayChangePercent) / 100, 0);
    return {
      marketValue,
      invested,
      pnl,
      returnPercent: invested ? (pnl / invested) * 100 : 0,
      dayChangePercent: marketValue ? (dayChange / marketValue) * 100 : 0,
    };
  }, [rows]);

  const group = useCallback(
    (key: "sector" | "assetType") => {
      const map = new Map<string, number>();
      rows.forEach((r) => map.set(r[key], (map.get(r[key]) ?? 0) + r.marketValue));
      const total = [...map.values()].reduce((s, v) => s + v, 0) || 1;
      return [...map.entries()]
        .map(([name, value]) => ({ name, value, percent: (value / total) * 100 }))
        .sort((a, b) => b.value - a.value);
    },
    [rows],
  );

  const value = useMemo<Store>(
    () => ({
      state,
      rows,
      totals,
      sectorAllocation: group("sector"),
      assetAllocation: group("assetType"),
      addHolding: (h) =>
        update((p) => ({
          ...p,
          onboarded: true,
          holdings: [...p.holdings, { ...h, id: crypto.randomUUID() }],
          transactions: [
            ...p.transactions,
            {
              id: crypto.randomUUID(),
              symbol: h.symbol,
              type: "BUY",
              quantity: h.quantity,
              price: h.avgBuyPrice,
              fees: h.fees ?? 0,
              date: h.buyDate,
            },
          ],
        })),
      addHoldings: (list) =>
        update((p) => ({
          ...p,
          onboarded: true,
          holdings: [...p.holdings, ...list.map((h) => ({ ...h, id: crypto.randomUUID() }))],
          transactions: [
            ...p.transactions,
            ...list.map((h) => ({
              id: crypto.randomUUID(),
              symbol: h.symbol,
              type: "BUY" as TransactionType,
              quantity: h.quantity,
              price: h.avgBuyPrice,
              fees: h.fees ?? 0,
              date: h.buyDate,
            })),
          ],
        })),
      updateHolding: (id, patch) =>
        update((p) => ({
          ...p,
          holdings: p.holdings.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),
      removeHolding: (id) => update((p) => ({ ...p, holdings: p.holdings.filter((h) => h.id !== id) })),
      addTransaction: (t) =>
        update((p) => ({ ...p, transactions: [{ ...t, id: crypto.randomUUID() }, ...p.transactions] })),
      toggleWatch: (symbol) =>
        update((p) => ({
          ...p,
          watchlist: p.watchlist.includes(symbol)
            ? p.watchlist.filter((s) => s !== symbol)
            : [...p.watchlist, symbol],
        })),
      addAlert: (a) => update((p) => ({ ...p, alerts: [{ ...a, id: crypto.randomUUID() }, ...p.alerts] })),
      toggleAlert: (id) =>
        update((p) => ({
          ...p,
          alerts: p.alerts.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
        })),
      removeAlert: (id) => update((p) => ({ ...p, alerts: p.alerts.filter((a) => a.id !== id) })),
      setPortfolioName: (name) => update((p) => ({ ...p, portfolioName: name })),
      resetToSample: () => persist(SAMPLE),
      clearAll: () => persist(EMPTY),
    }),
    [state, rows, totals, group, update, persist],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function usePortfolio() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return ctx;
}
