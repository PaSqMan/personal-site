"use client";

import { useEffect, useState } from "react";

import { useMotoRidotto } from "@/lib/motoRidotto";

/**
 * Scrive le righe una dopo l'altra, come una tastiera, e lascia in fondo il
 * cursore a blocco — quello della modalità sovrascrittura, che sui DOS si
 * commutava con `Ins`.
 *
 * Tre scelte che contano più dell'effetto:
 *
 * 1. **Il testo c'è comunque.** Le lettere che compaiono sono decorative
 *    (`aria-hidden`); accanto sta lo stesso testo per chi usa un lettore di
 *    schermo, e nell'HTML statico — quindi anche per chi indicizza la pagina —
 *    il nome è presente dal primo byte, non dipende dal JavaScript.
 * 2. **Niente salti di impaginazione.** Una riga che si allunga sposterebbe
 *    quello che le sta sotto a ogni lettera: ogni riga tiene lo spazio del suo
 *    testo completo, reso invisibile, e le lettere lo riempiono dentro.
 * 3. **Il ritmo non è uniforme.** Una macchina che scrive a intervalli esatti
 *    suona finta: qui ogni lettera ha una pausa di base con una variazione
 *    casuale, più lunga dopo uno spazio.
 */

export type RigaTesto = {
  testo: string;
  className?: string;
};

export function Typed({
  righe,
  etichetta,
  velocita = 68,
}: {
  righe: RigaTesto[];
  /** Il testo completo, per lettori di schermo e motori di ricerca. */
  etichetta: string;
  /** Millisecondi per lettera, prima della variazione casuale. */
  velocita?: number;
}) {
  /* Quante lettere sono state scritte in totale, sull'insieme delle righe. */
  const totale = righe.reduce((n, r) => n + r.testo.length, 0);
  const calmo = useMotoRidotto();
  const [battute, setBattute] = useState(0);
  const [concluso, setConcluso] = useState(false);

  /* Chi ha chiesto meno movimento riceve il testo già scritto: non è lo stato a
     cambiare, è il render che salta l'animazione. */
  const scritte = calmo ? totale : battute;
  const finito = calmo || concluso;

  useEffect(() => {
    if (calmo) return;

    let n = 0;
    let timer: number | undefined;

    const tutte = righe.map((r) => r.testo).join("");

    const passo = () => {
      n += 1;
      setBattute(n);
      if (n >= totale) {
        setConcluso(true);
        return;
      }
      /* la pausa dopo uno spazio è più lunga: è dove le dita rallentano */
      const appenaScritto = tutte[n - 1];
      const base = appenaScritto === " " ? velocita * 2.1 : velocita;
      timer = window.setTimeout(passo, base + Math.random() * velocita * 0.6);
    };

    timer = window.setTimeout(passo, 420); /* un attimo prima di partire */
    return () => window.clearTimeout(timer);
  }, [righe, totale, velocita, calmo]);

  /* Dove comincia ogni riga nel conteggio complessivo. Calcolato senza
     accumulatori mutati durante il render: le righe sono due, e la chiarezza
     vale più di un ciclo risparmiato. */
  const inizi = righe.map((_, i) =>
    righe.slice(0, i).reduce((n, r) => n + r.testo.length, 0),
  );

  return (
    <>
      <span className="sr-only">{etichetta}</span>

      <span aria-hidden="true">
        {righe.map((riga, i) => {
          const inizio = inizi[i];
          const fine = inizio + riga.testo.length;
          const quante = Math.max(0, Math.min(riga.testo.length, scritte - inizio));
          const visibile = riga.testo.slice(0, quante);
          const ultima = i === righe.length - 1;
          /* il cursore sta dove batte la tastiera: sulla riga in corso, e a
             fine scrittura resta appeso all'ultima */
          const cursoreQui = ultima ? scritte >= inizio : scritte > inizio && scritte < fine;

          return (
            <span key={riga.testo} className={`block ${riga.className ?? ""}`}>
              {/* la riga completa, invisibile, tiene lo spazio; le lettere
                  scritte le stanno sopra */}
              <span className="relative">
                <span className="invisible">{riga.testo}</span>
                <span className="absolute inset-0 whitespace-pre">
                  {visibile}
                  {cursoreQui && <Cursore lampeggia={finito} />}
                </span>
              </span>
            </span>
          );
        })}
      </span>
    </>
  );
}

/**
 * Il cursore a blocco. Mentre si scrive resta pieno — un cursore che lampeggia
 * durante la battitura è il difetto tipico di questi effetti, perché nasconde
 * la lettera che sta arrivando — e comincia a lampeggiare quando la scrittura
 * è finita, che è il momento in cui serve dire "sono in attesa".
 */
function Cursore({ lampeggia }: { lampeggia: boolean }) {
  return (
    <span
      className={`ml-[0.06em] inline-block w-[0.58em] translate-y-[0.06em] self-baseline bg-current align-baseline ${
        lampeggia ? "animate-cursore" : ""
      }`}
      style={{ height: "0.78em" }}
    />
  );
}
