# personal-site

Il sito personale di [PaSqMan](https://github.com/PaSqMan) —
**https://pasqman.github.io/personal-site/**

Progetto Next.js 16 (App Router, TypeScript, Tailwind 4) esportato statico e
pubblicato da GitHub Pages a ogni push su `main`, tramite il workflow in
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

    cd site
    npm install
    npm run dev      # sviluppo su http://localhost:3000
    npm run build    # sito statico in site/out/
    npm run lint

## Lo sfondo

È un plasma della demoscene DOS riscritto per la GPU: una somma di cinque seni
letta attraverso una palette a coseni, in un fragment shader. L'uscita non
imita un terminale, lo rifà — la rampa di 69 caratteri ordinati per densità
diventa un atlante di glifi, e ogni cella sceglie il suo carattere dalla
luminanza del campo al proprio centro.

Alterna caratteri a colori e in bianco e nero, dieci secondi ciascuno, e in
pagina si comanda solo la densità. Il puntatore sposta il centro del campo con
la mano leggera; su un telefono lo sposta l'inclinazione. Tutto si ferma con
`prefers-reduced-motion`, e il ciclo di disegno si spegne quando
l'intestazione esce dallo schermo.

Il motore sta in
[`site/src/components/plasma/engine.ts`](site/src/components/plasma/engine.ts)
e non conosce React, così la stessa logica serve lo sfondo e la demo a schermo
pieno su [`/plasma`](https://pasqman.github.io/personal-site/plasma/).

## Indirizzo di pubblicazione

Il workflow prefissa i percorsi col nome del repository, quindi il sito vive
sotto `https://<utente>.github.io/<repo>/`. Passando a dominio proprio, o a un
repository `<utente>.github.io`, va svuotato `NEXT_PUBLIC_BASE_PATH` nel
workflow e aggiornato `seo.url` in
[`site/src/content/site.ts`](site/src/content/site.ts).

## Rami

- `main` — quello pubblicato.
- `spotify-embed` — la riproduzione di un brano tramite l'embed di Spotify,
  tenuta da parte in attesa di decidere se integrarla. Non pubblica nulla: il
  workflow scatta solo su `main`.
