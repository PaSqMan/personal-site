import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Pulsante a pastiglia, in due toni. `primary` è pieno (nero su viola, 9.80:1);
 * `ghost` ha solo il bordo e un fondo appena velato, per stare anche sopra il
 * plasma senza aprirci un buco.
 *
 * I collegamenti interni passano da `next/link`, che applica il `basePath` da
 * solo; quelli esterni e i `mailto:` restano ancore normali.
 */
export function Button({
  href,
  tone = "ghost",
  external = false,
  className = "",
  children,
}: {
  href: string;
  tone?: "primary" | "ghost";
  external?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const base =
    "inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-3 font-mono text-sm no-underline sm:min-h-0 sm:py-2.5 transition hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viola";
  const look =
    tone === "primary"
      ? "bg-viola font-semibold text-on-accent hover:bg-ink"
      : "border border-hairline bg-surface/60 text-ink backdrop-blur hover:border-viola";
  const cls = `${base} ${look} ${className}`;

  if (external || href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a
        href={href}
        className={cls}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener me" } : {})}
      >
        {children}
      </a>
    );
  }
  /* prefetch spento di proposito. Con "output: export" Next 16 chiede il
     payload del segmento a un percorso piatto (…/__next.plasma.__PAGE__.txt)
     mentre la build lo scrive annidato (…/__next.plasma/__PAGE__.txt): il
     prefetch risponde 404 e sporca la console. La navigazione non ne soffre —
     il sito ha due pagine statiche, entrambe già in cache dopo la prima
     visita — e in cambio non parte una richiesta destinata a fallire. */
  return (
    <Link href={href} prefetch={false} className={cls}>
      {children}
    </Link>
  );
}
