export const siteConfig = {
  name: "SpotSync",
  title: "SpotSync — Book parking before you arrive",
  description:
    "Real-time parking marketplace for drivers and garage operators. Search, book, and pay for spots with live availability and org tools.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://spotsync-nu.vercel.app",
  ogImage: "/og.png",
};

export function absoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    sameAs: [],
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/search")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
