type Step = "details" | "payment" | "confirm";

const labels: Record<Step, string> = {
  details: "Details",
  payment: "Payment",
  confirm: "Confirm",
};

export function CheckoutStepper({ step }: { step: Step }) {
  const order: Step[] = ["details", "payment", "confirm"];
  const idx = order.indexOf(step);

  return (
    <ol className="checkout-stepper" aria-label="Checkout progress">
      {order.map((s, i) => (
        <li
          key={s}
          className={`checkout-stepper__step${i < idx ? " checkout-stepper__step--done" : ""}${i === idx ? " checkout-stepper__step--active" : ""}`}
          aria-current={i === idx ? "step" : undefined}
        >
          <span className="checkout-stepper__num">{i + 1}</span>
          {labels[s]}
        </li>
      ))}
    </ol>
  );
}
