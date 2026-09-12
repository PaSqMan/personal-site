import Link from "next/link";
import type { ReactNode } from "react";

import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { site, type Progetto } from "@/content/site";

/** Tutta la scheda è cliccabile, quindi il contenitore è il collegamento: uno
 *  solo, invece di un titolo e un "vedi" separati che il lettore di schermo
 *  annuncerebbe come due voci per la stessa cosa. */
function Scheda({ p, children }: { p: Progetto; children: ReactNode }) {
  const cls =
    "block rounded-2xl border border-hairline bg-gradient-to-b from-ink/[0.035] to-transparent p-6 no-underline transition hover:border-viola/50 hover:bg-viola/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viola sm:p-7";

  return p.esterno ? (
    <a href={p.href} target="_blank" rel="noopener" className={cls}>
      {children}
    </a>
  ) : (
    <Link href={p.href} prefetch={false} className={cls}>
      {children}
    </Link>
  );
}

export function Progetti() {
  return (
    <Section id="progetti">
      <SectionHeading eyebrow="Progetti" title="Codice pubblico, con i numeri che gli appartengono." />

      <div className="space-y-5">
        {site.progetti.map((p, i) => (
          <Reveal key={p.nome} delay={i * 90}>
            <Scheda p={p}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="text-xl tracking-tight">{p.nome}</h3>
                <span className="font-mono text-xs uppercase tracking-[0.1em] text-faint">
                  {p.tipo}
                </span>
              </div>

              {p.paragrafi.map((testo) => (
                <p key={testo.slice(0, 40)} className="mt-3 max-w-[60ch] text-dim">
                  {testo}
                </p>
              ))}

              {p.numeri && (
                <div className="mt-5 flex flex-wrap gap-6 border-t border-hairline pt-4">
                  {p.numeri.map((n) => (
                    <div key={n.nota} className="font-mono text-xs text-faint">
                      <b className="block text-lg font-semibold tracking-tight text-ink">
                        {n.valore}
                      </b>
                      {n.nota}
                    </div>
                  ))}
                </div>
              )}

              <ul className="mt-5 flex list-none flex-wrap gap-2 p-0">
                {p.tag.map((t) => (
                  <li
                    key={t}
                    className="rounded-md border border-hairline px-2 py-0.5 font-mono text-xs text-dim"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </Scheda>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
