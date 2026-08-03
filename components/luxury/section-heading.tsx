import { cn } from "@/lib/utils";
import { Reveal } from "@/components/luxury/reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && <p className="label-luxury text-gold">{eyebrow}</p>}
      <h2
        className={cn(
          "font-serif text-4xl leading-[1.05] text-gold sm:text-5xl md:text-6xl",
          titleClassName
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn("max-w-xl text-gold", align === "center" && "mx-auto")}>
          {description}
        </p>
      )}
    </Reveal>
  );
}
