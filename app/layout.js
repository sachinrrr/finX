import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/header";
import ClerkProviderWrapper from "@/components/providers/clerk-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FinX",
  description: "Master your Finances",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className={inter.className}>
        <ClerkProviderWrapper>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}
