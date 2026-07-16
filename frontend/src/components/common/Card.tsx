import type { HTMLAttributes, ReactNode } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> { children: ReactNode; }
export default function Card({ children, className = "", ...props }: Props) {
  return <div className={`card ${className}`} {...props}>{children}</div>;
}
