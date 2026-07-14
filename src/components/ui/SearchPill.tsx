import type { FormHTMLAttributes, ReactNode } from "react";

export type SearchPillProps = FormHTMLAttributes<HTMLFormElement> & {
  children: ReactNode;
  pill?: boolean;
};

export function SearchPill({ children, pill = true, className = "", ...props }: SearchPillProps) {
  return (
    <form className={["landing-search", className].filter(Boolean).join(" ")} {...props}>
      <div className={`landing-search__row${pill ? " landing-search__row--pill" : ""}`}>{children}</div>
    </form>
  );
}
