/* =============================================================================
 *  engine.ts  --  il plasma di fx_plasma.c, su GPU e a caratteri.
 *
 *  Il campo è quello dell'originale, riga per riga: cinque seni in x, y, x+y,
 *  distanza e una coppia di assi che ruotano, letti attraverso la stessa
 *  palette a coseni.
 *
 *  Anche l'uscita è quella del terminale, non una sua imitazione: la griglia di
 *  celle, la rampa di 69 caratteri ordinati per densità, la luminanza corretta
 *  in gamma per scegliere il glifo e la stessa formula di colore di `emit()` —
 *  primo piano schiarito in proporzione alla componente più alta, fondo al 22%.
 *  La rampa diventa un atlante di glifi disegnato su un canvas e passato al
 *  frammento come texture: ogni cella sceglie il suo carattere dal valore del
 *  plasma al proprio centro, esattamente come faceva il C.
 *
 *  Niente React qui dentro: il modulo è DOM puro, così la stessa logica serve
 *  lo sfondo dell'intestazione e la demo a schermo pieno. `destroy()` stacca
 *  tutto — senza, in sviluppo il doppio montaggio di StrictMode lascerebbe due
 *  cicli a girare sullo stesso canvas.
 * ========================================================================== */

/** La stessa rampa di fx_libero_core.c, dal vuoto al pieno. */
export const RAMP =
  " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@";

const FONT = 'Consolas, "DejaVu Sans Mono", ui-monospace, monospace';

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2      uRes;     /* quadro in pixel                              */
uniform float     uT;       /* tempo del campo, a passi uniformi            */
uniform vec2      uCen;     /* centro inseguito dal puntatore, unità campo  */
uniform float     uRing;    /* intensità dell'anello locale                 */
uniform float     uScale;   /* 2.6 nell'originale, qui sulla rotella        */
uniform vec2      uCell;    /* cella di testo in pixel                      */
uniform float     uN;       /* glifi nell'atlante                           */
uniform float     uAscii;   /* 1 = caratteri, 0 = pixel                     */
uniform float     uColor;   /* 1 = colore, 0 = fosforo bianco               */
uniform sampler2D uAtlas;

const float TAU = 6.28318530717958647692;

/* la palette a coseni di fx_pal(): a + b*cos(TAU*(c*t + d)) */
vec3 pal(float t, vec3 a, vec3 b, vec3 c, vec3 d){
    return a + b*cos(TAU*(c*t + d));
}

/* il campo, valutato in un punto del quadro espresso in pixel */
vec3 field(vec2 px){
    vec2 uv = (2.0*px - uRes)/uRes.y;   /* y in [-1,1], x scalato dall'aspetto */
    vec2 p  = uv*uScale;
    float t = uT;

    /* il termine radiale pesava gli assi 1.5 e 1.7 sotto la radice:
       sqrt(1.5*x^2 + 1.7*y^2) è la lunghezza degli assi riscalati */
    vec2 r = (p - uCen)*vec2(1.224744871, 1.303840481);

    float v;
    v  = sin(p.x*1.3 + t*1.7);
    v += sin(p.y*1.1 - t*1.1);
    v += sin((p.x + p.y)*0.8 + t*0.9);
    v += sin(length(r)*1.6 - t*2.1);
    v += 0.7*sin((p.x*cos(t*0.31) - p.y*sin(t*0.31))*2.1 + t*1.3);
    v *= 0.21;

    /* l'anello attorno al puntatore: decade in fretta, così resta un tocco
       locale e non ridisegna tutto il campo */
    float d = length(p - uCen);
    v += uRing*0.34*sin(d*5.0 - t*3.4)*exp(-d*d*0.42);

    return pal(v + t*0.08,
               vec3(0.52, 0.48, 0.52), vec3(0.48, 0.42, 0.48),
               vec3(1.00, 1.00, 1.00), vec3(0.00, 0.28, 0.58));
}

