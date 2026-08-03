import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center flex-wrap gap-2", className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="label-luxury text-gold hover:text-gold-dark transition-colors text-[10px]"
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn("label-luxury text-[10px]", isLast ? "text-gold" : "text-gold")}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="h-3 w-3 text-gold/50" strokeWidth={1.5} />}
          </span>
        );
      })}
    </nav>
  );
}
