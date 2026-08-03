"use client";

import * as React from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Search, RotateCcw, BadgeCheck } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CustomerForm } from "@/components/admin/customer-form";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCustomerStore, type Customer } from "@/lib/store/customer-store";
import { useMounted } from "@/lib/hooks/use-mounted";
import { formatINR } from "@/lib/utils";

export default function AdminCustomersPage() {
  const mounted = useMounted();
  const customers = useCustomerStore((s) => s.customers);
  const deleteCustomer = useCustomerStore((s) => s.deleteCustomer);
  const resetToSeed = useCustomerStore((s) => s.resetToSeed);

  const [query, setQuery] = React.useState("");
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Customer | undefined>(undefined);

  if (!mounted) return null;

  const filtered = customers.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
  });

  const openAdd = () => {
    setEditing(undefined);
    setSheetOpen(true);
  };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setSheetOpen(true);
  };
  const handleDelete = (c: Customer) => {
    if (window.confirm(`Remove ${c.name} from your customer list?`)) {
      deleteCustomer(c.id);
      toast.success(`${c.name} removed.`);
    }
  };
  const handleReset = () => {
    if (window.confirm("Reset customers back to the sample data this site shipped with? Your changes will be lost.")) {
      resetToSeed();
      toast.success("Customers reset to sample data.");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        description="A manageable customer list — there's no real accounts system behind this yet, so it isn't tied to live sign-ups."
        action={
          <Button variant="primary" size="md" onClick={openAdd}>
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Add Customer
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite" strokeWidth={1.25} />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customers..." className="pl-11" />
        </div>
        <button
          onClick={handleReset}
          className="label-luxury link-underline flex shrink-0 cursor-pointer items-center gap-2 text-graphite hover:text-ink"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
          Reset To Sample Data
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-graphite">No customers match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="overflow-x-auto border border-hairline">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-hairline bg-paper text-left">
                <th className="label-luxury px-4 py-3 font-normal text-graphite">Customer</th>
                <th className="label-luxury px-4 py-3 font-normal text-graphite">City</th>
                <th className="label-luxury px-4 py-3 font-normal text-graphite">Orders</th>
                <th className="label-luxury px-4 py-3 font-normal text-graphite">Total Spent</th>
                <th className="label-luxury px-4 py-3 font-normal text-graphite">Joined</th>
                <th className="label-luxury px-4 py-3 font-normal text-graphite text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-hairline last:border-b-0 hover:bg-paper/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="flex items-center gap-1.5 text-ink">
                          {c.name}
                          {c.vip && <BadgeCheck className="h-3.5 w-3.5 text-gold-dark" strokeWidth={1.5} />}
                        </p>
                        <p className="text-xs text-graphite">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-graphite">{c.city}</td>
                  <td className="px-4 py-3 text-graphite">{c.ordersCount}</td>
                  <td className="px-4 py-3 text-ink">{formatINR(c.totalSpent)}</td>
                  <td className="px-4 py-3 text-graphite">{c.joinedAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        aria-label={`Edit ${c.name}`}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center text-graphite transition-colors hover:text-ink"
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.25} />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        aria-label={`Delete ${c.name}`}
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
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit Customer" : "Add Customer"}</SheetTitle>
          </SheetHeader>
          <CustomerForm
            key={editing?.id ?? "new"}
            customer={editing}
            onSaved={() => setSheetOpen(false)}
            onCancel={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
