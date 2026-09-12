import type { MetadataRoute } from "next";

import { site } from "@/content/site";

/* Con "output: export" non c'e` un server che possa generare il file a ogni
   richiesta: va dichiarato statico, o la build si ferma. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.seo.url}/sitemap.xml`,
  };
}
