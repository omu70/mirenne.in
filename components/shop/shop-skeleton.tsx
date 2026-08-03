import { Skeleton } from "@/components/ui/skeleton";

/** Static Suspense fallback shown while ShopBrowser reads useSearchParams() on first paint. */
export function ShopSkeleton() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between border-b border-hairline pb-6 md:mb-10 md:pb-8">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-11 w-40" />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr] lg:gap-12 xl:grid-cols-[280px_1fr]">
        <div className="hidden lg:flex lg:flex-col lg:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-14 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="mt-4 h-4 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
