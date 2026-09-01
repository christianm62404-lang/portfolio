import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,border-color,color,transform] duration-200 ease-[var(--ease-out-expo)] disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-canvas hover:bg-ink-strong active:translate-y-px border border-transparent",
        outline:
          "border border-line-bright text-ink hover:border-signal hover:text-signal bg-transparent",
        ghost: "text-ink-dim hover:text-ink border border-transparent hover:border-line-bright",
        signal: "bg-signal text-canvas hover:bg-signal-soft border border-transparent",
      },
      size: {
        sm: "h-9 px-3.5 text-[0.8125rem] rounded-sm",
        md: "h-11 px-5 text-sm rounded-sm",
        lg: "h-13 px-7 text-[0.9375rem] rounded-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export interface ButtonLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {}

/** Same visual language as Button, for genuine navigation. */
export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, variant, size, ...props }, ref) => (
    <a ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
ButtonLink.displayName = "ButtonLink";

export { buttonVariants };
