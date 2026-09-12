import type { MetadataRoute } from "next";

import { site } from "@/content/site";

/* Con "output: export" non c'e` un server che possa generare il file a ogni
   richiesta: va dichiarato statico, o la build si ferma. */
export const dynamic = "force-static";

/* Con `output: export` la sitemap viene scritta una volta alla build. */
export default function sitemap(): MetadataRoute.Sitemap {
  const ora = new Date();
  return [
    { url: `${site.seo.url}/`, lastModified: ora, priority: 1 },
    { url: `${site.seo.url}/plasma/`, lastModified: ora, priority: 0.6 },
  ];
}
