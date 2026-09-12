/* =============================================================================
 *  I contenuti del sito, in un posto solo.
 *
 *  Il progetto di riferimento tiene i testi in `content/*.json` validati con
 *  zod, perché lì i dati arrivano da fuori e vanno controllati prima di
 *  pubblicare. Qui i testi sono pochi, li scrive chi scrive anche il codice, e
 *  TypeScript basta da solo a impedire un campo dimenticato: un modulo tipizzato
 *  costa meno e si legge meglio di uno schema.
 * ========================================================================== */

export type Progetto = {
  nome: string;
  tipo: string;
  href: string;
  /** true quando il collegamento esce dal sito */
  esterno?: boolean;
  paragrafi: string[];
  /** numeri misurati, non stimati: restano vuoti se non ce ne sono */
  numeri?: { valore: string; nota: string }[];
  tag: string[];
};

export const site = {
  persona: {
    nome: "Pasquale Di Gennaro",
    handle: "PaSqMan",
    ruolo: "Sviluppo software e sistemi di intelligenza artificiale",
    /* Il sommario dell'intestazione. Due righe, niente superlativi. */
    sommario:
      "Codice che sta vicino alla macchina, strumenti che fanno risparmiare tempo, e modelli di linguaggio messi al lavoro dove servono davvero.",
    email: "pasquale.di.gennaro.dev@gmail.com",
    github: "https://github.com/PaSqMan",
  },

  seo: {
    /* Serve a metadataBase e alla sitemap. Se il sito passa a dominio proprio,
       o a un repository <utente>.github.io, qui va l'indirizzo nuovo. */
    url: "https://pasqman.github.io/animation",
    titolo: "Pasquale Di Gennaro — software e IA",
    descrizione:
      "Sviluppo software e sistemi di intelligenza artificiale. Codice di sistema, strumenti, grafica in tempo reale.",
  },

  mestieri: [
    {
      titolo: "Software",
      testo:
        "Codice di sistema e strumenti, in C e sul web. Mi interessa la parte che si misura: dove va il tempo, perché un ciclo non tiene il ritmo, quanto costa davvero un fotogramma.",
      voci: [
        "C, API di Windows, parallelismo con OpenMP",
        "Grafica in tempo reale: ray marching, SDF, WebGL e GLSL",
        "Strumenti a riga di comando e automazioni",
      ],
    },
    {
      titolo: "Intelligenza artificiale",
      testo:
        "Costruisco cose attorno ai modelli di linguaggio: agenti che lavorano sul codice, automazioni che leggono e scrivono, integrazioni con quello che c'è già.",
      voci: [
        "Agenti e strumenti sopra le API dei modelli",
        "Automazione di flussi di lavoro e di sviluppo",
        "Valutazione dei risultati, non solo demo che funzionano una volta",
      ],
    },
  ],

  progetti: [
    {
      nome: "animation — effetti per il terminale",
      tipo: "C · open source",
      href: "https://github.com/PaSqMan/animation",
      esterno: true,
      paragrafi: [
        "Dieci effetti della demoscene che girano dentro una finestra di terminale: ray marching di superfici implicite, Mandelbulb, Menger, un ray tracer alla Whitted, plasma, fuoco, Life. L'uscita è ANSI a 24 bit, su rampa di caratteri o mezzi blocchi.",
        "La parte interessante non è il disegno: è il ritmo. Ogni quadro ha una scadenza fissata in anticipo e il tempo della simulazione avanza a passi uguali, così il moto resta lineare. Quando la macchina non ce la fa, cala la qualità e poi dimezza il ritmo — invece di far ballare gli fps.",
      ],
      numeri: [
        { valore: "30.00", nota: "fps sul bersaglio" },
        { valore: "0.12 ms", nota: "di scarto fra i quadri" },
        { valore: "0", nota: "quadri persi" },
      ],
      tag: ["C99", "OpenMP", "Win32", "SDF / ray marching", "ANSI 24 bit"],
    },
    {
      nome: "Plasma — lo stesso effetto, su GPU",
      tipo: "WebGL · demo",
      href: "/plasma",
      paragrafi: [
        "Il plasma della raccolta portato in un fragment shader: stesso campo di seni, stessa palette a coseni, e la stessa rampa di 69 caratteri del terminale — che qui diventa un atlante di glifi, con ogni cella che sceglie il suo carattere dalla luminanza del campo. Il puntatore sposta il centro, lascia un'onda e, se corre, accelera il tempo.",
      ],
      tag: ["WebGL", "GLSL", "nessuna dipendenza", "un solo shader"],
    },
  ] satisfies Progetto[],
};
