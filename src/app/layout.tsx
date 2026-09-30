import type { Metadata } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geist = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});
export const metadata: Metadata = {
  title: { default: "Winter Arc OS", template: "%s · Winter Arc OS" },
  description: "Your private workspace for the days ahead.",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const preference = (await cookies()).get("winter-arc-theme")?.value;
  const theme = preference && ["dark", "light", "system"].includes(preference) ? preference : "dark";
  return <html lang="en" className={`${geist.variable} ${theme === "light" ? "" : "dark"}`} suppressHydrationWarning>
    <body className="min-h-dvh"><ThemeProvider defaultTheme={theme}>{children}</ThemeProvider></body>
  </html>;
}
