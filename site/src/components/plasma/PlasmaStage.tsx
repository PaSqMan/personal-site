"use client";

import { useEffect, useState, type ReactNode } from "react";

import { useMotoRidotto } from "@/lib/motoRidotto";

import { Plasma } from "./Plasma";

/**
 * Il plasma di sfondo e il suo unico comando.
 *
 * Lo sfondo fa una cosa sola e la fa da sé: alterna i caratteri a colori e in
 * bianco e nero, metà del tempo ciascuno. Non c'è un selettore di modalità —
 * tre voci più un secondo gruppo per il colore erano un pannello di regia per
 * uno sfondo, e uno sfondo non si regola, si guarda. Resta la densità, che
 * cambia davvero l'aspetto della cosa e che è divertente da muovere.
 *
 * Il comando non ha un riquadro: un pannello con bordo e fondo sfocato si
 * annuncia come interfaccia e fa concorrenza al nome, che è la cosa da
 * guardare. Sono due segni tipografici appoggiati sul campo, in grigio tenue,
 * che diventano pieni al passaggio del puntatore o da tastiera.
 *
 * Il contrasto passa dai colori, non dall'opacità: `--faint` sul fondo dà
 * 4.96:1, appena sopra la soglia AA, e velarlo al 55% lo porterebbe sotto.
 */

const CELLA_MIN = 5; /* caratteri minuscoli, griglia fittissima */
const CELLA_MAX = 22; /* caratteri grossi, si contano a occhio */

/**
 * Il giro dell'alternanza: venti secondi, metà a colori e metà in bianco e
 * nero.
 *
 * La durata non è casuale. Sotto i dieci secondi il cambio diventa un tic che
 * tira l'occhio via dal testo mentre lo si legge; molto sopra i venti, chi
 * arriva e riparte non vede mai il secondo stato. Venti fanno sì che il
 * passaggio capiti durante la visita tipica, come una cosa che succede.
 */
const MEZZO_CICLO_MS = 10_000;

/**
 * `children` finisce nella colonna in basso, sotto lo slider: quella colonna è
 * il posto dei comandi di questa pagina, e chi ne ha uno lo mette lì invece di
 * aprirsi un angolo per conto proprio. Il player della musica arriva da qui.
 */
export function PlasmaStage({ children }: { children?: ReactNode }) {
  const [colore, setColore] = useState(true);
  const [cellW, setCellW] = useState(11);
  const motoRidotto = useMotoRidotto();

  /*  Il primo stato non si imposta qui: è già quello iniziale (a colori), e il
   *  timer programma solo il passaggio successivo. Scriverlo nell'effetto
   *  vorrebbe dire un secondo render all'avvio per arrivare al valore che
   *  c'era già.
   *
   *  Chi ha chiesto meno movimento resta a colori, fermo: un cambio ogni dieci
   *  secondi è poco, ma è comunque un cambiamento che non ha chiesto.
   */
  useEffect(() => {
    if (motoRidotto) return;

    let timer: number | undefined;
    const passo = (acceso: boolean) => {
      setColore(acceso);
      timer = window.setTimeout(() => passo(!acceso), MEZZO_CICLO_MS);
    };
    timer = window.setTimeout(() => passo(false), MEZZO_CICLO_MS);
    return () => window.clearTimeout(timer);
  }, [motoRidotto]);

  /* rovesciata: cursore a destra = celle piccole = più caratteri */
  const valoreSlider = CELLA_MIN + CELLA_MAX - cellW;

  return (
    <>
      <Plasma
        variant="background"
        color={colore}
        cellW={cellW}
        className="absolute inset-0 -z-20 h-full w-full opacity-90 [touch-action:pan-y]"
      />

      {/* il velo non deve intercettare il puntatore: sotto c'è il campo.
          Due versioni, e non per vezzo: su un telefono il testo occupa quasi
          tutta la larghezza, quindi la macchia scura si sposta al centro e si fa
          più coprente sotto il blocco di testo; su schermo largo la macchia si
          allarga meno e resta al centro, dove ora sta il testo, lasciando
          respirare il campo ai due lati. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_58%_at_50%_50%,rgba(7,6,12,0.9)_0%,rgba(7,6,12,0.62)_48%,rgba(7,6,12,0)_84%),linear-gradient(to_bottom,rgba(7,6,12,0.3)_0%,rgba(7,6,12,0)_22%,rgba(7,6,12,0.34)_74%,rgba(7,6,12,0.8)_94%,var(--background)_100%)] sm:bg-[radial-gradient(72%_62%_at_50%_46%,rgba(7,6,12,0.88)_0%,rgba(7,6,12,0.5)_46%,rgba(7,6,12,0)_78%),linear-gradient(to_bottom,rgba(7,6,12,0.28)_0%,rgba(7,6,12,0)_26%,rgba(7,6,12,0.42)_84%,var(--background)_100%)]"
      />

      {/* `group` fa salire di tono l'insieme quando il puntatore entra in zona,
          non il singolo pezzo toccato. */}
      <div className="group absolute inset-x-6 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-10 flex flex-col items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] sm:inset-x-auto sm:bottom-7 sm:right-8 sm:items-end">
        <label className="flex items-center gap-2.5">
          <span className="text-faint transition-colors group-hover:text-dim">Density</span>
          <input
            type="range"
            min={CELLA_MIN}
            max={CELLA_MAX}
            step={1}
            value={valoreSlider}
            aria-label="Background character density"
            onChange={(e) => setCellW(CELLA_MIN + CELLA_MAX - Number(e.target.value))}
            className="plasma-range w-28 sm:w-32"
          />
        </label>

        {children}
      </div>
    </>
  );
}
