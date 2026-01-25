"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight, Play } from "lucide-react";
import { WordRotate } from "@/components/ui/word-rotate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const HERO_WORDS = [
  "track",
  "manage",
  "plan",
  "optimize",
  "analyze",
  "monitor",
  "improve",
];

const HeroSection = () => {
  const words = HERO_WORDS;
  const [showDemoVideo, setShowDemoVideo] = useState(false);

  return (
    <>
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
                    intervalMs={3000}
                    rollMs={900}
                    spinCount={5}
                    align="right"
                    wordClassName="bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-50 bg-clip-text text-transparent font-bold"
                  />

                  <span className="text-foreground whitespace-nowrap">your finances</span>
                </span>
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-200 leading-relaxed text-balance">
              Smart cash flow management powered by your finacial data. Sync once, stay organized forever
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up animation-delay-400">
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  className="px-8 py-6 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 group"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-6 text-base font-semibold border-2 hover:bg-muted/50 transition-all duration-300 group"
                onClick={() => setShowDemoVideo(true)}
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>
            
            {/* Feature highlights */}
          </div>
        </div>

      </div>

      {/* Demo Video Dialog */}
      <Dialog open={showDemoVideo} onOpenChange={setShowDemoVideo}>
        <DialogContent className="max-w-4xl w-[95vw] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-2xl font-semibold">FinX Demo</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full bg-muted rounded-b-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="FinX Demo Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeroSection;
