import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/header";
import ClerkProviderWrapper from "@/components/providers/clerk-provider";
import { Toaster } from "sonner";
import FinanceChat from "@/components/finance-chat";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FinX",
  description: "Master your Finances",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className={inter.className}>
        <ClerkProviderWrapper>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />
          <FinanceChat />
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}
