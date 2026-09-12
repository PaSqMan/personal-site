"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Fa comparire il contenuto quando entra nel viewport.
 *
 * La transizione vive in globals.css (`[data-reveal]`): qui ci limitiamo ad
 * accendere `data-visible`. Un solo IntersectionObserver condiviso da tutte le
 * istanze, invece di uno per componente. L'osservazione si interrompe al primo
 * ingresso: l'animazione non si ripete tornando indietro.
 */
let observer: IntersectionObserver | null = null;

function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-visible", "true");
        observer?.unobserve(entry.target);
      }
    },
    // Anticipa di poco l'ingresso: l'elemento è già animato quando lo si legge.
    { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
  );
  return observer;
}

export function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  id,
  children,
}: {
  as?: ElementType;
  /** Ritardo in ms: serve a scaglionare gli elementi di una griglia. */
  delay?: number;
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = getObserver();
    io.observe(node);
    return () => io.unobserve(node);
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      data-reveal
      className={className}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
