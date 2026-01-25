"use client";

import { useRouter, usePathname } from "next/navigation";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function FinanceChat() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  if (!isSignedIn) return null;

  const isOnChatPage = pathname === "/chat";

  const handleClick = () => {
    if (isOnChatPage) {
      router.back();
    } else {
      router.push("/chat");
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`group fixed bottom-6 right-6 z-50 transition-all duration-500 active:scale-95 overflow-hidden ${
        isOnChatPage
          ? "h-12 w-12 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 shadow-lg hover:shadow-xl"
          : "h-20 w-20 rounded-full bg-gradient-to-br from-primary via-emerald-500 to-teal-400 shadow-2xl shadow-primary/40 hover:scale-110 hover:shadow-3xl hover:shadow-primary/50"
      }`}
    >
      {isOnChatPage ? (
        // Minimal back button on chat page
        <>
          <div className="relative z-10 flex items-center justify-center h-full w-full">
            <ArrowLeft className="h-5 w-5 text-foreground transition-transform duration-300 group-hover:-translate-x-0.5" strokeWidth={2} />
          </div>
        </>
      ) : (
        // Full featured button on other pages
        <>
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
          
          {/* Enhanced glow effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-primary via-emerald-400 to-teal-300 opacity-60 group-hover:opacity-90 blur-xl transition-opacity duration-500 rounded-full animate-pulse" />
          
          {/* Icon container */}
          <div className="relative z-10 flex items-center justify-center h-full w-full">
            <Sparkles className="h-9 w-9 text-white drop-shadow-2xl transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 filter brightness-110" strokeWidth={2.5} />
          </div>
          
          {/* Multiple pulse rings for more attention */}
          <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping opacity-30" />
          <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping opacity-20" style={{ animationDelay: '0.5s' }} />
        </>
      )}
    </button>
  );
}
