import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { site } from "@/content/site";

/** "Cosa faccio": due riquadri affiancati, che su telefono si impilano. */
export function Mestieri() {
  return (
    <Section id="cosa">
      <SectionHeading
        eyebrow="Cosa faccio"
        title="Due mestieri che si tengono: capire come gira una macchina, e far fare alle macchine il lavoro noioso."
      />

      <div className="grid gap-6 sm:grid-cols-2">
        {site.mestieri.map((m, i) => (
          <Reveal
            key={m.titolo}
            delay={i * 90}
            className="rounded-2xl border border-hairline bg-gradient-to-b from-ink/[0.035] to-transparent p-6"
          >
            <h3 className="mb-2.5 text-lg tracking-tight">{m.titolo}</h3>
            <p className="text-[0.95rem] text-dim">{m.testo}</p>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-[0.95rem] text-dim">
              {m.voci.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
