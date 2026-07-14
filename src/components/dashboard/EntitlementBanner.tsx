import Link from "next/link";
import type { EntitlementState } from "@/lib/org/entitlement";

export function EntitlementBanner({ state }: { state: EntitlementState }) {
  if (state.entitled) return null;

  return (
    <aside className="entitle-banner" role="status" aria-live="polite">
      <div className="entitle-banner__body">
        <p className="entitle-banner__title">{state.title}</p>
        <p className="entitle-banner__text">{state.body}</p>
      </div>
      {state.ctaHref && state.ctaLabel ? (
        <Link href={state.ctaHref} className="console-btn console-btn--primary console-btn--pill">
          {state.ctaLabel}
        </Link>
      ) : null}
    </aside>
  );
}
