# animation

Effetti della demoscene scritti in C per il terminale di Windows, piu' un
portale web per il plasma.

## Il sito

[`docs/`](docs/) e la landing page pubblicata con GitHub Pages:

- [`index.html`](docs/index.html) - presentazione, con il plasma come sfondo
  dell'intestazione. Il ciclo si ferma quando l'intestazione esce dallo
  schermo e riparte quando torna, e rispetta `prefers-reduced-motion`.
- [`plasma.html`](docs/plasma.html) - la demo a schermo pieno.
- [`plasma.js`](docs/plasma.js) - il motore condiviso: il plasma di
  [`fx_plasma.c`](fx_plasma.c) in un fragment shader, con la stessa rampa di
  69 caratteri dell'uscita a terminale trasformata in un atlante di glifi.
  Ogni cella sceglie il suo carattere dalla luminanza del campo al proprio
  centro, e il colore usa la formula di `emit()`.

Il puntatore sposta il centro del termine radiale, lascia un anello che decade
con la distanza e - se corre - accelera il tempo del campo.

Comandi della demo: `B` caratteri/pixel, `C` colore, `+` `-` corpo dei
caratteri, rotella per la scala, `spazio` ferma, `R` azzera, `H` nasconde
l'interfaccia.

Nessuna dipendenza e nessuna compilazione: si apre anche da `file://`.

## I programmi per il terminale

    build.bat            compila tutto
    build.bat fxlibero   solo fxlibero.exe

Serve un gcc: `winget install --id BrechtSanders.WinLibs.POSIX.UCRT`.

- `fxlibero.exe` - dieci effetti, si parte dritti nelle animazioni.
  Il ritmo e' a cadenza fissa: ogni quadro ha una scadenza e il tempo della
  simulazione avanza a passi uguali, cosi' il moto resta lineare. Se la
  macchina non ce la fa cala il supersampling e poi dimezza il ritmo, invece
  di far ballare gli fps. `--fps N`, `--no-auto`, `--diag N` per misurare la
  regolarita' ottenuta.
- `fx.exe` - la stessa raccolta con menu e reattivita' all'audio.
- `donut.exe`, `donut_wall.exe`, `walker.exe` - pezzi a se stanti.
