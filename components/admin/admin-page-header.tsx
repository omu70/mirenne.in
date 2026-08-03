import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({ title, description, action, className }: AdminPageHeaderProps) {
  return (
    <div className={cn("mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end", className)}>
      <div>
        <h1 className="font-serif text-3xl text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-sm leading-relaxed text-graphite">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
