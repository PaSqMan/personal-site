import type { NextConfig } from "next";

/**
 * Sottocartella da cui il sito viene servito.
 *
 * Su GitHub Pages un sito "di progetto" sta sotto il nome del repository
 * (`https://pasqman.github.io/animation/`), quindi tutti i percorsi assoluti
 * — `/_next/…`, le immagini — vanno prefissati o restituiscono 404. Su dominio
 * proprio, o su un repository chiamato `PaSqMan.github.io`, la variabile resta
 * vuota e non cambia nulla.
 *
 * Si imposta al momento della build; il workflow la ricava dal nome del repo:
 *   NEXT_PUBLIC_BASE_PATH=/animation npm run build
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Sito completamente statico: `next build` produce `out/`, pubblicabile su
  // qualsiasi hosting senza un runtime Node.
  output: "export",

  // Senza server non c'è chi ottimizzi le immagini al volo.
  images: { unoptimized: true },

  // Ogni rotta diventa una cartella con index.html (/plasma/index.html): è il
  // formato che gli hosting statici servono senza configurazione.
  trailingSlash: true,

  basePath,
  // `next/link` e `next/image` applicano `basePath` da soli; `assetPrefix`
  // copre i file statici di Next (JS, CSS, font).
  assetPrefix: basePath || undefined,
};

export default nextConfig;
