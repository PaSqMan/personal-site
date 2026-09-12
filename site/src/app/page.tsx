import { Contatti } from "@/components/home/Contatti";
import { Hero } from "@/components/home/Hero";
import { Mestieri } from "@/components/home/Mestieri";
import { Progetti } from "@/components/home/Progetti";

export default function Page() {
  return (
    <>
      <Hero />
      <main id="contenuto">
        <Mestieri />
        <Progetti />
        <Contatti />
      </main>
    </>
  );
}
