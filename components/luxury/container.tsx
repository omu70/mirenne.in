import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto w-full max-w-[1680px] px-6 sm:px-10 lg:px-16 xl:px-20", className)} {...props}>
      {children}
    </div>
  );
}
