import type { ReactNode } from "react";

import { Reveal } from "./Reveal";

export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`mx-auto w-full max-w-4xl px-6 sm:px-8 ${className}`}>{children}</div>;
}

/**
 * Blocco verticale standard. Il filetto in cima separa le sezioni senza
 * bisogno di alternare fondi: su un tema scuro due tinte vicine si leggono
 * come una sbavatura, una riga sottile no.
 */
export function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`border-t border-hairline py-20 first:border-t-0 sm:py-28 ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
}

/** Intestazione di sezione: occhiello e frase d'apertura, già animate. */
export function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <Reveal className="mb-10 flex flex-col gap-3">
      <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ciano">
        {eyebrow}
      </h2>
      <p className="max-w-2xl text-balance text-2xl leading-snug tracking-tight sm:text-3xl">
        {title}
      </p>
    </Reveal>
  );
}
