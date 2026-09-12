"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useMotoRidotto } from "@/lib/motoRidotto";

import { Plasma } from "./Plasma";
import type { PlasmaStat } from "./engine";

/**
 * Il plasma di sfondo con i suoi comandi.
 *
 * Lo stato vive qui, non dentro il canvas: i comandi devono poter stare
 * altrove nella pagina e comunque muovere il campo.
 *
 * I comandi non hanno un riquadro. Un pannello con bordo e fondo sfocato si
 * annuncia come un pezzo di interfaccia e si mette in concorrenza col nome, che
 * è la cosa da guardare; qui restano segni tipografici appoggiati sul campo —
 * tre parole, un filo e un numero. Non spariscono, ma stanno in grigio tenue e
 * diventano pieni quando ci si passa sopra o li si raggiunge da tastiera: la
 * gerarchia la fa il contrasto, non una scatola.
 *
 * Il contrasto passa dai colori, non dall'opacità: `--faint` sul fondo dà
 * 4.96:1, appena sopra la soglia AA, e velarlo al 55% lo porterebbe sotto.
 */

const CELLA_MIN = 5; /* caratteri minuscoli, griglia fittissima */
const CELLA_MAX = 22; /* caratteri grossi, si contano a occhio */

/**
 * Il giro della modalità automatica: venti secondi, di cui l'ottanta per cento
 * a colori e il resto in bianco e nero.
 *
 * La durata non è casuale. Sotto i dieci secondi il cambio diventa un tic che
 * tira l'occhio via dal testo mentre lo si legge; molto sopra i venti, chi
 * arriva e riparte non vede mai il secondo stato e la modalità non si capisce.
 * Venti secondi fanno sì che il passaggio capiti una volta nella visita tipica,
 * come una cosa che succede, non come un'animazione che gira.
 */
const CICLO_MS = 20_000;
const QUOTA_COLORE = 0.8;
const COLORE_MS = CICLO_MS * QUOTA_COLORE;
const MONO_MS = CICLO_MS - COLORE_MS;

type Modo = "auto" | "ascii" | "pixels";

export function PlasmaStage() {
  const [modo, setModo] = useState<Modo>("auto");
  const [coloreAuto, setColoreAuto] = useState(true);
  const [coloreManuale, setColoreManuale] = useState(true);
  const [cellW, setCellW] = useState(11);
  const grigliaRef = useRef<HTMLSpanElement>(null);
  const motoRidotto = useMotoRidotto();

  /*  L'alternanza della modalità automatica.
   *
   *  Il primo stato non si imposta qui: è già quello iniziale (a colori), e il
   *  timer programma solo il passaggio successivo. Scriverlo nell'effetto
   *  vorrebbe dire un secondo render a ogni ingresso in modalità automatica,
   *  per arrivare al valore che c'era già.
   *
   *  Chi ha chiesto meno movimento resta a colori, fermo: un cambio ogni venti
   *  secondi è poco, ma è comunque un cambiamento che non ha chiesto.
   */
  useEffect(() => {
    if (modo !== "auto" || motoRidotto) return;

    let timer: number | undefined;
    const passo = (colore: boolean) => {
      setColoreAuto(colore);
      timer = window.setTimeout(() => passo(!colore), colore ? COLORE_MS : MONO_MS);
    };
    timer = window.setTimeout(() => passo(false), COLORE_MS);
    return () => window.clearTimeout(timer);
  }, [modo, motoRidotto]);

  /* Il conteggio delle celle arriva dal ciclo di disegno quattro volte al
     secondo: scriverlo nel nodo costa un'assegnazione, passarlo in stato
     costerebbe un render dell'intera intestazione. */
  const onStat = useCallback((s: PlasmaStat) => {
    const node = grigliaRef.current;
    if (node) node.textContent = s.ascii ? `${s.cols}×${s.rows}` : `${s.width}×${s.height}`;
  }, []);

  const ascii = modo !== "pixels";
  /* Il bianco e nero riguarda i caratteri: senza glifi non è una scelta di
     stile, è un plasma grigio. In `pixels` il colore resta sempre acceso. */
  const colore = modo === "pixels" ? true : modo === "auto" ? coloreAuto : coloreManuale;

  /* rovesciata: cursore a destra = celle piccole = più caratteri */
  const valoreSlider = CELLA_MIN + CELLA_MAX - cellW;

  return (
    <>
      <Plasma
        variant="background"
        ascii={ascii}
        color={colore}
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

      {/* `group` fa salire di tono tutto l'insieme quando il puntatore entra in
          zona, non il singolo pezzo toccato: così i comandi si accendono come
          un gruppo e restano leggibili mentre li si usa. */}
      <div className="group absolute inset-x-6 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] sm:inset-x-auto sm:bottom-8 sm:right-8 sm:flex-nowrap sm:justify-end">
        <Gruppo>
          <Voce attiva={modo === "auto"} onClick={() => setModo("auto")}>
            Auto
          </Voce>
          <Barra />
          <Voce attiva={modo === "ascii"} onClick={() => setModo("ascii")}>
            Ascii
          </Voce>
          <Barra />
          <Voce attiva={modo === "pixels"} onClick={() => setModo("pixels")}>
            Pixels
          </Voce>
        </Gruppo>

        {/* Compare solo a caratteri scelti a mano: in automatico lo decide il
            ciclo, e un comando che non comanda niente è peggio di un comando
            assente. */}
        {modo === "ascii" && (
          <Gruppo>
            <Voce attiva={coloreManuale} onClick={() => setColoreManuale(true)}>
              Color
            </Voce>
            <Barra />
            <Voce attiva={!coloreManuale} onClick={() => setColoreManuale(false)}>
              Mono
            </Voce>
          </Gruppo>
        )}

        <label
          className={`flex items-center gap-2.5 transition-opacity duration-300 ${
            ascii ? "" : "pointer-events-none opacity-30"
          }`}
        >
          <span className="text-faint transition-colors group-hover:text-dim">Density</span>
          <input
            type="range"
            min={CELLA_MIN}
            max={CELLA_MAX}
            step={1}
            value={valoreSlider}
            disabled={!ascii}
            aria-label="Background character density"
            onChange={(e) => setCellW(CELLA_MIN + CELLA_MAX - Number(e.target.value))}
            className="plasma-range w-24 sm:w-28"
          />
        </label>

        {/* Il conteggio è un promemoria, non un'informazione da cercare: resta
            tenue e su schermi stretti esce di scena, dove lo spazio serve ai
            comandi veri. */}
        <span
          ref={grigliaRef}
          className="hidden tabular-nums normal-case tracking-normal text-faint/70 transition-colors group-hover:text-faint sm:inline"
        >
          —
        </span>
      </div>
    </>
  );
}

function Gruppo({ children }: { children: React.ReactNode }) {
  return <div className="flex items-baseline gap-2.5">{children}</div>;
}

function Barra() {
  return (
    <span aria-hidden="true" className="text-faint/40">
      /
    </span>
  );
}

function Voce({
  attiva,
  onClick,
  children,
}: {
  attiva: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={attiva}
      className={`relative pb-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-viola ${
        attiva
          ? "text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-viola after:content-['']"
          : "text-faint hover:text-dim"
      }`}
    >
      {children}
    </button>
  );
}
