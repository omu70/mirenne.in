import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { DbNotice } from "@/components/admin/commerce/db-notice";
import { OrderManager } from "@/components/admin/commerce/order-manager";
import { isDatabaseConfigured } from "@/lib/server/db";
import { getOrder, getOrderEvents, getOrderItems } from "@/lib/server/orders";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  if (!isDatabaseConfigured()) return <DbNotice title="Order" />;
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();
  const [items, events] = await Promise.all([getOrderItems(id), getOrderEvents(id)]);

  return (
    <div>
      <Link href="/admin/orders" className="label-luxury mb-6 inline-flex items-center gap-2 text-graphite hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Orders
      </Link>
      <OrderManager order={order} items={items} events={events} />
    </div>
  );
}
