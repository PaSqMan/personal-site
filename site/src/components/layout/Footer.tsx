import Link from "next/link";

import { Container } from "@/components/ui/Section";
import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-hairline py-9 font-mono text-xs text-faint">
      <Container className="flex flex-wrap justify-between gap-4">
        {/* L'anno si calcola alla build: il sito è statico, quindi niente
            JavaScript solo per scrivere una data. */}
        <span>© {new Date().getFullYear()} {site.persona.nome}</span>
        <span>
          Lo sfondo è{" "}
          <Link href="/plasma" prefetch={false} className="underline">
            fx_plasma.c
          </Link>
          , in WebGL.
        </span>
      </Container>
    </footer>
  );
}
