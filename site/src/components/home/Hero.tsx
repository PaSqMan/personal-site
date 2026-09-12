import Link from "next/link";

import { Plasma } from "@/components/plasma/Plasma";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { site } from "@/content/site";

/**
 * L'intestazione: nome, sommario, tre vie d'uscita, e il plasma dietro.
 *
 * Il velo sopra il canvas è due gradienti sovrapposti: uno radiale che apre una
 * zona scura dove cade il testo, uno verticale che chiude verso il fondo della
 * pagina così il passaggio alla prima sezione non è uno stacco netto. Senza il
 * radiale il testo starebbe sopra un campo di caratteri chiari e si leggerebbe
 * male; con un velo uniforme abbastanza scuro da salvare il testo, il plasma
 * non si vedrebbe più.
 */
export function Hero() {
  const { persona } = site;

  return (
    <header className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden">
      <Plasma
        variant="background"
        className="absolute inset-0 -z-20 h-full w-full opacity-70 [touch-action:pan-y] sm:opacity-[0.72]"
      />

      {/* il velo non deve intercettare il puntatore: sotto c'è il campo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(105%_78%_at_16%_34%,rgba(7,6,12,0.94)_0%,rgba(7,6,12,0.5)_40%,rgba(7,6,12,0)_70%),linear-gradient(to_bottom,rgba(7,6,12,0.6)_0%,rgba(7,6,12,0.1)_32%,rgba(7,6,12,0.88)_88%,var(--background)_100%)] sm:bg-[radial-gradient(105%_78%_at_16%_34%,rgba(7,6,12,0.92)_0%,rgba(7,6,12,0.42)_40%,rgba(7,6,12,0)_68%),linear-gradient(to_bottom,rgba(7,6,12,0.5)_0%,rgba(7,6,12,0)_30%,rgba(7,6,12,0.85)_88%,var(--background)_100%)]"
      />

      <Container>
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-viola">
          {persona.handle}
        </p>
        {/* Un'ombra invece di piu` velo: il testo torna nitido sopra i caratteri
            chiari del plasma senza che il campo debba spegnersi. */}
        <h1 className="text-[clamp(2.4rem,8.2vw,4.75rem)] font-[650] leading-[1.02] tracking-tight [text-shadow:0_2px_18px_rgba(7,6,12,0.85)]">
          Pasquale
          <br />
          Di Gennaro
        </h1>
        <p className="mt-5 max-w-[34em] text-lg text-dim [text-shadow:0_1px_14px_rgba(7,6,12,0.9)] sm:text-xl">
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
          <Button href="#progetti">Progetti</Button>
        </div>
      </Container>

      <p className="pointer-events-none absolute inset-x-6 bottom-6 flex justify-between gap-4 font-mono text-xs text-faint sm:inset-x-8">
        <span className="hidden sm:inline">
          Lo sfondo è un{" "}
          <Link href="/plasma" prefetch={false} className="pointer-events-auto underline">
            plasma della demoscene DOS
          </Link>{" "}
          riscritto per la GPU — muovi il puntatore.
        </span>
        <span className="whitespace-nowrap">↓ continua</span>
      </p>
    </header>
  );
}
