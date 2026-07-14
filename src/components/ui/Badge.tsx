import type { HTMLAttributes } from "react";

export type BadgeTone = "brand" | "success" | "muted" | "warn";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ tone = "brand", className = "", children, ...props }: BadgeProps) {
  return (
    <span className={["ui-badge", `ui-badge--${tone}`, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </span>
  );
}
