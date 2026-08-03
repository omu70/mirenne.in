import { cn } from "@/lib/utils";

interface LuxuryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "dark" | "gold" | "outline";
}

export function LuxuryBadge({ className, variant = "dark", children, ...props }: LuxuryBadgeProps) {
  return (
    <span
      className={cn(
        "label-luxury inline-flex items-center px-2.5 py-1 text-[9px] tracking-[0.16em]",
        variant === "dark" && "bg-ink text-ivory",
        variant === "gold" && "bg-gold text-ivory",
        variant === "outline" && "border border-ink/70 text-gold",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
