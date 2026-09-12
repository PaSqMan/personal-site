import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <main id="contenuto" className="flex min-h-svh items-center">
      <Container>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-viola">404</p>
        <h1 className="mt-4 text-3xl tracking-tight sm:text-4xl">This page doesn&rsquo;t exist.</h1>
        <p className="mt-3 max-w-[40em] text-dim">
          The address may have changed. Everything else starts from the home page.
        </p>
        <div className="mt-7">
          <Button href="/" tone="primary">
            Back to the start
          </Button>
        </div>
      </Container>
    </main>
  );
}
