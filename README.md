# animation

Effetti della demoscene scritti in C per il terminale di Windows, piu' un
portale web per il plasma.

## Il sito

[`docs/index.html`](docs/index.html) e' il plasma di
[`fx_plasma.c`](fx_plasma.c) portato su GPU: stesso campo di seni, stessa
palette a coseni, stessa rampa di 69 caratteri dell'uscita a terminale, solo
che i glifi diventano un atlante passato al fragment shader e la griglia di
celle e' fatta di pixel.

Il puntatore sposta il centro del termine radiale, lascia un anello che decade
con la distanza e - se corre - accelera il tempo del campo.

Comandi: `B` caratteri/pixel, `C` colore, `+` `-` corpo dei caratteri, rotella
per la scala, `spazio` ferma, `R` azzera, `H` nasconde l'interfaccia.

Nessuna dipendenza e nessuna compilazione: un file HTML, si apre anche da
`file://`.

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
