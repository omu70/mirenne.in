"use client";

import * as React from "react";
import { toast } from "sonner";
import { Trash2, RotateCcw, Eye } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrderStore, type Order, type OrderStatus } from "@/lib/store/order-store";
import { useMounted } from "@/lib/hooks/use-mounted";
import { formatINR, cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_TONE: Record<OrderStatus, string> = {
  pending: "text-graphite",
  processing: "text-gold-dark",
  shipped: "text-gold-dark",
  delivered: "text-ink",
  cancelled: "text-graphite line-through",
};

export default function AdminOrdersPage() {
  const mounted = useMounted();
  const orders = useOrderStore((s) => s.orders);
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus);
  const deleteOrder = useOrderStore((s) => s.deleteOrder);
  const resetToSeed = useOrderStore((s) => s.resetToSeed);

  const [viewing, setViewing] = React.useState<Order | undefined>(undefined);

  if (!mounted) return null;

  const sorted = [...orders].sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1));

  const handleDelete = (order: Order) => {
    if (window.confirm(`Delete order ${order.id}? This can't be undone.`)) {
      deleteOrder(order.id);
      toast.success(`${order.id} deleted.`);
    }
  };
  const handleReset = () => {
    if (window.confirm("Reset orders back to the sample data this site shipped with? Your changes will be lost.")) {
      resetToSeed();
      toast.success("Orders reset to sample data.");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description="Sample order data to review and move through statuses — there's no live checkout feeding this yet, so nothing here reflects real purchases."
        action={
          <button
            onClick={handleReset}
            className="label-luxury link-underline flex cursor-pointer items-center gap-2 text-graphite hover:text-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
            Reset To Sample Data
          </button>
        }
      />

      {sorted.length === 0 ? (
        <p className="py-16 text-center text-sm text-graphite">No orders.</p>
      ) : (
        <div className="overflow-x-auto border border-hairline">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-hairline bg-paper text-left">
                <th className="label-luxury px-4 py-3 font-normal text-graphite">Order</th>
                <th className="label-luxury px-4 py-3 font-normal text-graphite">Customer</th>
                <th className="label-luxury px-4 py-3 font-normal text-graphite">Date</th>
                <th className="label-luxury px-4 py-3 font-normal text-graphite">Total</th>
                <th className="label-luxury px-4 py-3 font-normal text-graphite">Payment</th>
                <th className="label-luxury px-4 py-3 font-normal text-graphite">Status</th>
                <th className="label-luxury px-4 py-3 font-normal text-graphite text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((order) => (
                <tr key={order.id} className="border-b border-hairline last:border-b-0 hover:bg-paper/60">
                  <td className="px-4 py-3 text-ink">{order.id}</td>
                  <td className="px-4 py-3 text-graphite">{order.customerName}</td>
                  <td className="px-4 py-3 text-graphite">{order.placedAt}</td>
                  <td className="px-4 py-3 text-ink">{formatINR(order.total)}</td>
                  <td className="px-4 py-3 text-graphite capitalize">{order.paymentStatus}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={order.status}
                      onValueChange={(v) => {
                        updateOrderStatus(order.id, v as OrderStatus);
                        toast.success(`${order.id} marked ${v}.`);
                      }}
                    >
                      <SelectTrigger className={cn("h-9 w-40 normal-case tracking-normal", STATUS_TONE[order.status])}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewing(order)}
                        aria-label={`View order ${order.id}`}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center text-graphite transition-colors hover:text-ink"
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.25} />
                      </button>
                      <button
                        onClick={() => handleDelete(order)}
                        aria-label={`Delete order ${order.id}`}
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

      <Sheet open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(undefined)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          {viewing && (
            <>
              <SheetHeader>
                <SheetTitle>{viewing.id}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <p className="label-luxury mb-1 text-graphite">Customer</p>
                <p className="mb-5 text-sm text-ink">
                  {viewing.customerName} · {viewing.customerEmail}
                  <br />
                  {viewing.city}
                </p>

                <p className="label-luxury mb-3 text-graphite">Items</p>
                <div className="mb-5 flex flex-col divide-y divide-hairline border-y border-hairline">
                  {viewing.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <div>
                        <p className="text-ink">{item.productName}</p>
                        <p className="text-xs text-graphite">
                          {item.color} · {item.size} · Qty {item.quantity}
                        </p>
                      </div>
                      <p className="shrink-0 text-ink">{formatINR(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-graphite">Subtotal</span>
                    <span className="text-ink">{formatINR(viewing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-graphite">Shipping</span>
                    <span className="text-ink">{viewing.shipping === 0 ? "Complimentary" : formatINR(viewing.shipping)}</span>
                  </div>
                  <div className="flex justify-between border-t border-hairline pt-2 text-base">
                    <span className="text-ink">Total</span>
                    <span className="font-serif text-ink">{formatINR(viewing.total)}</span>
                  </div>
                </div>

                {viewing.notes && (
                  <div className="mt-6 border-t border-hairline pt-5">
                    <p className="label-luxury mb-2 text-graphite">Notes</p>
                    <p className="text-sm leading-relaxed text-graphite">{viewing.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
