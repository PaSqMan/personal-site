# animation

Effetti della demoscene scritti in C per il terminale di Windows, più il sito
personale che ne riusa uno.

## Il sito — site/

Progetto Next.js 16 (App Router, TypeScript, Tailwind 4) esportato statico e
pubblicato su GitHub Pages dal workflow in `.github/workflows/deploy.yml`.

    cd site
    npm install
    npm run dev      # sviluppo su http://localhost:3000
    npm run build     # sito statico in site/out/
    npm run lint

Due pagine: la presentazione e la demo del plasma a schermo pieno
(`/plasma`). Lo sfondo dell’intestazione è il plasma di
[`fx_plasma.c`](fx_plasma.c) portato in un fragment shader, con la stessa
rampa di 69 caratteri dell’uscita a terminale trasformata in un atlante di
glifi: ogni cella sceglie il suo carattere dalla luminanza del campo al proprio
centro, e il colore usa la formula di `emit()`.

Il motore sta in [`site/src/components/plasma/engine.ts`](site/src/components/plasma/engine.ts)
e non conosce React, così serve sia lo sfondo sia la demo. Nello sfondo il
ciclo si ferma quando l’intestazione esce dallo schermo, la rotella resta alla
pagina e il puntatore muove il campo anche sopra il testo. Rispetta
`prefers-reduced-motion`.

Comandi della demo: `B` caratteri/pixel, `C` colore, `+` `-` corpo dei
caratteri, rotella per la scala, `spazio` ferma, `R` azzera, `H` nasconde
l’interfaccia.

### Indirizzo di pubblicazione

Il workflow prefissa i percorsi col nome del repository, quindi il sito vive
sotto `https://<utente>.github.io/<repo>/`. Passando a dominio proprio, o a un
repository `<utente>.github.io`, va svuotato `NEXT_PUBLIC_BASE_PATH` nel
workflow e aggiornato `seo.url` in
[`site/src/content/site.ts`](site/src/content/site.ts).

## I programmi per il terminale

    build.bat            compila tutto
    build.bat fxlibero   solo fxlibero.exe

Serve un gcc: `winget install --id BrechtSanders.WinLibs.POSIX.UCRT`.

- `fxlibero.exe` — dieci effetti, si parte dritti nelle animazioni.
  Il ritmo è a cadenza fissa: ogni quadro ha una scadenza e il tempo della
  simulazione avanza a passi uguali, così il moto resta lineare. Se la macchina
  non ce la fa cala il supersampling e poi dimezza il ritmo, invece di far
  ballare gli fps. `--fps N`, `--no-auto`, `--diag N` per misurare la
  regolarità ottenuta.
- `fx.exe` — la stessa raccolta con menu e reattività all’audio.
- `donut.exe`, `donut_wall.exe`, `walker.exe` — pezzi a sé stanti.
