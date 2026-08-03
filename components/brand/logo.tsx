import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/brand/logo-mark";

interface LogoProps {
  /**
   * full = mark + wordmark stacked, centered (a primary lockup for splash/
   * loading states and other centered contexts with vertical room).
   * horizontal = mark beside wordmark, left-aligned (footer and other
   * left-aligned brand rows). mark = the oval "M" alone (compact spaces —
   * mobile nav, favicon-adjacent UI). wordmark = "MIRENNE" text alone (the
   * header's single-line center slot).
   */
  variant?: "full" | "horizontal" | "mark" | "wordmark";
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}

/**
 * Renders the Mirenne wordmark in Prata caps, generously letter-spaced —
 * the brand guidelines put the logo/wordmark in the primary serif, not the
 * secondary sans that the rest of the UI chrome uses.
 */
function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-serif uppercase tracking-[0.28em]", className)}>Mirenne</span>
  );
}

export function Logo({ variant = "full", className, markClassName, wordmarkClassName }: LogoProps) {
  if (variant === "mark") {
    return <LogoMark className={cn("h-10 w-auto", markClassName, className)} />;
  }

  if (variant === "wordmark") {
    return <Wordmark className={cn("text-xl sm:text-2xl", wordmarkClassName, className)} />;
  }

  if (variant === "horizontal") {
    return (
      <span className={cn("inline-flex items-center gap-3", className)}>
        <LogoMark className={cn("h-9 w-auto shrink-0", markClassName)} />
        <Wordmark className={cn("text-xl", wordmarkClassName)} />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex flex-col items-center gap-2", className)}>
      <LogoMark className={cn("h-12 w-auto", markClassName)} />
      <Wordmark className={cn("text-lg", wordmarkClassName)} />
    </span>
  );
}
