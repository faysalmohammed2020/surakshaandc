import type { Metadata } from "next";
import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/500.css";
import "@fontsource/hind-siliguri/600.css";
import "@fontsource/baloo-da-2/600.css";
import "@fontsource/baloo-da-2/700.css";
import "@fontsource/baloo-da-2/800.css";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";

/** Root layout for the staff panel (/admin and /auth). The public site has its own in (site)/[locale]. */
export const metadata: Metadata = {
  title: { default: "Suraksha Admin", template: "%s · Suraksha Admin" },
  robots: { index: false, follow: false },
};

export default function PanelRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
