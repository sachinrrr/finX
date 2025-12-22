"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";


const HeroSection = () => {
    
return (
    <div className="relative pt-32 pb-20 px-4 overflow-hidden bg-black">
      {/* Animated gradient background with dark theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-20"></div>
      
      {/* Glowing orbs for depth */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-blob"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-600/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      
      {/* Subtle spotlight effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-radial from-purple-900/10 via-transparent to-transparent"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold gradient-title mb-6 animate-fade-in-up pt-8">
            Stay ahead of your <br /> finances
          </h1>
          
          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-200 leading-relaxed">
            A smart financial management system to help you manage your finances better. 
            Track expenses, set budgets, and achieve your financial goals.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up animation-delay-400">
            <Link href="/dashboard">
              <Button size="lg" className="px-8 text-base group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 shadow-lg shadow-purple-500/25">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 text-base bg-white/5 backdrop-blur-md border-white/10 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all">
              Learn More
            </Button>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16 animate-fade-in-up animation-delay-600">
            <div className="group bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mb-4 mx-auto border border-blue-500/20 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Track Growth</h3>
              <p className="text-sm text-gray-400">Monitor your financial progress in real-time</p>
            </div>
            
            <div className="group bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mb-4 mx-auto border border-purple-500/20 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Secure & Safe</h3>
              <p className="text-sm text-gray-400">Bank-level security for your data</p>
            </div>
            
            <div className="group bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-xl flex items-center justify-center mb-4 mx-auto border border-pink-500/20 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-400">Instant insights and updates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
