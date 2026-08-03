"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import type { ShopFilters } from "@/lib/shop/filters";

interface MobileFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ShopFilters;
  onChange: (patch: Partial<ShopFilters>) => void;
  onClearAll: () => void;
  resultCount: number;
}

export function MobileFilterSheet({
  open,
  onOpenChange,
  filters,
  onChange,
  onClearAll,
  resultCount,
}: MobileFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[88vh] p-0">
        <SheetHeader>
          <SheetTitle>Filter</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          <FilterSidebar filters={filters} onChange={onChange} />
        </div>

        <div className="flex gap-3 border-t border-hairline px-6 py-5">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClearAll}>
            Clear All
          </Button>
          <Button variant="primary" size="md" className="flex-1" onClick={() => onOpenChange(false)}>
            Show {resultCount} {resultCount === 1 ? "Piece" : "Pieces"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
