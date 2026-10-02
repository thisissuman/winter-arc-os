import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";
import { Connectivity } from "@/components/connectivity";
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
  applicationName: "Winter Arc OS",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Winter Arc" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#101115" }, { media: "(prefers-color-scheme: light)", color: "#f7f7fa" }] };
export const dynamic = "force-dynamic";
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const preference = (await cookies()).get("winter-arc-theme")?.value;
  const theme = preference && ["dark", "light", "system"].includes(preference) ? preference : "dark";
  return <html lang="en" className={`${geist.variable} ${theme === "light" ? "" : "dark"}`} suppressHydrationWarning>
    <body className="min-h-dvh"><ThemeProvider defaultTheme={theme}><Connectivity />{children}</ThemeProvider></body>
  </html>;
}
