import type { SiteConfig } from "@/types/site";
import { siteUrl } from "./env";

export const siteConfig: SiteConfig = {
  title: "Focus Jam",
  description: "Lock in and jam on with YouTube.",
  url: siteUrl,
  ogImage: `${siteUrl}/opengraph-image.png`,
  twitterImage: `${siteUrl}/twitter-image.png`,
  socialHandle: "@eg__xo",
  links: {
    x: "https://x.com/eg__xo",
    github: "https://github.com/egarrisxn",
    website: "https://egxo.dev",
    linkedin: "https://linkedin.com/in/ethan-gx",
  },
};
