"use client";

import * as React from "react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const WordRotate = React.forwardRef(
  (
    {
      words,
      intervalMs = 2000,
      rollMs = 520,
      className,
      wordClassName,
      align = "right",
      ...props
    },
    ref
  ) => {
    const [index, setIndex] = React.useState(0);
    const [isRolling, setIsRolling] = React.useState(false);
    const [disableTransition, setDisableTransition] = React.useState(false);

    const DESCENDER_PADDING = 8; // Extra space for descenders like g, y, p, q

    const measureRefs = React.useRef([]);
    const [maxWidth, setMaxWidth] = React.useState(0);
    const [maxHeight, setMaxHeight] = React.useState(0);

    const timeoutRef = React.useRef(undefined);
    const intervalRef = React.useRef(undefined);

    const nextIndex = words?.length ? (index + 1) % words.length : 0;

    const currentWord = words?.[index] ?? "";
    const nextWord = words?.[nextIndex] ?? "";

    React.useLayoutEffect(() => {
      const compute = () => {
        const widths = measureRefs.current
          .map((el) => el?.getBoundingClientRect?.().width ?? 0)
          .filter((w) => w > 0);

        const heights = measureRefs.current
          .map((el) => el?.getBoundingClientRect?.().height ?? 0)
          .filter((h) => h > 0);

        const w = widths.length ? Math.ceil(Math.max(...widths)) : 0;
        const h = heights.length ? Math.ceil(Math.max(...heights)) + DESCENDER_PADDING : 0;
        
        setMaxWidth(w);
        setMaxHeight(h);
      };

      compute();

      if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(() => compute());
        measureRefs.current.forEach((el) => {
          if (el) ro.observe(el);
        });
        window.addEventListener("resize", compute);
        return () => {
          ro.disconnect();
          window.removeEventListener("resize", compute);
        };
      }

      window.addEventListener("resize", compute);
      return () => window.removeEventListener("resize", compute);
    }, [words]);

    React.useEffect(() => {
      if (!words?.length || words.length < 2) return;

      intervalRef.current = window.setInterval(() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        setIsRolling(true);

        timeoutRef.current = window.setTimeout(() => {
          setDisableTransition(true);
          setIndex((prev) => (prev + 1) % words.length);
          setIsRolling(false);

          window.requestAnimationFrame(() => {
            setDisableTransition(false);
          });
        }, rollMs);
      }, intervalMs);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [intervalMs, rollMs, words]);

    const getAlignmentClass = () => {
      if (align === "left") return "text-left";
      if (align === "center") return "text-center";
      return "text-right";
    };

    const getFlexAlignmentClass = () => {
      if (align === "left") return "justify-start";
      if (align === "center") return "justify-center";
      return "justify-end";
    };

    if (!maxWidth || !maxHeight) {
      return (
        <span
          ref={ref}
          className={cn("relative inline-block", className)}
          aria-live="polite"
          {...props}
        >
          <span className={cn("inline-block", getAlignmentClass(), wordClassName)}>
            {currentWord}
          </span>

          <span className="absolute -z-10 opacity-0 pointer-events-none select-none" aria-hidden>
            <span className={cn("inline-flex flex-wrap", getFlexAlignmentClass())}>
              {words?.map((w, i) => (
                <span
                  key={`${w}-${i}`}
                  ref={(el) => {
                    measureRefs.current[i] = el;
                  }}
                  className={cn("inline-block whitespace-nowrap", wordClassName)}
                >
                  {w}
                </span>
              ))}
            </span>
          </span>
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn("relative inline-block overflow-hidden", className)}
        style={{ 
          width: `${maxWidth}px`,
          height: `${maxHeight}px`,
          verticalAlign: "baseline",
        }}
        {...props}
      >
        <span
          className={cn(
            "relative block will-change-transform",
            disableTransition
              ? "transition-none"
              : "transition-transform motion-reduce:transition-none"
          )}
          style={{
            transform: isRolling ? "translateY(-100%)" : "translateY(0)",
            transitionDuration: disableTransition ? undefined : `${rollMs}ms`,
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          aria-live="polite"
        >
          <span
            className={cn(
              "block whitespace-nowrap",
              getAlignmentClass(),
              wordClassName
            )}
          >
            {currentWord}
          </span>
          <span
            className={cn(
              "block whitespace-nowrap",
              getAlignmentClass(),
              wordClassName
            )}
          >
            {nextWord}
          </span>
        </span>

        <span className="absolute -z-10 opacity-0 pointer-events-none select-none" aria-hidden>
          <span className={cn("inline-flex flex-wrap", getFlexAlignmentClass())}>
            {words?.map((w, i) => (
              <span
                key={`${w}-${i}`}
                ref={(el) => {
                  measureRefs.current[i] = el;
                }}
                className={cn("inline-block whitespace-nowrap", wordClassName)}
              >
                {w}
              </span>
            ))}
          </span>
        </span>
      </span>
    );
  }
);

WordRotate.displayName = "WordRotate";

export { WordRotate };

// Demo Hero Section
export default function HeroSection() {
  const words = ["track", "manage", "plan", "view", "optimize", "analyze", "monitor", "improve"];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
          <span className="inline-flex items-baseline justify-center gap-2 sm:gap-3">
            <WordRotate
              words={words}
              intervalMs={2000}
              rollMs={520}
              align="left"
              wordClassName="bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-50 bg-clip-text text-transparent font-bold"
            />
            <span className="whitespace-nowrap">your finances</span>
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
          FinX gives you a clean view of accounts, spend, and cash
          flow — built for calm execution, not noisy dashboards.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg shadow-emerald-500/50">
            Open dashboard →
          </button>
          <button className="px-8 py-4 bg-transparent hover:bg-white/10 text-white border-2 border-white/30 rounded-lg font-semibold text-lg transition-colors">
            View product
          </button>
        </div>
      </div>
    </div>
  );
}