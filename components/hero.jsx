"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";


const HeroSection = () => {
    
return (
    <div className="pb-20 px-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl lg:text-[60px]  gradient-title">
            Stay ahead of your <br /> finances
          </h1>
          <p className="mt-4 text-gray-600">
            A smart financial management system to help you manage your finances better.
          </p>
          <div className="mt-6">
            <Link href="/dashboard">
              <Button size="lg" className="px-8">Get Started</Button>
            </Link>
          </div>
        </div>

        <div className="md:w-1/2 flex justify-center mt-8 md:mt-0">
        <div>
          <Image 
            src="/Untitled design.png" 
            width={600} 
            height={600}
            alt="Dashboard preview"
            //className="rounded-lg shadow-2xl border"
            priority
          />
        </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
