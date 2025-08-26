import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleTagManager } from "@/components/GoogleTagManager";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Diagnóstico de Maturidade em Dados",
  description: "Avalie gratuitamente o nível de maturidade em dados da sua empresa e receba um plano personalizado para transformar informações em resultados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <GoogleTagManager />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
