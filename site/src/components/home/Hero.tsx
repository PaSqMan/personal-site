import { PlasmaStage } from "@/components/plasma/PlasmaStage";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { site } from "@/content/site";

import { Musica } from "./Musica";
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
      {/* il player entra nella barra dei comandi dello sfondo: i comandi della
          pagina stanno tutti nella stessa riga, in basso a destra */}
      <PlasmaStage>
        <Musica />
      </PlasmaStage>

      {/* Tutto centrato, e non per indecisione: questa pagina è una schermata
          sola, cioè un manifesto, e un manifesto si legge simmetrico. Il testo
          allineato a sinistra ha senso quando sotto continua qualcosa e l'occhio
          deve tornare a capo su una colonna; qui lasciava il peso tutto da una
          parte con lo sfondo pieno dall'altra. */}
      <Container className="text-center">
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

        {/* Monospace, come tutto il resto della pagina: il sans era l'unico
            carattere estraneo qui dentro, fra un nome da terminale e comandi da
            terminale. In compenso il monospace è più larga a pari corpo, quindi
            la misura scende a 20em e il corpo di un gradino.
            Le due parole che contano stanno in bianco pieno e in semibold, il
            resto in grigio: l'occhio le prende prima di leggere. */}
        <p className="mx-auto mt-7 max-w-[20em] text-balance font-mono text-lg leading-[1.5] tracking-tight text-dim [text-shadow:0_1px_16px_rgba(7,6,12,0.92)] sm:text-2xl sm:leading-[1.45]">
          Building <strong className="font-semibold text-ink">Software</strong> and{" "}
          <strong className="font-semibold text-ink">Artificial Intelligence</strong> Systems.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-2.5">
          <Button href={`mailto:${persona.email}`} tone="primary">
            Email me
          </Button>
          <Button href={persona.github}>GitHub</Button>
        </div>
      </Container>
    </main>
  );
}
