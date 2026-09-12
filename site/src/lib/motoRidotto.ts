"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Legge `prefers-reduced-motion` senza passare per uno stato aggiornato in un
 * effetto: `useSyncExternalStore` è fatto per le sorgenti esterne a React, dà
 * un valore anche durante il prerender sul server (dove `matchMedia` non
 * esiste) e si riaggiorna se l'impostazione cambia mentre la pagina è aperta.
 *
 * Serve a più di un componente — la battitura del nome e l'alternanza dello
 * sfondo — quindi sta qui invece di essere copiato in entrambi.
 */
export function useMotoRidotto(): boolean {
  return useSyncExternalStore(
    (avvisa) => {
      const mq = window.matchMedia(QUERY);
      mq.addEventListener("change", avvisa);
      return () => mq.removeEventListener("change", avvisa);
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
