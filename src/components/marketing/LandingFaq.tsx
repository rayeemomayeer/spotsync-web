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
    a: "Apply at /apply with a signed-in account. Platform admins approve your org, then subscribe on Starter or Growth and publish zones.",
  },
  {
    q: "What is Demo Mode?",
    a: "A toggle on the driver page that isolates sandbox data on the real Go/Neon stack — reset anytime.",
  },
];

export function LandingFaq() {
  return (
    <section className="landing-faq-section" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="landing-faq-section__title">
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
