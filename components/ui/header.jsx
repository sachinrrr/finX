import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./button";
import {  LayoutDashboard, Plus } from "lucide-react";


const Header = () => {
  return (
    <div className="fixed top-0 w-full bg-background/80 backdrop-blur z-50 border-b border-border">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <span className="text-2xl font-semibold tracking-tight text-foreground group-hover:text-foreground/80 transition-colors duration-200">
            FINX
          </span>
        </Link>

        {/* Authentication Buttons */}
        <div className="flex items-center gap-3">
          <SignedIn>
            <Link href={"/dashboard"}>
              <Button variant="outline">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline ml-2">Dashboard</span>
              </Button>
            </Link>

            <Link href={"/transactions/create"}>
              <Button>
                <Plus size={18} />
                <span className="hidden md:inline ml-2">Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>
          
          <SignedOut>
            <SignInButton>
              <Button variant="outline">
                Login
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button>
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>  

          <SignedIn>
            <UserButton appearance={{
              elements: {
                avatarBox: "w-10 h-10 ring-1 ring-border hover:ring-ring transition-all",
              },
            }}/>
          </SignedIn>
        </div>

      </nav>
    </div>
  );
};

export default Header;