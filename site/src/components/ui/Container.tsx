import type { ReactNode } from "react";

/** La colonna di testo: una sola misura per tutto il sito, e i margini
 *  laterali che non scendono mai sotto i 24 px. */
export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`mx-auto w-full max-w-4xl px-6 sm:px-8 ${className}`}>{children}</div>;
}
