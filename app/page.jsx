"use client";

import { useEffect, useRef } from "react";
import HeroSection from "@/components/hero";
import Footer from "@/components/footer";
import { featuresData, howItWorksData } from "@/data/landing";

export default function Home() {
  const scrollContainerRef = useRef(null);

  // Smooth auto-scroll for features section
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let animationId;
    let isHovering = false;
    let currentPosition = 0;
    const scrollSpeed = 0.15; // Slow belt-like scrolling speed
    const cardWidth = 400; // Approximate card width + gap

    // Smooth continuous scrolling animation
    const smoothScroll = () => {
      if (!isHovering && scrollContainer) {
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        
        currentPosition += scrollSpeed;
        
        // Loop back to start when reaching the end
        if (currentPosition >= maxScroll) {
          currentPosition = 0;
        }
        
        scrollContainer.scrollLeft = currentPosition;
      }
      
      animationId = requestAnimationFrame(smoothScroll);
    };

    const handleMouseEnter = () => {
      isHovering = true;
    };

    const handleMouseLeave = () => {
      isHovering = false;
    };

    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);

    // Start the smooth scroll animation
    animationId = requestAnimationFrame(smoothScroll);

    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer?.removeEventListener("mouseenter", handleMouseEnter);
      scrollContainer?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      {/* Background effects */}
      {/* Subtle glow effects */}

      {/* Features Section */}
      <section id="features" className="py-24 bg-background relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-foreground">
              Powerful Features
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to manage your finances with confidence
            </p>
          </div>
          
          {/* Horizontal Scrolling Features */}
          <div className="relative">
            {/* Scroll container */}
            <div ref={scrollContainerRef} className="overflow-x-auto pb-8 scrollbar-hide scroll-smooth">
              <div className="flex gap-6 px-4 md:px-0 min-w-max">
                {featuresData.map((feature, index) => (
                  <div
                    key={index}
                    className="group relative w-[340px] md:w-[380px] p-10 rounded-2xl bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-sm border-2 border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-primary/10 flex-shrink-0"
                  >
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                    
                    {/* Glow effect on hover */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                    
                    <div className="relative z-10">
                      {/* Icon container with enhanced styling */}
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-lg shadow-primary/10 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-300">
                        {feature.icon}
                      </div>
                      
                      <h3 className="text-xl font-semibold tracking-tight text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 border-y border-border bg-background">
        {/* Background effects */}
        {/* Decorative glow */}
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-foreground">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get started in three simple steps and take control of your financial future
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {howItWorksData.map((step, index) => (
              <div
                key={index}
                className="group relative text-center p-8 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
              >
                {/* Step number badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                  {index + 1}
                </div>
                
                {/* Icon container */}
                <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6 border border-border bg-card">
                  {step.icon}
                </div>
                
                <h3 className="text-xl font-semibold tracking-tight mb-4 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
