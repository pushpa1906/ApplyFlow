import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export default function Button({ variant = "primary", className = "", children, ...props }: Props) {
  return <button className={`button button-${variant} ${className}`} {...props}>{children}</button>;
}
