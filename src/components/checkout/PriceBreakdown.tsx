import { formatCents, type CheckoutQuote } from "@/lib/checkout/client";

export function PriceBreakdown({ quote }: { quote: CheckoutQuote }) {
  return (
    <aside className="price-breakdown" aria-label="Price breakdown">
      <h2 className="price-breakdown__title">Price breakdown</h2>
      <ul className="price-breakdown__lines">
        {quote.line_items.map((line) => (
          <li key={line.description}>
            <span>{line.description}</span>
            <span>{formatCents(line.amount_cents)}</span>
          </li>
        ))}
      </ul>
      <p className="price-breakdown__total">
        <span>Total</span>
        <strong>{formatCents(quote.amount_cents)}</strong>
      </p>
      <p className="price-breakdown__note">Taxes included (demo). Billed via Stripe test mode.</p>
    </aside>
  );
}
