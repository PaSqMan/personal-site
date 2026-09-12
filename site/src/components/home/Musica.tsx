"use client";

import { useEffect, useRef } from "react";

/**
 * Derezzed, dei Daft Punk, dalla colonna sonora di TRON: Legacy — riprodotta
 * dall'embed ufficiale di Spotify, e avviata all'ingresso nella pagina.
 *
 * Quattro cose da sapere, perché decidono il comportamento:
 *
 * 1. **L'avvio automatico si tenta, non si promette.** Chrome, Safari e
 *    Firefox bloccano l'audio che parte senza un gesto dell'utente: è una
 *    politica del browser, non una scelta di chi scrive la pagina. Provato
 *    con la politica di serie: il salto al secondo nove avviene, il `play()`
 *    viene rifiutato e il player resta in pausa. Si prova comunque, perché
 *    dove è consentito (impostazione dell'utente, o un sito che visita
 *    spesso ascoltando) parte da sé, e in caso contrario ci si aggancia al
 *    primo gesto valido: un clic, un tocco, un tasto. Il solo movimento del
 *    mouse non basta — verificato: i browser non lo considerano un gesto —
 *    quindi non lo si ascolta nemmeno. Nessun pulsante da cercare.
 * 2. **Non si interrompe.** Quando la traccia finisce riparte, che sia il
 *    brano intero (per chi ha Spotify Premium e la sessione aperta nel
 *    browser) o l'anteprima di trenta secondi che Spotify concede a tutti gli
 *    altri.
 * 3. **Si può zittire subito.** Una pagina che suona da sé senza un modo
 *    evidente di spegnerla è maleducata: il comando è lì accanto, e la pausa
 *    chiesta a mano non viene scavalcata dal riavvio automatico.
 * 4. **Il player resta visibile.** Nasconderlo mentre suona è contro le
 *    condizioni dell'embed di Spotify, e comunque è quello che dice a chi
 *    guarda cosa sta sentendo e da dove viene.
 */

/* La traccia della colonna sonora, non uno dei remix: verificato con l'oEmbed
   di Spotify, che risponde «Derezzed - From "TRON: Legacy"/Score». */
const TRACCIA = "spotify:track:5X4ojuZG2mZ68EcLyBQ1D3";

/* Dove comincia. I primi secondi sono l'attacco in dissolvenza: da nove parte
   il giro di sintetizzatore, cioè la parte che uno si aspetta di sentire. */
const DA_SECONDO = 9;

/* Quanto prima della fine si considera «finita»: gli aggiornamenti di
   posizione arrivano ogni poche centinaia di millisecondi, quindi l'ultimo
   che si riceve non coincide mai col termine esatto. */
const MARGINE_FINE_MS = 1500;

type Aggiornamento = { data?: { position?: number; duration?: number; isPaused?: boolean } };

type EmbedController = {
  play: () => void;
  pause: () => void;
  resume: () => void;
  seek: (secondi: number) => void;
  destroy: () => void;
  addListener: (evento: string, cb: (e: Aggiornamento) => void) => void;
};

type SpotifyIFrameAPI = {
  createController: (
    elemento: HTMLElement,
    opzioni: { uri: string; width?: string | number; height?: string | number; theme?: 0 | 1 },
    callback: (controller: EmbedController) => void,
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void;
    __spotifyIFrameApi?: SpotifyIFrameAPI;
  }
}

