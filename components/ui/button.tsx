import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-nav uppercase tracking-luxury transition-colors duration-300 ease-out disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-dark focus-visible:ring-offset-2 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-ink text-ivory hover:bg-ink-soft",
        secondary: "bg-transparent text-gold border border-ink hover:bg-ink hover:text-ivory",
        gold: "bg-gold text-ivory hover:bg-gold-dark",
        ghost: "bg-transparent text-gold hover:text-gold-dark",
        outlineLight: "bg-transparent text-ivory border border-ivory/70 hover:bg-ivory hover:text-gold-dark",
        link: "bg-transparent text-gold underline-offset-4 hover:text-gold-dark p-0 h-auto normal-case tracking-normal font-sans",
      },
      size: {
        sm: "h-10 px-5 text-[10px]",
        md: "h-12 px-8 text-[11px]",
        lg: "h-14 px-10 text-[12px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
