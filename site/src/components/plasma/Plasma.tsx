"use client";

import { useEffect, useRef, useState } from "react";

import { startPlasma, type PlasmaHandle, type PlasmaStat } from "./engine";

/**
 * Il canvas del plasma, in due impieghi.
 *
 * - `variant="background"`: sfondo dell'intestazione. Il puntatore si ascolta
 *   sul contenitore, non sul canvas, così il campo lo segue anche quando passa
 *   sopra il testo; la rotella resta alla pagina, che deve poter scorrere; e il
 *   ciclo si spegne quando l'intestazione esce dallo schermo, per non tenere
 *   occupata la GPU mentre si legge il resto.
 * - `variant="full"`: la demo. Tastiera attiva e riquadro con i numeri.
 *
 * Se WebGL non c'è, il canvas resta nascosto e si vede il fondo sotto: nessun
 * rettangolo nero, nessun messaggio d'errore in faccia a chi passa.
 */
export function Plasma({
  variant = "background",
  cellW,
  scale,
  className = "",
  onStat,
}: {
  variant?: "background" | "full";
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const host = variant === "background" ? canvas.parentElement : canvas;

    let handle: PlasmaHandle | null = null;
    try {
      handle = startPlasma({
        canvas,
        cellW: cellW ?? (variant === "background" ? 11 : 9),
        scale: scale ?? (variant === "background" ? 2.9 : 2.6),
        keys: variant === "full",
        wheel: variant === "full",
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
  }, [variant, cellW, scale]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      hidden={assente}
      className={className}
    />
  );
}
