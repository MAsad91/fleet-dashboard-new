import { cva, VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 text-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary/90 focus:ring-primary shadow-sm hover:shadow-md",
        green: "bg-green text-white hover:bg-green/90 focus:ring-green shadow-sm hover:shadow-md",
        dark: "bg-dark text-white dark:bg-white/10 hover:bg-dark/90 dark:hover:bg-white/20 focus:ring-dark shadow-sm hover:shadow-md",
        outlinePrimary:
          "border border-primary hover:bg-primary/10 text-primary focus:ring-primary bg-transparent hover:border-primary/80",
        outlineGreen: "border border-green hover:bg-green/10 text-green focus:ring-green bg-transparent hover:border-green/80",
        outlineDark:
          "border border-dark hover:bg-dark/10 text-dark dark:hover:bg-white/10 dark:border-white/25 dark:text-white focus:ring-dark bg-transparent hover:border-dark/80 dark:hover:border-white/40",
      },
      shape: {
        default: "rounded-lg",
        rounded: "rounded-[5px]",
        full: "rounded-full",
      },
      size: {
        default: "py-3.5 px-6 text-sm",
        small: "py-2 px-4 text-sm",
        large: "py-4 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      shape: "default",
      size: "default",
    },
  },
);

type ButtonProps = HTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  };

export function Button({
  label,
  icon,
  variant,
  shape,
  size,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, shape, size, className })}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      {label}
    </button>
  );
}
