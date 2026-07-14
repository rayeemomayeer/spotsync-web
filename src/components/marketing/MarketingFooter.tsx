import Link from "next/link";

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="landing-footer__grid">
        <div>
          <strong className="landing-footer__brand">SpotSync</strong>
          <p className="landing-footer__tagline">Real-time parking marketplace.</p>
        </div>
        <nav aria-label="Product">
          <h3>Product</h3>
          <ul>
            <li>
              <Link href="/search">Find parking</Link>
            </li>
            <li>
              <Link href="/pricing">Pricing</Link>
            </li>
            <li>
              <Link href="/how-it-works">How it works</Link>
            </li>
            <li>
              <Link href="/developers">Developers</Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Company">
          <h3>Company</h3>
          <ul>
            <li>
              <Link href="/legal/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/legal/terms">Terms</Link>
            </li>
            <li>
              <a href="https://github.com/rayeemomayeer" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
          </ul>
        </nav>
        <div>
          <h3>Stay in the loop</h3>
          <p className="landing-footer__newsletter">Newsletter coming soon — portfolio stub.</p>
          <form className="landing-footer__form" action="#" method="post">
            <input
              type="email"
              className="ui-input"
              placeholder="you@example.com"
              aria-label="Email for newsletter"
              disabled
            />
            <button type="submit" className="console-btn console-btn--ghost console-btn--pill" disabled>
              Notify me
            </button>
          </form>
        </div>
      </div>
      <p className="landing-footer__copy">© {year} SpotSync. Portfolio demonstration.</p>
    </footer>
  );
}