void main(){
    if (uAscii < 0.5){
        gl_FragColor = vec4(field(gl_FragCoord.xy), 1.0);
        return;
    }

    /* una cella di testo: il colore si decide una volta al centro, il glifo si
       legge dall'atlante con le coordinate locali nella cella */
    vec2 cid = floor(gl_FragCoord.xy/uCell);
    vec2 cuv = (gl_FragCoord.xy - cid*uCell)/uCell;
    vec3 c   = field((cid + 0.5)*uCell);

    float lum = clamp(dot(c, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
    float sh  = pow(clamp((lum - 0.055)/0.945, 0.0, 1.0), 1.20);
    float idx = floor(sh*(uN - 1.0) + 0.5);

    float g = texture2D(uAtlas, vec2((idx + cuv.x)/uN, 1.0 - cuv.y)).a;

    float mx = max(c.r, max(c.g, c.b));
    float k  = 1.0/max(0.28, 0.35 + 0.65*mx);
    vec3  fg = uColor > 0.5 ? c*k    : vec3(0.86, 0.90, 0.86)*(0.35 + 0.65*sh);
    vec3  bg = uColor > 0.5 ? c*0.22 : vec3(0.02, 0.03, 0.02);

    gl_FragColor = vec4(mix(bg, fg, g), 1.0);
}
`;

export type PlasmaState = {
  /** dove punta il puntatore (t*) e dove è arrivato il campo (c*) */
  tx: number;
  ty: number;
  cx: number;
  cy: number;
  speed: number;
  speedTarget: number;
  ring: number;
  scale: number;
  cellW: number;
  ascii: boolean;
  color: boolean;
  paused: boolean;
  t: number;
  touched: boolean;
};

export type PlasmaStat = {
  fps: number;
  cols: number;
  rows: number;
  width: number;
  height: number;
  ascii: boolean;
  speed: number;
};

export type PlasmaOptions = {
  canvas: HTMLCanvasElement;
  /** cella in pixel CSS; il rapporto resta 1:2, come in un terminale */
  cellW?: number;
  scale?: number;
  ascii?: boolean;
  color?: boolean;
  /** la tastiera si aggancia solo dove l'utente se l'aspetta */
  keys?: boolean;
  pointer?: boolean;
  /** da spegnere quando la pagina scorre: la rotella è sua */
  wheel?: boolean;
  /** segue l'inclinazione del telefono, dove c'è un giroscopio */
  gyro?: boolean;
  /** di norma il canvas; in uno sfondo conviene il contenitore, così il campo
   *  segue il puntatore anche quando passa sopra il testo */
  pointerTarget?: HTMLElement | null;
  onStat?: (s: PlasmaStat) => void;
  onPoint?: () => void;
  onKey?: (k: string) => void;
};

export type PlasmaHandle = {
  state: PlasmaState;
  stop: () => void;
  resume: () => void;
  redraw: () => void;
  destroy: () => void;
  /** Cambia il corpo della cella rigenerando l'atlante. Sta qui e non nello
   *  state perché l'atlante è una texture: scrivere il numero non basta. */
  setCellW: (v: number) => void;
  setAscii: (v: boolean) => void;
  setColor: (v: boolean) => void;
};

/**
 * L'atlante: i 69 caratteri della rampa, uno accanto all'altro, bianchi su
 * trasparente. Il corpo si dimensiona sulla larghezza della cella — per un
 * monospace l'avanzamento è circa 0.6 del corpo — così il glifo riempie la
 * cella senza sbordare, come in una griglia di testo vera.
 */
function makeAtlas(cw: number, ch: number): HTMLCanvasElement {
  const a = document.createElement("canvas");
  a.width = Math.max(1, Math.round(RAMP.length * cw));
  a.height = Math.max(1, Math.round(ch));
  const g = a.getContext("2d");
  if (!g) return a;
  g.clearRect(0, 0, a.width, a.height);
  g.fillStyle = "#fff";
  g.font = `${Math.round(Math.min(ch * 0.96, cw / 0.6))}px ${FONT}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (let i = 0; i < RAMP.length; ++i) g.fillText(RAMP[i], (i + 0.5) * cw, ch * 0.54);
  return a;
}

/** Restituisce `null` se il browser non espone WebGL: il chiamante mostra un
 *  fondo statico invece di un canvas vuoto. */
export function startPlasma(options: PlasmaOptions): PlasmaHandle | null {
  const o = {
    cellW: 9,
    scale: 2.6,
    ascii: true,
    color: true,
    keys: false,
    pointer: true,
    wheel: true,
    gyro: false,
    pointerTarget: null,
    ...options,
  };

  const cv = o.canvas;
  const gl = cv.getContext("webgl", {
    antialias: false,
    alpha: false,
    powerPreference: "high-performance",
  }) as WebGLRenderingContext | null;
  if (!gl) return null;

  function compile(type: number, src: string): WebGLShader {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, src);
    gl!.compileShader(s);
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS))
      throw new Error(gl!.getShaderInfoLog(s) || "shader non compilato");
    return s;
  }

  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(prog) || "programma non collegato");
  gl.useProgram(prog);

  /* un triangolo che copre il quadro: niente altro da caricare */
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const names = [
    "uRes",
    "uT",
    "uCen",
    "uRing",
    "uScale",
    "uCell",
    "uN",
    "uAscii",
    "uColor",
    "uAtlas",
  ] as const;
  const U = {} as Record<(typeof names)[number], WebGLUniformLocation | null>;
  for (const n of names) U[n] = gl.getUniformLocation(prog, n);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(U.uAtlas, 0);
  gl.uniform1f(U.uN, RAMP.length);

  const state: PlasmaState = {
    tx: 0,
    ty: 0,
    cx: 0,
    cy: 0,
    speed: 1,
    speedTarget: 1,
    ring: 0,
    scale: o.scale,
    cellW: o.cellW,
    ascii: o.ascii,
    color: o.color,
    paused: false,
    t: 0,
    touched: false,
  };

  /* ------------------------------------------------------- quadro e atlante */
  let W = 0;
  let H = 0;
  let dpr = 1;
  let atlasFor = 0;

  function rebuildAtlas() {
    const cw = Math.round(state.cellW * dpr);
    if (atlasFor === cw) return;
    atlasFor = cw;
    gl!.bindTexture(gl!.TEXTURE_2D, tex);
    gl!.texImage2D(
      gl!.TEXTURE_2D,
      0,
      gl!.RGBA,
      gl!.RGBA,
      gl!.UNSIGNED_BYTE,
      makeAtlas(cw, Math.round(state.cellW * 2 * dpr)),
    );
  }

  function resize() {
    /* Il costo cresce col quadrato della densità, e questo shader calcola
       cinque seni più una palette per pixel. Su schermi molto densi il plasma
       non guadagna niente a 3x, quindi si taglia a 2; su un telefono si scende
       a 1.5, dove i glifi restano nitidi ma i pixel da riempire sono meno
       della metà — su batteria la differenza si sente. */
    const stretto = Math.min(cv.clientWidth, window.innerWidth || cv.clientWidth) < 640;
    const d = Math.min(window.devicePixelRatio || 1, stretto ? 1.5 : 2);
    const w = Math.max(1, Math.round(cv.clientWidth * d));
    const h = Math.max(1, Math.round(cv.clientHeight * d));
    if (w === W && h === H && d === dpr) return;
    W = cv.width = w;
    H = cv.height = h;
    dpr = d;
    gl!.viewport(0, 0, W, H);
    atlasFor = 0;
    rebuildAtlas();
  }

  /* -------------------------------------------------------------- comandi */
  /*  Quanto il puntatore sposta il centro del campo.
   *
   *  A uno il centro seguiva il puntatore da bordo a bordo, e il risultato era
   *  che muovendo il mouse per arrivare a un pulsante si trascinava dietro
   *  tutto lo sfondo: la pagina sembrava reagire a ogni gesto, anche a quelli
   *  che non la riguardavano. Il quaranta per cento lascia il tocco — si vede
   *  che lo sfondo sa dove sei — senza che diventi un'altalena.
   */
  const RISPOSTA = 0.4;

  function pointTo(clientX: number, clientY: number) {
    const r = cv.getBoundingClientRect();
    const asp = r.width / Math.max(1, r.height);
    const nx = (((2 * (clientX - r.left)) / Math.max(1, r.width)) - 1) * asp;
    const ny = 1 - (2 * (clientY - r.top)) / Math.max(1, r.height);
    state.tx = nx * state.scale * RISPOSTA;
    state.ty = ny * state.scale * RISPOSTA;
    state.touched = true;
  }

  let lastMove = 0;
  let lastX = 0;
  let lastY = 0;

  const onMove = (e: PointerEvent) => {
    const now = performance.now();
    pointTo(e.clientX, e.clientY);
    /*  Velocità del puntatore -> velocità del campo, ma con la mano molto
     *  leggera. Prima un gesto rapido portava il tempo a più del triplo, e il
     *  campo partiva per conto suo proprio mentre si stava leggendo. Adesso il
     *  massimo è un trenta per cento in più: si avverte come una reazione,
     *  non come uno strappo.
     */
    if (lastMove) {
      const dt = Math.max(1, now - lastMove);
      const v = (Math.hypot(e.clientX - lastX, e.clientY - lastY) / dt) * 1000;
      state.speedTarget = 0.95 + Math.min(0.3, v / 4200);
    }
    lastMove = now;
    lastX = e.clientX;
    lastY = e.clientY;
    o.onPoint?.();
  };
  const onDown = (e: PointerEvent) => {
    pointTo(e.clientX, e.clientY);
    /* l'onda si sente ma non squarcia il campo: a uno il tocco apriva un
       cratere, e su un telefono ogni tocco è anche uno scroll mancato */
    state.ring = 0.45;
    o.onPoint?.();
  };
  const onLeave = () => {
    state.touched = false;
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    state.scale = Math.min(9, Math.max(0.7, state.scale * Math.exp(-e.deltaY * 0.0012)));
  };
  /*  L'inclinazione del telefono muove il centro del campo.
   *
   *  Due cose la rendono usabile invece che solo dimostrabile:
   *
   *  1. **Lo zero è dove sei.** Nessuno tiene il telefono perfettamente
   *     piatto: il primo evento fissa la posizione di partenza e da lì si
   *     misura lo scostamento, così il campo parte centrato qualunque sia la
   *     postura della mano.
   *  2. **Il fondo scala corto.** Venticinque gradi bastano per arrivare al
   *     bordo: più di così si dovrebbe girare il telefono per vedere l'effetto,
   *     e a quel punto non si vede più lo schermo.
   *
   *  Il valore finisce negli stessi tx/ty del puntatore, quindi lo raggiunge
   *  lo stesso inseguimento morbido e non c'è un secondo percorso da tarare.
   */
  const GRADI_PIENI = 25;
  let zeroBeta: number | null = null;
  let zeroGamma: number | null = null;

  const onOrient = (e: DeviceOrientationEvent) => {
    if (e.beta === null || e.gamma === null) return;
    if (zeroBeta === null || zeroGamma === null) {
      zeroBeta = e.beta;
      zeroGamma = e.gamma;
      return;
    }
    const dx = Math.max(-1, Math.min(1, (e.gamma - zeroGamma) / GRADI_PIENI));
    const dy = Math.max(-1, Math.min(1, (e.beta - zeroBeta) / GRADI_PIENI));
    /* l'asse verticale va rovesciato: inclinando in avanti il campo scende */
    state.tx = dx * state.scale;
    state.ty = -dy * state.scale;
    state.touched = true;
  };

  /*  Su iOS gli eventi di orientamento non arrivano finché non li si chiede, e
   *  la richiesta vale solo dentro un gesto dell'utente. Invece di mettere in
   *  pagina un pulsante per una cosa che altrove funziona da sola, la domanda
   *  parte al primo tocco: il dialogo è quello di sistema, e se la risposta è
   *  no non cambia nulla di quello che c'era.
   */
  type PermessoOrientamento = { requestPermission?: () => Promise<string> };
  const chiediGyro = () => {
    const D = window.DeviceOrientationEvent as unknown as PermessoOrientamento | undefined;
    if (D && typeof D.requestPermission === "function") {
      D.requestPermission()
        .then((esito) => {
          if (esito === "granted") window.addEventListener("deviceorientation", onOrient);
        })
        .catch(() => {});
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === " ") {
      state.paused = !state.paused;
      e.preventDefault();
    } else if (k === "b") state.ascii = !state.ascii;
    else if (k === "c") state.color = !state.color;
    else if (k === "+" || k === "=" || k === "-" || k === "_") {
      const up = k === "+" || k === "=";
      state.cellW = Math.min(28, Math.max(4, state.cellW + (up ? 1 : -1)));
      atlasFor = 0;
      rebuildAtlas();
    } else if (k === "r") {
      state.t = 0;
      state.scale = o.scale;
      state.ring = 0;
      state.tx = state.ty = state.cx = state.cy = 0;
      state.speedTarget = 1;
    } else o.onKey?.(k);
  };
  const onVisibility = () => {
    if (document.hidden) api.stop();
    else api.resume();
  };

  const pt: HTMLElement = o.pointerTarget ?? cv;

  window.addEventListener("resize", resize);
  resize();

  if (o.pointer) {
    pt.addEventListener("pointermove", onMove);
    pt.addEventListener("pointerdown", onDown);
    pt.addEventListener("pointerleave", onLeave);
    if (o.wheel) pt.addEventListener("wheel", onWheel, { passive: false });
  }
  if (o.keys) window.addEventListener("keydown", onKeyDown);
  if (o.gyro && typeof window.DeviceOrientationEvent !== "undefined") {
    /* dove il permesso non serve (Android, e iOS già autorizzato) gli eventi
       cominciano ad arrivare subito; dove serve, li aggancia chiediGyro */
    window.addEventListener("deviceorientation", onOrient);
    pt.addEventListener("pointerdown", chiediGyro, { once: true });
  }
  document.addEventListener("visibilitychange", onVisibility);

  /* ----------------------------------------------------------------- ciclo */
  /*  Lezione portata dalla versione per terminale: il tempo del campo non va
   *  avanzato con il delta grezzo del quadro, che oscilla di qualche
   *  millisecondo a ogni giro e si vede come scatto. Si avanza con un delta
   *  levigato, che su qualunque refresh — 60, 120, 144 Hz — dà passi uniformi.
   */
  const calmo =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let prev = 0;
  let smooth = 1 / 60;
  let fps = 60;
  let statAt = 0;
  let raf = 0;
  let alive = true;

  function draw() {
    resize();
    gl!.uniform2f(U.uRes, W, H);
    gl!.uniform1f(U.uT, state.t);
    gl!.uniform2f(U.uCen, state.cx, state.cy);
    gl!.uniform1f(U.uRing, state.ring);
    gl!.uniform1f(U.uScale, state.scale);
    gl!.uniform2f(U.uCell, state.cellW * dpr, state.cellW * 2 * dpr);
    gl!.uniform1f(U.uAscii, state.ascii ? 1 : 0);
    gl!.uniform1f(U.uColor, state.color ? 1 : 0);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, tex);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  function frame(now: number) {
    if (!alive) return;
    if (!prev) prev = now;
    let dt = (now - prev) / 1000;
    prev = now;
    if (dt > 0.25) dt = 0.25; /* scheda tornata in primo piano */
    if (dt > 0) smooth = smooth * 0.9 + dt * 0.1;

    /* inseguimenti morbidi, col coefficiente corretto per il delta: la
       reattività non cambia col refresh dello schermo */
    /* Inseguimento più lento di prima (era 7): il centro arriva con un ritardo
       percepibile, ed è quel ritardo a far leggere il movimento come un'onda
       invece che come uno strappo attaccato al puntatore. */
    const k = 1 - Math.exp(-smooth * 3.2);
    if (!state.touched) {
      /* il puntatore è uscito: il centro torna a casa. Il coefficiente passa
         per l'esponenziale del delta, non è un fattore per quadro: un "x0.96 a
         ogni giro" sarebbe due volte più rapido a 120 Hz che a 60 */
      const home = Math.exp(-smooth * 2.4);
      state.tx *= home;
      state.ty *= home;
      state.speedTarget += (1 - state.speedTarget) * k;
    }
    state.cx += (state.tx - state.cx) * k;
    state.cy += (state.ty - state.cy) * k;
    state.speed += (state.speedTarget - state.speed) * (1 - Math.exp(-smooth * 2.5));
    state.ring *= Math.exp(-smooth * 1.3);

    if (!state.paused) state.t += smooth * 0.6 * state.speed;

    draw();

    if (dt > 0) fps = fps * 0.9 + (1 / dt) * 0.1;
    if (o.onStat && now - statAt > 250) {
      statAt = now;
      o.onStat({
        fps,
        cols: Math.floor(cv.clientWidth / state.cellW),
        rows: Math.floor(cv.clientHeight / (state.cellW * 2)),
        width: W,
        height: H,
        ascii: state.ascii,
        speed: state.speed,
      });
    }
    raf = requestAnimationFrame(frame);
  }

  const api: PlasmaHandle = {
    state,
    stop() {
      if (!alive) return;
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
    resume() {
      if (alive) return;
      alive = true;
      prev = 0;
      raf = requestAnimationFrame(frame);
    },
    redraw: draw,
    setCellW(v: number) {
      const n = Math.min(28, Math.max(4, Math.round(v)));
      if (n === state.cellW) return;
      state.cellW = n;
      atlasFor = 0;
      rebuildAtlas();
      if (!alive) draw(); /* da fermo il quadro va ridisegnato a mano */
    },
    setAscii(v: boolean) {
      if (v === state.ascii) return;
      state.ascii = v;
      if (!alive) draw();
    },
    setColor(v: boolean) {
      if (v === state.color) return;
      state.color = v;
      if (!alive) draw();
    },
    destroy() {
      api.stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("keydown", onKeyDown);
      pt.removeEventListener("pointermove", onMove);
      pt.removeEventListener("pointerdown", onDown);
      pt.removeEventListener("pointerleave", onLeave);
      pt.removeEventListener("wheel", onWheel);
      pt.removeEventListener("pointerdown", chiediGyro);
      window.removeEventListener("deviceorientation", onOrient);
      /* il contesto va restituito a mano: i browser ne tengono pochi vivi per
         pagina, e in sviluppo ogni rimontaggio ne chiederebbe uno nuovo */
      gl!.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };

  if (calmo) {
    /* chi ha chiesto meno movimento riceve un fotogramma fermo */
    state.t = 3.1;
    draw();
    alive = false;
  } else {
    raf = requestAnimationFrame(frame);
  }
  return api;
}
