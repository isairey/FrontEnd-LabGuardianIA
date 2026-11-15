import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success"
  | "link";

export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const classes = [
    "common-button",
    `common-button--${variant}`,
    `common-button--${size}`,
    fullWidth ? "common-button--full-width" : "",
    loading ? "common-button--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <span
          className="common-button__spinner"
          aria-hidden="true"
        />
      ) : (
        leftIcon && (
          <span
            className="common-button__icon"
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )
      )}

      <span className="common-button__label">
        {children}
      </span>

      {!loading && rightIcon && (
        <span
          className="common-button__icon"
          aria-hidden="true"
        >
          {rightIcon}
        </span>
      )}
    </button>
  );
}