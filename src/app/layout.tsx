import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { DemoModeProvider } from "@/components/providers/DemoModeProvider";
import { SoftWarm } from "@/components/providers/SoftWarm";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ObservabilityProvider } from "@/components/providers/ObservabilityProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { NavigationProgress } from "@/components/providers/NavigationProgress";
import { siteConfig } from "@/lib/seo/site";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${fraunces.variable} ${jetbrainsMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Script
          id="spotsync-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='spotsync-theme';var t=localStorage.getItem(k)||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.classList.toggle('light',!d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          <ObservabilityProvider>
            <QueryProvider>
              <ToastProvider>
                <AuthProvider>
                  <DemoModeProvider>
                    <SoftWarm />
                    <NavigationProgress />
                    {children}
                  </DemoModeProvider>
                </AuthProvider>
              </ToastProvider>
            </QueryProvider>
          </ObservabilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
