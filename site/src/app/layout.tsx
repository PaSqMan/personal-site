import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { site } from "@/content/site";

import "./globals.css";

/* `next/font` scarica i file alla build e li serve dal sito: nessuna richiesta
   a Google quando la pagina si apre, quindi niente terze parti da dichiarare. */
const sans = Inter({
  variable: "--font-sans-stack",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-stack",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.seo.url),
  title: {
    default: site.seo.titolo,
    template: `%s — ${site.persona.handle}`,
  },
  description: site.seo.descrizione,
  authors: [{ name: site.persona.nome, url: site.persona.github }],
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: site.persona.nome,
    title: site.seo.titolo,
    description: site.seo.descrizione,
  },
};

/* Il fondo va dichiarato anche al browser, non solo al CSS: senza, la barra
   degli indirizzi su mobile resta chiara e stacca dalla pagina. */
export const viewport: Viewport = {
  themeColor: "#07060c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="it"
      // Lascia a Next.js la gestione dello scroll fra le navigazioni, tenendo
      // morbido lo scorrimento sulle ancore interne (richiesto da Next.js 16).
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${mono.variable} scroll-smooth antialiased`}
    >
      <body className="flex min-h-svh flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
