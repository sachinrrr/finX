"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

export default function ClerkProviderWrapper({ children }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      {children}
    </ClerkProvider>
  );
}
