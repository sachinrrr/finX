import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./button";
import {  LayoutDashboard, Plus } from "lucide-react";
import { checkUser } from "@/lib/checkUser";


const Header = async () => {
  await checkUser();
  
  return (
    <div className="fixed top-0 w-full bg-black/90 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/">
          <Image 
            src="/finx.logo.png"
            alt="finx logo"
            height={60}
            width={200}
            className="h-8 w-auto object-contain"
          />
        </Link>

        {/* Authentication Buttons */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            <Link href={"/dashboard"} className="text-gray-800 hover:text-pink-800 flex items-center gap-2">
              <Button className="bg-gray-300 hover:bg-pink-700">
                <LayoutDashboard size={18} className="text-black"/>
                <span className="hidden md:inline text-black">Dashboard</span>
              </Button>
            </Link>

            <Link href={"/transaction/create"}>
              <Button className="bg-gray-300 hover:bg-pink-700 flex items-center gap-2">
                <Plus size={18} className="text-black"/>
                <span className="hidden md:inline text-black">Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button variant="outline">Login</Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="outline">Sign up</Button>
            </SignUpButton>
          </SignedOut>  

          <SignedIn>
            <UserButton appearance={{
              elements: {
                avatarBox: "w-9 h-9",

              },
            }}/>
          </SignedIn>
        </div>

      </nav>
    </div>
  );
};

export default Header;