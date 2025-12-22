import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./button";
import {  LayoutDashboard, Plus } from "lucide-react";


const Header = () => {
  return (
    <div className="fixed top-0 w-full bg-black/95 backdrop-blur-xl z-50 border-b border-white/10">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <span className="text-3xl font-black gradient-title tracking-tighter group-hover:scale-105 transition-transform duration-200">
            FINX
          </span>
        </Link>

        {/* Authentication Buttons */}
        <div className="flex items-center gap-3">
          <SignedIn>
            <Link href={"/dashboard"}>
              <Button className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 text-white transition-all duration-300 backdrop-blur-md">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline ml-2">Dashboard</span>
              </Button>
            </Link>

            <Link href={"/transactions/create"}>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 text-white shadow-lg shadow-purple-500/25 transition-all duration-300">
                <Plus size={18} />
                <span className="hidden md:inline ml-2">Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>
          
          <SignedOut>
            <SignInButton>
              <Button className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 text-white transition-all duration-300 backdrop-blur-md">
                Login
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 text-white shadow-lg shadow-purple-500/25 transition-all duration-300">
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>  

          <SignedIn>
            <UserButton appearance={{
              elements: {
                avatarBox: "w-10 h-10 ring-2 ring-white/10 hover:ring-purple-500/50 transition-all",
              },
            }}/>
          </SignedIn>
        </div>

      </nav>
    </div>
  );
};

export default Header;