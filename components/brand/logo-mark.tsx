import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The Mirenne mark: an oval hand-mirror frame (the house takes its name from
 * the French "mirer," to reflect / admire oneself in the mirror) with an
 * ornate finial top and bottom, and a flowing, drapery "M" silhouette set
 * inside it. This is the house's actual brand artwork (supplied directly),
 * rendered as a transparent PNG so it drops onto any background — light or
 * dark — without a visible box around it, per the brand guideline's "no
 * border around the logo" rule.
 *
 * Uses a static import so Next.js can read the file's intrinsic dimensions
 * for layout/aspect-ratio purposes; actual rendered size is controlled by
 * `className` (e.g. `h-9 w-auto`), same as every call site already does.
 * Every current usage pairs this mark with the "Mirenne" text wordmark right
 * next to or below it, so the image is treated as decorative (`alt=""`) —
 * the adjacent text already carries the brand name for screen readers.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/mirenne-mark.png"
      alt=""
      width={272}
      height={426}
      className={cn("w-auto", className)}
    />
  );
}
