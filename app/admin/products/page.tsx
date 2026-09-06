"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Search, RotateCcw, ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductStore } from "@/lib/store/product-store";
import { collectionsToMap, useContentStore } from "@/lib/store/content-store";
import { useMounted } from "@/lib/hooks/use-mounted";
import { formatINR, isUnoptimizableSrc } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const mounted = useMounted();
  const products = useProductStore((s) => s.products);
  const deleteProduct = useProductStore((s) => s.deleteProduct);
  const resetToSeed = useProductStore((s) => s.resetToSeed);
  const collectionList = useContentStore((s) => s.collections);
  const collectionMap = collectionsToMap(collectionList);

  const [query, setQuery] = React.useState("");
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | undefined>(undefined);

  if (!mounted) return null;

  const filtered = products.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.collection?.includes(q) ?? false)
    );
  });

  const openAdd = () => {
    setEditing(undefined);
    setSheetOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setSheetOpen(true);
  };
  const handleDelete = (p: Product) => {
    if (window.confirm(`Remove "${p.name}" from the catalogue? This can't be undone.`)) {
      deleteProduct(p.id);
      toast.success(`${p.name} removed.`);
    }
  };
  const handleReset = () => {
    if (window.confirm("Reset the catalogue back to the 6 sample products this site shipped with? Your edits will be lost.")) {
      resetToSeed();
      toast.success("Catalogue reset to sample data.");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Add, edit, and remove the pieces shown across Shop, Home, and product pages."
        action={
          <Button variant="primary" size="md" onClick={openAdd}>
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Add Product
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite" strokeWidth={1.25} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="pl-11"
          />
        </div>
        <button
          onClick={handleReset}
          className="label-luxury link-underline flex shrink-0 cursor-pointer items-center gap-2 text-graphite hover:text-ink"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
          Reset To Sample Data
        </button>
      </div>

      {products.length === 0 && (
        <div className="mb-6 border border-hairline-dark bg-paper p-6 text-sm text-graphite">
          Your catalogue is empty — the storefront will show empty states everywhere until you add at least one
          product.
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-graphite">No products match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="overflow-x-auto border border-hairline">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-hairline bg-paper text-left">
                <th className="label-luxury px-4 py-3 font-normal text-graphite">Piece</th>
                <th className="label-luxury px-4 py-3 font-normal text-graphite">Collection</th>
                <th className="label-luxury px-4 py-3 font-normal text-graphite">Price</th>
                <th className="label-luxury px-4 py-3 font-normal text-graphite">Availability</th>
                <th className="label-luxury px-4 py-3 font-normal text-graphite">Rating</th>
                <th className="label-luxury px-4 py-3 font-normal text-graphite text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-hairline last:border-b-0 hover:bg-paper/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-10 shrink-0 overflow-hidden bg-paper">
                        {p.images[0] && (
                          <Image
                            src={p.images[0].src}
                            alt=""
                            unoptimized={isUnoptimizableSrc(p.images[0].src)}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-ink">{p.name}</p>
                        <p className="truncate text-xs text-graphite">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-graphite">
                    {p.collection ? (collectionMap[p.collection]?.name ?? p.collection) : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink">{formatINR(p.price)}</td>
                  <td className="px-4 py-3 text-graphite capitalize">{p.availability.replace(/-/g, " ")}</td>
                  <td className="px-4 py-3 text-graphite">{p.rating.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/product/${p.slug}`}
                        target="_blank"
                        aria-label={`View ${p.name} on the live site`}
                        className="flex h-8 w-8 items-center justify-center text-graphite transition-colors hover:text-ink"
                      >
                        <ExternalLink className="h-4 w-4" strokeWidth={1.25} />
                      </Link>
                      <button
                        onClick={() => openEdit(p)}
                        aria-label={`Edit ${p.name}`}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center text-graphite transition-colors hover:text-ink"
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.25} />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        aria-label={`Delete ${p.name}`}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center text-graphite transition-colors hover:text-gold-dark"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.25} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit Product" : "Add Product"}</SheetTitle>
          </SheetHeader>
          <ProductForm
            key={editing?.id ?? "new"}
            product={editing}
            onSaved={() => setSheetOpen(false)}
            onCancel={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
