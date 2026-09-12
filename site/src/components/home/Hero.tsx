import { Plasma } from "@/components/plasma/Plasma";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { site } from "@/content/site";

/**
 * L'intestazione, che per ora è tutto il sito: nome, sommario, due vie per
 * mettersi in contatto, e il plasma dietro.
 *
 * Il velo sopra il canvas è due gradienti sovrapposti: uno radiale che apre una
 * zona scura dove cade il testo, uno verticale che chiude verso il fondo. Senza
 * il radiale il testo starebbe sopra un campo di caratteri chiari e si
 * leggerebbe male; con un velo uniforme abbastanza scuro da salvare il testo,
 * il plasma non si vedrebbe più. Il resto lo fa l'ombra sul testo.
 */
export function Hero() {
  const { persona } = site;

  return (
    <main className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden py-20">
      <Plasma
        variant="background"
        className="absolute inset-0 -z-20 h-full w-full opacity-70 [touch-action:pan-y] sm:opacity-[0.72]"
      />

      {/* Il velo non deve intercettare il puntatore: sotto c'è il campo.
          Due versioni, e non per vezzo: su un telefono il testo occupa quasi
          tutta la larghezza, quindi la macchia scura si sposta al centro e si
          fa piu` coprente sotto il blocco di testo; il plasma resta pieno sopra
          e sotto. Su schermo largo il testo sta a sinistra e basta aprire una
          zona d'ombra li`, lasciando libero il resto del campo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_62%_at_40%_52%,rgba(7,6,12,0.93)_0%,rgba(7,6,12,0.74)_45%,rgba(7,6,12,0)_82%),linear-gradient(to_bottom,rgba(7,6,12,0.45)_0%,rgba(7,6,12,0.1)_22%,rgba(7,6,12,0.5)_74%,rgba(7,6,12,0.92)_92%,var(--background)_100%)] sm:bg-[radial-gradient(105%_78%_at_16%_34%,rgba(7,6,12,0.92)_0%,rgba(7,6,12,0.42)_40%,rgba(7,6,12,0)_68%),linear-gradient(to_bottom,rgba(7,6,12,0.5)_0%,rgba(7,6,12,0)_30%,rgba(7,6,12,0.85)_88%,var(--background)_100%)]"
      />

      <Container>
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-viola">
          {persona.handle}
        </p>
        {/* Un'ombra invece di più velo: il testo torna nitido sopra i caratteri
            chiari del plasma senza che il campo debba spegnersi. */}
        <h1 className="text-[clamp(2.4rem,8.2vw,4.75rem)] font-[650] leading-[1.02] tracking-tight [text-shadow:0_2px_18px_rgba(7,6,12,0.85)]">
          Pasquale
          <br />
          Di Gennaro
        </h1>
        <p className="mt-5 max-w-[34em] text-[1.0625rem] text-dim [text-shadow:0_1px_14px_rgba(7,6,12,0.9)] sm:text-xl">
          Sviluppo <strong className="font-semibold text-ink">software</strong> e sistemi di{" "}
          <strong className="font-semibold text-ink">intelligenza artificiale</strong>: codice che
          sta vicino alla macchina, strumenti che fanno risparmiare tempo, e modelli di linguaggio
          messi al lavoro dove servono davvero.
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
