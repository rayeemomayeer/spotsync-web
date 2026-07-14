import Link from "next/link";

const productLinks = [
  { href: "/search", label: "Find parking" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/developers", label: "Developers" },
];

const companyLinks = [
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "https://github.com/rayeemomayeer", label: "GitHub", external: true },
];

const workspaceLinks = [
  { href: "/driver", label: "Driver map" },
  { href: "/console", label: "Live console" },
  { href: "/login", label: "Driver sign in" },
  { href: "/login?as=org", label: "Organization sign in" },
];

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="landing-footer__inner">
        <div className="landing-footer__top">
          <div className="landing-footer__brand-block">
            <Link href="/" className="landing-footer__brand">
              <span className="landing-footer__mark" aria-hidden />
              SpotSync
            </Link>
            <p className="landing-footer__tagline">
              Real-time parking inventory with pay-before-reserve checkout — built for demo
              crowds, not chaos.
            </p>
          </div>

          <div className="landing-footer__columns">
            <nav aria-label="Product">
              <h3>Product</h3>
              <ul>
                {productLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Workspace">
              <h3>Workspace</h3>
              <ul>
                {workspaceLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Company">
              <h3>Legal</h3>
              <ul>
                {companyLinks.map((l) => (
                  <li key={l.href}>
                    {"external" in l && l.external ? (
                      <a href={l.href} rel="noopener noreferrer" target="_blank">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href}>{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="landing-footer__bottom">
          <p className="landing-footer__copy">© {year} SpotSync · Portfolio demonstration</p>
          <p className="landing-footer__meta">
            Go reservation engine · Express BFF · Next.js web
          </p>
        </div>
      </div>
    </footer>
  );
}
