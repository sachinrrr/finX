"use client";

import * as React from "react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const WordRotate = React.forwardRef(
  (
    {
      words,
      intervalMs = 2500,
      rollMs = 800,
      spinCount = 6, // Number of words to spin through before landing
      className,
      wordClassName,
      align = "right",
      ...props
    },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [isSpinning, setIsSpinning] = React.useState(false);
    const [spinOffset, setSpinOffset] = React.useState(0);
    const [displayWords, setDisplayWords] = React.useState([]);

    const DESCENDER_PADDING = 8;

    const measureRefs = React.useRef([]);
    const [maxWidth, setMaxWidth] = React.useState(0);
    const [maxHeight, setMaxHeight] = React.useState(0);

    const intervalRef = React.useRef(undefined);

    // Build the list of words to display during spin animation
    React.useEffect(() => {
      if (!words?.length) return;
      
      const nextIndex = (currentIndex + 1) % words.length;
      const spinWords = [words[currentIndex]];
      
      // Add intermediate words for the slot machine effect
      for (let i = 0; i < spinCount; i++) {
        const idx = (currentIndex + 1 + i) % words.length;
        spinWords.push(words[idx]);
      }
      // Ensure the target word is at the end
      spinWords.push(words[nextIndex]);
      
      setDisplayWords(spinWords);
    }, [words, currentIndex, spinCount]);

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
        // Start the spin
        setIsSpinning(true);
        setSpinOffset(0);
        
        // Animate to final position
        requestAnimationFrame(() => {
          setSpinOffset(spinCount + 1); // Move to show the target word
        });

        // After animation completes, update the actual index and reset
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % words.length);
          setIsSpinning(false);
          setSpinOffset(0);
        }, rollMs);
      }, intervalMs);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [intervalMs, rollMs, words, spinCount]);

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

    const currentWord = words?.[currentIndex] ?? "";

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
          className="relative block will-change-transform"
          style={{
            transform: `translateY(-${spinOffset * maxHeight}px)`,
            transition: isSpinning 
              ? `transform ${rollMs}ms cubic-bezier(0.33, 1, 0.68, 1)` 
              : 'none',
          }}
          aria-live="polite"
        >
          {isSpinning ? (
            // During spin, show all the intermediate words
            displayWords.map((word, i) => (
              <span
                key={`spin-${i}`}
                className={cn(
                  "block whitespace-nowrap",
                  getAlignmentClass(),
                  wordClassName
                )}
                style={{
                  height: `${maxHeight}px`,
                  lineHeight: `${maxHeight}px`,
                  opacity: i === 0 || i === displayWords.length - 1 ? 1 : 0.4,
                }}
              >
                {word}
              </span>
            ))
          ) : (
            // When not spinning, just show the current word
            <span
              className={cn(
                "block whitespace-nowrap",
                getAlignmentClass(),
                wordClassName
              )}
              style={{
                height: `${maxHeight}px`,
                lineHeight: `${maxHeight}px`,
              }}
            >
              {currentWord}
            </span>
          )}
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
export function WordRotateDemoHeroSection() {
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