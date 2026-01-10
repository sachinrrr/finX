"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { WordRotate } from "@/components/ui/word-rotate";


const HeroSection = () => {
  const words = useMemo(
    () => ["track", "manage", "plan", "optimize", "analyze", "monitor", "improve"],
    []
  );
return (
    <div className="relative pt-24 sm:pt-28 md:pt-32 pb-20 sm:pb-24 px-4 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.10),transparent_55%),radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.06),transparent_50%)]"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-6 animate-fade-in-up pt-6 sm:pt-8">
            <span className="mx-auto block leading-[1.12] text-balance">
              <span
                className="inline-flex items-baseline justify-center gap-2 sm:gap-3"
              >
                <WordRotate
                  words={words}
                  intervalMs={2000}
                  rollMs={520}
                  align="right"
                  wordClassName="bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-50 bg-clip-text text-transparent"
                />

                <span className="text-foreground whitespace-nowrap">your finances</span>
              </span>
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-200 leading-relaxed text-balance">
            FinX gives you a clean view of accounts, spend, and cash flow
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up animation-delay-400">
            <Link href="/dashboard">
              <Button size="lg" className="px-8 text-base group">
                Open dashboard
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 text-base">
              View product
            </Button>
          </div>
          
          {/* Feature highlights */}
        </div>
      </div>

    </div>
  );
};

export default HeroSection;
