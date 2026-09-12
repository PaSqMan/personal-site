/* =============================================================================
 *  I contenuti del sito, in un posto solo.
 *
 *  Il progetto di riferimento tiene i testi in `content/*.json` validati con
 *  zod, perché lì i dati arrivano da fuori e vanno controllati prima di
 *  pubblicare. Qui i testi sono pochi, li scrive chi scrive anche il codice, e
 *  TypeScript basta da solo a impedire un campo dimenticato: un modulo tipizzato
 *  costa meno e si legge meglio di uno schema.
 * ========================================================================== */

/* Il sommario dell'intestazione sta nel componente, non qui: la frase ha dei
   grassetti dentro, quindi è JSX e non una stringa. Qui restano i dati che
   servono in più punti — recapiti e metadati della pagina. */

export const site = {
  persona: {
    nome: "Pasquale Di Gennaro",
    handle: "PaSqMan",
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
};
