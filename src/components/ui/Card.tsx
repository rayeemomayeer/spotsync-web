import type { HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "article" | "section";
  /** Soft offset shadow + top ink rule */
  elevate?: boolean;
};

export function Card({
  as: Tag = "div",
  elevate,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={["shell-card", elevate ? "shell-card--elevate" : "", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Tag>
  );
}
