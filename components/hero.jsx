"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";


const HeroSection = () => {
    
return (
    <div className="relative pt-32 pb-24 px-4 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.10),transparent_55%),radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.06),transparent_50%)]"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-6 animate-fade-in-up pt-8">
            See every dollar clearly — <br /> plan with confidence
          </h1>
          
          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-200 leading-relaxed">
            FinX gives you a clean view of accounts, spend, and cash flow. Built for calm execution — not noisy dashboards.
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
