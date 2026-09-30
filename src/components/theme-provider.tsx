"use client";
import { ThemeProvider as NextThemeProvider } from "next-themes";
export function ThemeProvider({ children, defaultTheme }: { children: React.ReactNode; defaultTheme: string }) {
  return <NextThemeProvider attribute="class" defaultTheme={defaultTheme} forcedTheme={defaultTheme} storageKey="winter-arc-theme" enableSystem disableTransitionOnChange>{children}</NextThemeProvider>;
}
