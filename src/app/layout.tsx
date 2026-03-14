import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google"; // Using more sporty fonts
import "./globals.css";
import PageTransition from "@/components/layout/PageTransition";
import { ToastProvider } from "@/components/ui/Toast";
import { CookieConsent } from "@/components/ui/CookieConsent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const rajdhani = Rajdhani({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
});

export const metadata: Metadata = {
  title: "Agendouu | Aluguel e Gestão de Quadras Esportivas",
  description: "Alugue quadras para jogar perto de você em segundos. Dono de arena? Automatize as reservas e os pagamentos com nosso app. Experimente grátis!",
  openGraph: {
    title: "Agendouu | Sistema para Gestão de Quadras e Arenas",
    description: "Automatize reservas, receba pagamentos e acabe com os furos na agenda.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agendouu | O sistema definitivo para Quadras",
    description: "Alugue quadras ou gerencie sua arena esportiva online com pagamentos automatizados.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="bg-black">
      <body
        className={`${inter.variable} ${rajdhani.variable} antialiased bg-black text-foreground font-sans overflow-x-hidden`}
      >
        <ToastProvider>
          <PageTransition>{children}</PageTransition>
          <CookieConsent />
        </ToastProvider>
      </body>
    </html>
  );
}
