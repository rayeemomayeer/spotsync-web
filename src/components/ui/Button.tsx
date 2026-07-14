import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "text" | "danger-text";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  pill?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", fullWidth, pill, className = "", children, ...props }, ref) => {
    const classes = [
      "console-btn",
      `console-btn--${variant}`,
      pill ? "console-btn--pill" : "",
      fullWidth ? "console-btn--full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <button ref={ref} className={classes} {...props}>
        <span className="console-btn__label">{children}</span>
      </button>
    );
  },
);

Button.displayName = "Button";
