import { BoardLoadingProvider } from "@/contexts/BoardLoadingContext";
import { AuthProvider } from "@/providers/auth-provider";
import { TanStackProvider } from "@/providers/tanstack-provider";
import ThemeProvider from "@/providers/theme-provider";

import { Inter } from "next/font/google";

import { FullscreenLoader } from "@/components/ui/fullscreen-loader";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <TanStackProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <BoardLoadingProvider>
              <AuthProvider>{children}</AuthProvider>
              <FullscreenLoader />
            </BoardLoadingProvider>
          </ThemeProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}
