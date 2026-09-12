"use client";

import { useCallback, useRef, useState } from "react";

import { Plasma } from "./Plasma";
import type { PlasmaStat } from "./engine";

/**
 * Il plasma di sfondo con i suoi comandi.
 *
 * Lo stato vive qui, non dentro il canvas: i comandi devono poter stare
 * altrove nella pagina e comunque muovere il campo.
 *
 * La densità è espressa dal corpo della cella in pixel, ma lo slider non
 * chiede quello a chi guarda: scorrendo verso destra i caratteri diventano più
 * piccoli e quindi più numerosi, che è il modo in cui uno se lo aspetta. Perciò
 * il valore mostrato è il numero di colonne, e il cursore lavora su una scala
 * rovesciata rispetto al corpo.
 */

const CELLA_MIN = 5; /* caratteri minuscoli, griglia fittissima */
const CELLA_MAX = 22; /* caratteri grossi, si contano a occhio */

export function PlasmaStage() {
  const [ascii, setAscii] = useState(true);
  const [cellW, setCellW] = useState(11);
  const grigliaRef = useRef<HTMLSpanElement>(null);

  /* Il conteggio delle celle arriva dal ciclo di disegno quattro volte al
     secondo: scriverlo nel nodo costa un'assegnazione, passarlo in stato
     costerebbe un render dell'intera intestazione. */
  const onStat = useCallback((s: PlasmaStat) => {
    const node = grigliaRef.current;
    if (node) node.textContent = s.ascii ? `${s.cols}×${s.rows}` : `${s.width}×${s.height}`;
  }, []);

  /* rovesciata: cursore a destra = celle piccole = più caratteri */
  const valoreSlider = CELLA_MIN + CELLA_MAX - cellW;

  return (
    <>
      <Plasma
        variant="background"
        ascii={ascii}
        cellW={cellW}
        onStat={onStat}
        className="absolute inset-0 -z-20 h-full w-full opacity-90 [touch-action:pan-y]"
      />

      {/* il velo non deve intercettare il puntatore: sotto c'è il campo.
          Due versioni, e non per vezzo: su un telefono il testo occupa quasi
          tutta la larghezza, quindi la macchia scura si sposta al centro e si fa
          più coprente sotto il blocco di testo; su schermo largo il testo sta a
          sinistra e basta aprire una zona d'ombra lì, lasciando libero il resto
          del campo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_58%_at_40%_50%,rgba(7,6,12,0.9)_0%,rgba(7,6,12,0.62)_48%,rgba(7,6,12,0)_84%),linear-gradient(to_bottom,rgba(7,6,12,0.3)_0%,rgba(7,6,12,0)_22%,rgba(7,6,12,0.34)_74%,rgba(7,6,12,0.8)_94%,var(--background)_100%)] sm:bg-[radial-gradient(88%_66%_at_14%_38%,rgba(7,6,12,0.88)_0%,rgba(7,6,12,0.42)_44%,rgba(7,6,12,0)_74%),linear-gradient(to_bottom,rgba(7,6,12,0.28)_0%,rgba(7,6,12,0)_26%,rgba(7,6,12,0.42)_84%,var(--background)_100%)]"
      />

      {/* Un velo in più, solo per il modo a pixel. Non è un ripensamento sul
          primo: una griglia di caratteri è fatta all'ottanta per cento di fondo
          scuro fra i glifi, quindi la sua luminosità media è bassa e il testo
          ci sta sopra tranquillo; il plasma pieno illumina ogni pixel, e senza
          questo strato la frase in grigio finirebbe sopra l'arancione. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 bg-background/45 transition-opacity duration-500 ${
          ascii ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* i comandi: in basso a destra sul desktop, in fondo al centro sul
          telefono, dove il pollice arriva senza spostare la mano */}
      <div className="absolute inset-x-4 bottom-4 z-10 sm:inset-x-auto sm:bottom-6 sm:right-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-hairline bg-surface/70 p-3 backdrop-blur-md sm:w-64">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-faint">
              Sfondo
            </span>
            <span ref={grigliaRef} className="font-mono text-[0.7rem] tabular-nums text-faint">
              —
            </span>
          </div>

          {/* Due stati, quindi due pulsanti e non un menù: si vede da subito
              cosa si può scegliere. `aria-pressed` dice a chi non vede quale
              dei due è attivo. */}
          <div className="flex gap-1 rounded-full border border-hairline p-1">
            <ModoBtn attivo={ascii} onClick={() => setAscii(true)}>
              Caratteri
            </ModoBtn>
            <ModoBtn attivo={!ascii} onClick={() => setAscii(false)}>
              Pixel
            </ModoBtn>
          </div>

          <label
            className={`flex flex-col gap-1.5 transition-opacity ${
              ascii ? "opacity-100" : "pointer-events-none opacity-40"
            }`}
          >
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-faint">
              Densità
            </span>
            <input
              type="range"
              min={CELLA_MIN}
              max={CELLA_MAX}
              step={1}
              value={valoreSlider}
              disabled={!ascii}
              aria-label="Densità dei caratteri dello sfondo"
              onChange={(e) => setCellW(CELLA_MIN + CELLA_MAX - Number(e.target.value))}
              className="plasma-range"
            />
          </label>
        </div>
      </div>
    </>
  );
}

function ModoBtn({
  attivo,
  onClick,
  children,
}: {
  attivo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={attivo}
      className={`flex-1 rounded-full px-3 py-1.5 font-mono text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viola ${
        attivo ? "bg-viola font-semibold text-on-accent" : "text-dim hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
