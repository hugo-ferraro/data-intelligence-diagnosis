import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleTagManager } from "@/components/GoogleTagManager";
import CookieConsent from "@/components/CookieConsent";
import Footer from "@/components/Footer";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Diagnóstico de Maturidade em Dados",
  description: "Avalie gratuitamente o nível de maturidade em dados da sua empresa e receba um plano personalizado para transformar informações em resultados.",
  keywords: ["dados", "maturidade", "diagnóstico", "empresa", "análise", "transformação digital"],
  authors: [{ name: "Falqon" }],
  creator: "Falqon",
  publisher: "Falqon",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://diagnostico.falqon.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://diagnostico.falqon.ai',
    title: 'Diagnóstico de Maturidade em Dados - Falqon',
    description: 'Avalie gratuitamente o nível de maturidade em dados da sua empresa e receba um plano personalizado para transformar informações em resultados.',
    siteName: 'Falqon - Diagnóstico de Dados',
    images: [
      {
        url: '/home-page-screenshot.png',
        width: 1200,
        height: 630,
        alt: 'Falqon - Diagnóstico de Maturidade em Dados',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diagnóstico de Maturidade em Dados - Falqon',
    description: 'Avalie gratuitamente o nível de maturidade em dados da sua empresa e receba um plano personalizado para transformar informações em resultados.',
    images: ['/home-page-screenshot.png'],
    creator: '@falqon',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
  },
  manifest: '/site.webmanifest',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: '#ffffff',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Diagnóstico Dados" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Diagnóstico Dados" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <GoogleTagManager />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <CookieConsent />
        </TooltipProvider>
      </body>
    </html>
  );
}
