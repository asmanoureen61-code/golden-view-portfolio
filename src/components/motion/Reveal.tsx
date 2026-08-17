import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  blur?: boolean;
  className?: string;
  as?: "div" | "section" | "span" | "li" | "header";
}

/** Viewport-triggered entrance: fires once, respects reduced motion. */
export function Reveal({ children, delay = 0, y = 14, blur = true, className, as = "div" }: RevealProps) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, filter: blur ? "blur(5px)" : "blur(0px)" }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: reduce ? 0.2 : 0.7, ease: EASE, delay: reduce ? 0 : delay }}
    >
      {children}
    </Comp>
  );
}

/** Headline revealed line-by-line (never letter-by-letter). */
export function RevealLines({
  lines,
  className,
  lineClassName,
  baseDelay = 0,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  baseDelay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <span className={cn("block", className)}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className={cn("block", lineClassName)}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: "0.5em", filter: "blur(6px)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: "0em", filter: "blur(0px)" }}
            transition={{
              duration: reduce ? 0.2 : 0.55 + i * 0.15,
              ease: EASE,
              delay: reduce ? 0 : baseDelay + i * 0.12,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Counts a financial number up once when it scrolls into view. */
export function AnimatedNumber({
  value,
  format,
  className,
  duration = 800,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduce]);

  return (
    <span ref={ref} className={cn("num", className)}>
      {format(display)}
    </span>
  );
}
