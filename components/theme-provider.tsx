"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

/** Light/dark for the staff panel only (the public site is always light). */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="suraksha-admin-theme">
      {children}
    </NextThemesProvider>
  );
}

export { useTheme };
