import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";

export default function NotFound() {
  return (
    <main id="contenuto" className="flex min-h-svh items-center">
      <Container>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-viola">404</p>
        <h1 className="mt-4 text-3xl tracking-tight sm:text-4xl">Questa pagina non c&rsquo;è.</h1>
        <p className="mt-3 max-w-[40em] text-dim">
          Forse l&rsquo;indirizzo è cambiato. Dalla pagina iniziale si arriva a tutto il resto.
        </p>
        <div className="mt-7">
          <Button href="/" tone="primary">
            Torna all&rsquo;inizio
          </Button>
        </div>
      </Container>
    </main>
  );
}
