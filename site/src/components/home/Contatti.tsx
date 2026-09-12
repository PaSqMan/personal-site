import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { site } from "@/content/site";

export function Contatti() {
  const { persona } = site;

  return (
    <Section id="contatti">
      <SectionHeading eyebrow="Contatti" title="Per lavoro, collaborazioni o due parole sul codice." />

      <Reveal className="flex flex-wrap gap-3">
        {/* L'indirizzo per intero è largo 317 px in monospace: su uno schermo da
            320 px sforava la pastiglia. Qui può andare a capo dentro il
            pulsante invece di spingere la pagina. */}
        <Button
          href={`mailto:${persona.email}`}
          tone="primary"
          className="max-w-full text-center [overflow-wrap:anywhere]"
        >
          {persona.email}
        </Button>
        <Button href={persona.github}>github.com/{persona.handle}</Button>
      </Reveal>
    </Section>
  );
}
