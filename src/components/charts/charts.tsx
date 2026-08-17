import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { PricePoint } from "@/lib/market-data";

const AXIS = "var(--color-subtle-foreground)";
const GRID = "var(--color-border)";

function TooltipCard({
  active,
  payload,
  label,
  currency = true,
}: {
  active?: boolean;
  payload?: { value?: number | string; name?: string }[];
  label?: string | number;
  currency?: boolean;
}) {
  if (!active || !payload?.length) return null;
  const raw = Number(payload[0]?.value ?? 0);
  return (
    <div className="rounded-md border border-border-strong bg-popover px-3 py-2 shadow-elevated">
      <p className="text-[0.7rem] text-muted-foreground">{label}</p>
      <p className="num text-sm font-semibold text-foreground">
        {currency ? formatCurrency(raw) : `${formatNumber(raw, 2)}%`}
      </p>
    </div>
  );
}

export function PortfolioAreaChart({ data, height = 300 }: { data: PricePoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.32} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          stroke={AXIS}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          minTickGap={28}
        />
        <YAxis
          stroke={AXIS}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={62}
          tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
        />
        <Tooltip content={<TooltipCard />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#portfolioFill)"
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PriceLineChart({ data, height = 260 }: { data: PricePoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <XAxis dataKey="date" stroke={AXIS} tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: GRID }} minTickGap={28} />
        <YAxis stroke={AXIS} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={56} domain={["auto", "auto"]} />
        <Tooltip content={<TooltipCard />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={false}
          animationDuration={900}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

const DONUT_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-info)",
];

export function AllocationDonut({
  data,
  height = 240,
}: {
  data: { name: string; value: number; percent: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="62%"
          outerRadius="92%"
          paddingAngle={2}
          stroke="var(--color-background)"
          strokeWidth={2}
          animationDuration={800}
        >
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<TooltipCard />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AllocationLegend({ data }: { data: { name: string; value: number; percent: number }[] }) {
  return (
    <ul className="mt-4 space-y-2">
      {data.map((d, i) => (
        <li key={d.name} className="flex items-center justify-between gap-3 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
            />
            <span className="truncate text-muted-foreground">{d.name}</span>
          </span>
          <span className="num shrink-0 font-semibold">{d.percent.toFixed(1)}%</span>
        </li>
      ))}
    </ul>
  );
}

export function SectorBarChart({
  data,
  height = 260,
}: {
  data: { name: string; percent: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
        <XAxis type="number" stroke={AXIS} tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: GRID }} unit="%" />
        <YAxis type="category" dataKey="name" stroke={AXIS} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={86} />
        <Tooltip content={<TooltipCard currency={false} />} />
        <Bar dataKey="percent" radius={[0, 6, 6, 0]} fill="var(--color-primary)" animationDuration={800} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Sparkline({ values, positive }: { values: number[]; positive: boolean }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / span) * 24}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-24" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        stroke={positive ? "var(--color-positive)" : "var(--color-negative)"}
      />
    </svg>
  );
}