export function Musica() {
  const involucro = useRef<HTMLDivElement>(null);
  const contenitore = useRef<HTMLDivElement>(null);
  const controller = useRef<EmbedController | null>(null);
  /* la pausa chiesta dall'utente vince sul riavvio automatico */
  const zittita = useRef(false);

  useEffect(() => {
    let annullato = false;
    /* alza la mano mentre il riavvio è in volo: gli aggiornamenti di posizione
       arrivano più volte al secondo, e senza questo il salto verrebbe chiesto
       a raffica */
    let riavviando = false;
    /* per accorgersi di un riavvolgimento fatto dal player, non da noi */
    let ultimaPosizione = 0;

    const crea = (api: SpotifyIFrameAPI) => {
      const el = contenitore.current;
      if (!el || annullato) return;

      api.createController(el, { uri: TRACCIA, width: "100%", height: 80 }, (c) => {
        if (annullato) {
          c.destroy();
          return;
        }
        controller.current = c;

        /*  Il tema scuro.
         *
         *  `createController` accetta l'opzione `theme` e la butta: verificato,
         *  il src dell'iframe esce senza. L'unico modo è metterlo sull'indirizzo
         *  dopo la creazione — l'iframe si ricarica e l'accordo con l'API si
         *  rifà da solo, quindi il controller continua a rispondere.
         *
         *  Serve perché di serie l'embed si tinge col colore della copertina —
         *  qui l'azzurro di TRON — che in questa pagina è l'unica cosa fuori
         *  tono. Il nero è l'unico colore che Spotify concede: il violetto
         *  esatto richiederebbe un filtro sopra l'iframe, che tingerebbe anche
         *  il loro logo, e alterare quel logo è vietato dalle loro linee guida.
         *  Il legame col resto lo fa la cornice, che è nostra.
         */
        /*  L'iframe si cerca dall'involucro, non da `el`: `el` a questo punto
         *  non è più nel documento — l'API lo ha sostituito — quindi il suo
         *  genitore è nullo. Verificato: cercandolo da lì il tema non veniva
         *  applicato e il src restava quello di serie.
         */
        const iframe = involucro.current?.querySelector("iframe");
        if (iframe && !iframe.src.includes("theme=")) {
          iframe.src = iframe.src + "&theme=0";
        }

        c.addListener("ready", () => {
          /* il salto prima dell'avvio: al contrario si sentirebbe mezzo
             secondo di attacco prima dello stacco */
          c.seek(DA_SECONDO);
          c.play();
        });

        c.addListener("playback_update", (e) => {
          const posizione = e.data?.position ?? 0;
          const durata = e.data?.duration ?? 0;
          /*  La pausa chiesta a mano dal comando dentro il player: la si
           *  registra per non scavalcarla col riavvio automatico. Si distingue
           *  dalla fine della traccia perché arriva quando la posizione è
           *  ancora dentro il brano.
           */
          const inPausa = e.data?.isPaused ?? true;
          if (durata > 0 && posizione < durata - MARGINE_FINE_MS) {
            zittita.current = inPausa;
          }

          /*  Il riavvio, e si guarda la posizione — non lo stato di pausa.
           *
           *  Misurato: quando l'anteprima di trenta secondi arriva in fondo,
           *  Spotify non dichiara la pausa. La posizione si ferma sul valore
           *  della durata e lo stato resta «in riproduzione», per sempre. Un
           *  riavvio agganciato a `isPaused` non sarebbe mai scattato.
           *
           *  Sulla posizione funziona per entrambi i casi: l'anteprima
           *  dichiara 29.7 secondi, il brano intero la propria durata.
           */
          if (durata > 0 && posizione >= durata - MARGINE_FINE_MS) {
            if (!riavviando && !zittita.current) {
              riavviando = true;
              c.seek(DA_SECONDO);
              c.play();
            }
          } else {
            riavviando = false;
            /*  Misurato: a fine anteprima il player riavvolge da sé e riparte
             *  da zero, prima che il nostro salto faccia effetto. Quando la
             *  posizione torna all'inizio dopo essere stata avanti, la si
             *  riporta al secondo nove: così il secondo giro comincia dove
             *  comincia il primo.
             */
            if (!zittita.current && ultimaPosizione > 5000 && posizione < 2500) {
              c.seek(DA_SECONDO);
            }
          }
          ultimaPosizione = posizione;
        });

        /*  Rete di sicurezza per il blocco dell'autoplay: il primo gesto
         *  valido, dovunque nella pagina, sblocca l'audio. Non `pointermove`,
         *  che i browser non contano come gesto: solo clic, tocco e tastiera.
         */
        const sblocca = () => {
          if (!zittita.current) c.play();
        };
        for (const evento of ["pointerdown", "keydown", "touchstart"] as const) {
          window.addEventListener(evento, sblocca, { once: true, passive: true });
        }

        if (new URLSearchParams(window.location.search).has("debug")) {
          (window as unknown as { musica?: EmbedController }).musica = c;
          c.addListener("playback_update", (e) => {
            (window as unknown as { stato?: unknown }).stato = e.data;
          });
        }
      });
    };

    if (window.__spotifyIFrameApi) {
      crea(window.__spotifyIFrameApi);
    } else {
      window.onSpotifyIframeApiReady = (api) => {
        window.__spotifyIFrameApi = api;
        crea(api);
      };
      const script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      annullato = true;
      controller.current?.destroy();
      controller.current = null;
    };
  }, []);

  return (
    /*  Nessun posizionamento qui: il player sta dentro la barra dei comandi,
     *  ultimo della fila, quindi all'estrema destra con lo slider alla sua
     *  sinistra. Su schermo stretto la barra va a capo e il player finisce
     *  sotto, dove c'è spazio.
     *
     *  Il ritaglio va su un involucro, non sul nodo che passo all'API:
     *  createController **sostituisce** quel nodo con il suo iframe, e con esso
     *  spariscono le classi che gli avessi messo. Serve perché l'iframe ha un
     *  fondo bianco di serie e il player dentro ha gli angoli arrotondati:
     *  fuori dal raggio restavano quattro spicchi chiari.
     *
     *  La cornice viola è il modo lecito di legarlo alla pagina: il colore
     *  dentro l'iframe non è nostro, il bordo intorno sì.
     */
    <div
      ref={involucro}
      className="w-[min(20rem,calc(100vw-3rem))] overflow-hidden rounded-xl ring-1 ring-viola/25 sm:w-[19rem]"
    >
      <div ref={contenitore} />
    </div>
  );
}
