const faqs = [
  {
    q: "Do I need an account to search?",
    a: "No — browse zones on /search or the driver map. Sign in when you are ready to book and pay.",
  },
  {
    q: "Is this production billing?",
    a: "Portfolio demo uses Stripe test mode only. Live keys are blocked at the BFF layer.",
  },
  {
    q: "How do garage operators join?",
    a: "Platform admins approve new orgs. Operators subscribe on Starter or Growth, then publish zones.",
  },
  {
    q: "What is Demo Mode?",
    a: "A toggle on the driver page that isolates sandbox data on the real Go/Neon stack — reset anytime.",
  },
];

const testimonials = [
  {
    quote: "We cut no-shows by showing live capacity before drivers leave home.",
    name: "Maya R.",
    role: "Ops lead, demo garage",
  },
  {
    quote: "Pay-then-reserve finally matches how riders expect mobility apps to work.",
    name: "James T.",
    role: "Driver, portfolio walkthrough",
  },
];

export function LandingTestimonials() {
  return (
    <section className="landing-section" aria-labelledby="testimonials-heading">
      <h2 id="testimonials-heading" className="landing-section__title">
        Trusted in demos
      </h2>
      <ul className="landing-testimonials">
        {testimonials.map((t) => (
          <li key={t.name} className="landing-testimonials__card">
            <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
            <footer>
              <cite>{t.name}</cite> — {t.role}
            </footer>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LandingFaq() {
  return (
    <section className="landing-section" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="landing-section__title">
        FAQ
      </h2>
      <div className="landing-faq">
        {faqs.map((item) => (
          <details key={item.q} className="landing-faq__item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
