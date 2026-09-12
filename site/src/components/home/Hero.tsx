import { PlasmaStage } from "@/components/plasma/PlasmaStage";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { site } from "@/content/site";

import { Typed } from "./Typed";

/**
 * L'intestazione, che per ora è tutto il sito.
 *
 * Il nome e l'utenza GitHub arrivano scritti a macchina, in VT323, con il
 * cursore a blocco che resta a lampeggiare alla fine: il plasma dietro viene da
 * un effetto per terminale DOS, quindi il nome si presenta come si sarebbe
 * presentato là. Il resto della pagina no — un sito interamente in carattere da
 * terminale si legge male, e la citazione funziona se resta una citazione.
 *
 * Il testo statico lo rende il server; solo la battitura e i comandi del plasma
 * sono componenti client.
 */
export function Hero() {
  const { persona } = site;

  return (
    <main className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden py-20">
      <PlasmaStage />

      <Container>
        {/* Il carattere retro è alto e stretto: con l'interlinea di serie le due
            righe si toccherebbero e il cursore a blocco sfonderebbe sotto, da
            qui il `leading` esplicito. */}
        <h1 className="font-retro text-[clamp(3rem,11vw,6.5rem)] leading-[0.92] tracking-tight text-ink [text-shadow:0_2px_22px_rgba(7,6,12,0.9)]">
          <Typed
            etichetta={`${persona.nome} — ${persona.handle}`}
            righe={[
              { testo: persona.nome },
              {
                testo: persona.handle,
                className: "text-[0.52em] tracking-[0.02em] text-viola",
              },
            ]}
          />
        </h1>

        {/* La frase è in inglese dentro una pagina in italiano: senza `lang` un
            lettore di schermo la pronuncerebbe con le regole sbagliate. */}
        <p lang="en" className="mt-7 max-w-[32em] text-[1.0625rem] text-dim [text-shadow:0_1px_14px_rgba(7,6,12,0.9)] sm:text-xl">
          Building Software and Artificial Intelligence Systems.
        </p>

        <div className="mt-8 flex flex-wrap gap-2.5">
          <Button href={`mailto:${persona.email}`} tone="primary">
            Scrivimi
          </Button>
          <Button href={persona.github}>GitHub</Button>
        </div>
      </Container>
    </main>
  );
}
