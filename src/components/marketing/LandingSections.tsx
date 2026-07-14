const stats = [
  { value: "50ms", label: "Typical zone list (cached)" },
  { value: "9", label: "Graded API endpoints" },
  { value: "100%", label: "Pay-before-reserve in prod" },
];

export function LandingSections() {
  return (
    <>
      <section className="landing-section" aria-labelledby="how-heading">
        <h2 id="how-heading" className="landing-section__title">
          How it works
        </h2>
        <ol className="landing-steps">
          <li>
            <strong>Search</strong>
            <p>Find garages and lots with live spot counts — filtered by location and type.</p>
          </li>
          <li>
            <strong>Book & pay</strong>
            <p>Pick a spot, pay with Stripe test checkout, and lock capacity before you drive.</p>
          </li>
          <li>
            <strong>Arrive</strong>
            <p>Your plate is on the reservation. Cancel anytime for a test refund.</p>
          </li>
        </ol>
      </section>

      <section className="landing-section landing-section--split" aria-labelledby="audience-heading">
        <h2 id="audience-heading" className="landing-section__title">
          Built for drivers and operators
        </h2>
        <div className="landing-audience">
          <article className="landing-audience__card">
            <h3>Drivers</h3>
            <ul>
              <li>Map-first booking UX</li>
              <li>Real-time availability via SSE</li>
              <li>Receipts and refunds in one place</li>
            </ul>
          </article>
          <article className="landing-audience__card">
            <h3>Businesses</h3>
            <ul>
              <li>Org approval + Stripe subscription</li>
              <li>Zone CRUD with capacity locks</li>
              <li>Platform admin for marketplace ops</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="landing-section" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="visually-hidden">
          Platform stats
        </h2>
        <ul className="landing-stats">
          {stats.map((s) => (
            <li key={s.label}>
              <span className="landing-stats__value">{s.value}</span>
              <span className="landing-stats__label">{s.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
