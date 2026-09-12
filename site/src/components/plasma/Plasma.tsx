"use client";

import { useEffect, useRef, useState } from "react";

import { startPlasma, type PlasmaHandle, type PlasmaStat } from "./engine";

/**
 * Il canvas del plasma, in due impieghi.
 *
 * - `variant="background"`: sfondo dell'intestazione. Il puntatore si ascolta
 *   sul contenitore, non sul canvas, così il campo lo segue anche quando passa
 *   sopra il testo; la rotella resta alla pagina; e il ciclo si spegne quando
 *   l'intestazione esce dallo schermo.
 * - `variant="full"`: la demo. Tastiera attiva e riquadro con i numeri.
 *
 * `ascii` e `cellW` sono proprietà comandate da fuori e **non** rifanno il
 * motore: passano per `setAscii`/`setCellW`, che aggiornano lo stato in corsa.
 * Ricrearlo a ogni scatto dello slider vorrebbe dire ricompilare lo shader e
 * azzerare il tempo del campo, con uno sfarfallio a ogni pixel di spostamento.
 *
 * Se WebGL non c'è, il canvas resta nascosto e si vede il fondo sotto: nessun
 * rettangolo nero, nessun messaggio d'errore in faccia a chi passa.
 */
export function Plasma({
  variant = "background",
  ascii,
  color,
  cellW,
  scale,
  className = "",
  onStat,
}: {
  variant?: "background" | "full";
  ascii?: boolean;
  color?: boolean;
  cellW?: number;
  scale?: number;
  className?: string;
  onStat?: (s: PlasmaStat) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<PlasmaHandle | null>(null);
  const [assente, setAssente] = useState(false);

  /* Lo stat esce dal ciclo di disegno, che gira a ogni quadro: passarlo in
     stato React vorrebbe dire un render 60 volte al secondo. Resta un callback
     verso il chiamante, che decide lui se e come mostrarlo. */
  const statRef = useRef(onStat);
  useEffect(() => {
    statRef.current = onStat;
  }, [onStat]);

  /* I valori iniziali entrano nel motore alla creazione; dopo, li muovono gli
     effetti qui sotto. Un ref evita di rimetterli fra le dipendenze. */
  const primo = useRef({ ascii, color, cellW, scale });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const host = variant === "background" ? canvas.parentElement : canvas;
    const iniziale = primo.current;

    let handle: PlasmaHandle | null = null;
    try {
      handle = startPlasma({
        canvas,
        cellW: iniziale.cellW ?? (variant === "background" ? 11 : 9),
        scale: iniziale.scale ?? (variant === "background" ? 2.9 : 2.6),
        ascii: iniziale.ascii ?? true,
        color: iniziale.color ?? true,
        keys: variant === "full",
        wheel: variant === "full",
        /* l'inclinazione del telefono serve allo sfondo, che non ha altri modi
           di essere toccato su un telefono: nella demo a schermo pieno ci sono
           già dita, tastiera e rotella */
        gyro: variant === "background",
        pointerTarget: variant === "background" ? host : null,
        onStat: (s) => statRef.current?.(s),
      });
    } catch {
      handle = null;
    }

    if (!handle) {
      setAssente(true);
      return;
    }
    handleRef.current = handle;

    /* Gancio di diagnostica, solo con ?debug nell'indirizzo: da lì si legge e
       si muove lo stato del campo dalla console del browser
       (plasma.state.scale = 6, plasma.setCellW(7), …). Dietro una query così
       non finisce nella pagina di tutti i giorni, e serve a provare da fuori
       cose che altrimenti si potrebbero solo guardare a occhio, come
       l'inclinazione del telefono. */
    if (new URLSearchParams(window.location.search).has("debug")) {
      (window as unknown as { plasma?: PlasmaHandle }).plasma = handle;
    }

    /* l'intestazione fuori dallo schermo non va animata */
    let io: IntersectionObserver | null = null;
    if (variant === "background" && host && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) handle?.resume();
            else handle?.stop();
          }
        },
        { threshold: 0.01 },
      );
      io.observe(host);
    }

    return () => {
      io?.disconnect();
      handle?.destroy();
      handleRef.current = null;
    };
  }, [variant]);

  useEffect(() => {
    if (cellW !== undefined) handleRef.current?.setCellW(cellW);
  }, [cellW]);

  useEffect(() => {
    if (ascii !== undefined) handleRef.current?.setAscii(ascii);
  }, [ascii]);

  useEffect(() => {
    if (color !== undefined) handleRef.current?.setColor(color);
  }, [color]);

  return <canvas ref={canvasRef} aria-hidden="true" hidden={assente} className={className} />;
}
