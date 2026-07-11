import * as React from "react";
import Link from "next/link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "outlined" | "text";
  href?: string;
  icon?: React.ReactNode;
}

export function Button({ 
  variant = "filled", 
  href, 
  icon, 
  children, 
  className = "", 
  ...props 
}: ButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 px-6 h-10 rounded-full font-medium text-sm transition-all duration-200 overflow-hidden before:absolute before:inset-0 before:opacity-0 hover:before:opacity-[0.08] active:before:opacity-[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
  
  const variants = {
    filled: "bg-primary text-on-primary before:bg-on-primary shadow-sm hover:shadow-md focus-visible:outline-primary",
    outlined: "border border-outline text-primary before:bg-primary hover:bg-primary/5 focus-visible:outline-primary",
    text: "text-primary before:bg-primary hover:bg-primary/5 px-3 focus-visible:outline-primary"
  };

  const combinedStyles = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedStyles} {...props}>
      {icon}
      {children}
    </button>
  );
}
