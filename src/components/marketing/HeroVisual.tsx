import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { PriceChange } from "@/components/brand/financial";

const EASE = [0.22, 1, 0.36, 1] as const;

const bars = [38, 52, 44, 61, 57, 72, 66, 81, 76, 90, 84, 96];
const chips = [
  { symbol: "ENGRO", price: 352.4, change: 1.84 },
  { symbol: "MEBL", price: 268.9, change: 2.61 },
  { symbol: "SYS", price: 412.75, change: -1.12 },
];

export function HeroVisual() {
  const reduce = useReducedMotion();
  const [pointerFine, setPointerFine] = useState(false);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 60, damping: 18, mass: 0.6 });

  useEffect(() => {
    setPointerFine(window.matchMedia("(pointer: fine)").matches);
  }, []);

  const enabled = pointerFine && !reduce;

  const layer = (factor: number) => ({
    x: useTransform(sx, (v) => v * factor),
    y: useTransform(sy, (v) => v * factor),
  });

  const glow = layer(0.35);
  const board = layer(0.6);
  const metric = layer(1.2);
  const stock = layer(1.4);

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[620px] [perspective:1200px]"
      onPointerMove={(e) => {
        if (!enabled) return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set(((e.clientX - r.left) / r.width - 0.5) * 20);
        py.set(((e.clientY - r.top) / r.height - 0.5) * 16);
      }}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.97, filter: "blur(8px)" }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: reduce ? 0.25 : 1.1, ease: EASE, delay: reduce ? 0 : 0.45 }}
    >
      <motion.div
        aria-hidden="true"
        style={glow}
        className="hero-glow pointer-events-none absolute -inset-24 animate-glow-drift"
      />

      <motion.div
        style={board}
        className="relative motion-safe:animate-float-slow"
      >
        <div
          className="glass-surface relative rounded-2xl p-4 sm:p-5 shadow-elevated [transform:rotateX(2deg)_rotateY(-5deg)]"
          role="img"
          aria-label="Preview of the Portfolia dashboard: portfolio value Rs 1,248,500, up 13.5 percent overall, with allocation and performance charts."
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              <span className="text-xs font-semibold tracking-wide text-muted-foreground">
                Long Term PSX · Overview
              </span>
            </div>
            <span className="rounded-full border border-border px-2 py-0.5 text-[0.65rem] text-subtle-foreground">
              PSX · EOD
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1.3fr_1fr]">
            <div className="rounded-lg border border-border-brand bg-surface/70 p-4">
              <p className="text-[0.7rem] text-muted-foreground">Portfolio value</p>
              <p className="num mt-1 text-2xl font-bold text-primary">{formatCurrency(1248500)}</p>
              <PriceChange percent={2.8} className="mt-1" />
              <div className="mt-4 flex h-20 items-end gap-1.5" aria-hidden="true">
                {bars.map((h, i) => (
                  <motion.span
                    key={i}
                    className="flex-1 rounded-sm bg-primary/25"
                    style={{ height: `${h}%` }}
                    initial={reduce ? false : { scaleY: 0.2, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.7 + i * 0.045 }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-surface/70 p-3">
                <p className="text-[0.7rem] text-muted-foreground">Total profit</p>
                <p className="num mt-1 text-lg font-bold text-positive">
                  {formatCurrency(148500, { sign: true })}
                </p>
                <p className="num text-[0.7rem] text-muted-foreground">↑ +13.50% return</p>
              </div>
              <div className="rounded-lg border border-border bg-surface/70 p-3">
                <p className="text-[0.7rem] text-muted-foreground">Allocation</p>
                <div className="mt-2 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="size-14 shrink-0 rounded-full"
                    style={{
                      background:
                        "conic-gradient(var(--color-chart-1) 0 34%, var(--color-chart-2) 34% 58%, var(--color-chart-3) 58% 76%, var(--color-chart-4) 76% 90%, var(--color-chart-5) 90% 100%)",
                      mask: "radial-gradient(circle, transparent 54%, black 56%)",
                      WebkitMask: "radial-gradient(circle, transparent 54%, black 56%)",
                    }}
                  />
                  <ul className="space-y-0.5 text-[0.68rem] text-muted-foreground">
                    <li>Banking 34%</li>
                    <li>Fertilizer 24%</li>
                    <li>Technology 18%</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-hidden">
            {chips.map((c) => (
              <span
                key={c.symbol}
                className="num flex-1 rounded-md border border-border bg-surface/70 px-2.5 py-2 text-[0.68rem]"
              >
                <span className="block font-bold tracking-wide">{c.symbol}</span>
                <span className="text-muted-foreground">Rs {c.price}</span>{" "}
                <span className={c.change >= 0 ? "text-positive" : "text-negative"}>
                  {c.change >= 0 ? "↑" : "↓"} {Math.abs(c.change)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        style={metric}
        className="glass-surface absolute -left-3 bottom-8 hidden rounded-lg px-4 py-3 shadow-elevated sm:block"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, filter: "blur(6px)" }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.85 }}
      >
        <p className="text-[0.65rem] text-muted-foreground">Best performer</p>
        <p className="num text-sm font-bold">MEBL</p>
        <p className="num text-xs font-semibold text-positive">↑ +25.54%</p>
      </motion.div>

      <motion.div
        style={stock}
        className="glass-surface absolute -right-2 top-6 hidden rounded-lg px-4 py-3 shadow-elevated sm:block"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16, filter: "blur(6px)" }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: EASE, delay: 1 }}
      >
        <p className="text-[0.65rem] text-muted-foreground">Total invested</p>
        <p className="num text-sm font-bold">{formatCurrency(1100000)}</p>
        <p className="text-[0.65rem] text-subtle-foreground">8 holdings · 1 portfolio</p>
      </motion.div>
    </motion.div>
  );
}
