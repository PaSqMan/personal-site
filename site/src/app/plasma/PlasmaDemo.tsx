"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Plasma } from "@/components/plasma/Plasma";
import type { PlasmaStat } from "@/components/plasma/engine";

/**
 * La demo a schermo pieno: il plasma e nient'altro, con i comandi e i numeri.
 *
 * Il riquadro dei numeri si aggiorna quattro volte al secondo e non passa per
 * lo stato di React: scrive direttamente nel nodo. Un `useState` a ogni quadro
 * farebbe rendere l'albero 60 volte al secondo per aggiornare due cifre.
 */
export function PlasmaDemo() {
  const statRef = useRef<HTMLDivElement>(null);
  const [via, setVia] = useState(false);
  const toccato = useRef(false);

  const onStat = useCallback((s: PlasmaStat) => {
    const node = statRef.current;
    if (!node) return;
    const griglia = s.ascii ? `${s.cols}×${s.rows} celle` : `${s.width}×${s.height} px`;
    node.textContent = `${s.fps.toFixed(0)} fps · ${griglia} · vel ${s.speed.toFixed(2)}`;
  }, []);

  /* Al primo tocco l'aiuto ha fatto il suo lavoro: dopo un momento si ritira. */
  useEffect(() => {
    const nascondi = () => {
      if (toccato.current) return;
      toccato.current = true;
      setTimeout(() => setVia(true), 2600);
    };
    window.addEventListener("pointerdown", nascondi, { once: true });
    window.addEventListener("pointermove", nascondi, { once: true });
    return () => {
      window.removeEventListener("pointerdown", nascondi);
      window.removeEventListener("pointermove", nascondi);
    };
  }, []);

  /* `H` nasconde l'interfaccia: il tasto è dell'interfaccia, non del motore. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "h") setVia((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="fixed inset-0 overflow-hidden">
      <Plasma
        variant="full"
        onStat={onStat}
        className="h-full w-full cursor-crosshair [touch-action:none]"
      />

      <Link
        href="/"
        prefetch={false}
        className="absolute left-4 top-4 rounded-full border border-hairline bg-surface/60 px-3.5 py-1.5 font-mono text-xs text-ink no-underline backdrop-blur transition hover:border-viola"
      >
        ← pasqman
      </Link>

      <div
        className={`pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 transition-opacity duration-300 ${
          via ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="max-w-[58ch] rounded-xl border border-hairline bg-surface/60 p-3 font-mono text-xs leading-relaxed text-dim backdrop-blur">
          <h1 className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
            Plasma
          </h1>
          Muovi il puntatore: sposta il centro e, se corri, il campo accelera. Clicca per
          un&rsquo;onda, rotella per la scala.
          <br />
          <Kbd>B</Kbd> caratteri/pixel · <Kbd>C</Kbd> colore · <Kbd>+ -</Kbd> corpo ·{" "}
          <Kbd>spazio</Kbd> ferma · <Kbd>R</Kbd> azzera · <Kbd>H</Kbd> nasconde
        </div>

        <div
          ref={statRef}
          className="hidden whitespace-nowrap rounded-xl border border-hairline bg-surface/60 p-3 font-mono text-xs tabular-nums text-dim backdrop-blur sm:block"
        >
          —
        </div>
      </div>
    </main>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded border border-hairline px-1 text-ink">{children}</kbd>;
}
