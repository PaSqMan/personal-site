import type { Metadata } from "next";

import { PlasmaDemo } from "./PlasmaDemo";

export const metadata: Metadata = {
  title: "Plasma",
  description:
    "Il plasma della demoscene DOS, reso a caratteri come nel terminale e reattivo al puntatore.",
};

export default function Page() {
  return <PlasmaDemo />;
}
