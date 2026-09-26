import { db } from "@/lib/server/db";
import type { CouponRow, CustomerRow, OrderRow, OrderStatus } from "@/lib/commerce/types";

/** Read-side queries for the admin screens. Money counts only captured payments, net of refunds. */

const PAID = ["paid", "partially_refunded", "refunded"];

export async function dashboardStats() {
  const sql = db();
  const [totals] = await sql<
    { revenue: number; month_revenue: number; month_orders: number; paid_orders: number; to_dispatch: number; abandoned: number }[]
  >`
    select
      coalesce(sum(total - refunded_amount) filter (where payment_status in ${sql(PAID)}), 0)::int as revenue,
      coalesce(sum(total - refunded_amount) filter (where payment_status in ${sql(PAID)}
        and paid_at >= date_trunc('month', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata'), 0)::int as month_revenue,
      count(*) filter (where payment_status in ${sql(PAID)}
        and paid_at >= date_trunc('month', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata')::int as month_orders,
      count(*) filter (where payment_status in ${sql(PAID)})::int as paid_orders,
      count(*) filter (where status in ('confirmed', 'in_production'))::int as to_dispatch,
      count(*) filter (where status = 'pending_payment' and created_at > now() - interval '7 days')::int as abandoned
    from orders`;
  const [{ customers }] = await sql<{ customers: number }[]>`select count(*)::int as customers from customers`;
  const recent = await sql<OrderRow[]>`
    select * from orders where status <> 'pending_payment' order by created_at desc limit 8`;
  const topProducts = await sql<{ product_name: string; units: number; revenue: number }[]>`
    select i.product_name, sum(i.quantity)::int as units, sum(i.quantity * i.unit_price)::int as revenue
    from order_items i join orders o on o.id = i.order_id
    where o.payment_status in ${sql(PAID)}
    group by i.product_name order by units desc limit 6`;
  return { ...totals, customers, recent, topProducts };
}

export type OrderFilter = "all" | "to_dispatch" | OrderStatus;

export async function listOrders(filter: OrderFilter, q: string, page: number) {
  const sql = db();
  const size = 50;
  const term = q.trim();
  const where = sql`
    where ${
      filter === "all"
        ? sql`status <> 'pending_payment'`
        : filter === "to_dispatch"
          ? sql`status in ('confirmed', 'in_production')`
          : sql`status = ${filter}`
    }
    ${
      term
        ? sql`and (number ilike ${"%" + term + "%"} or customer_name ilike ${"%" + term + "%"}
              or customer_email ilike ${"%" + term + "%"} or customer_phone ilike ${"%" + term + "%"}
              or tracking_number ilike ${"%" + term + "%"})`
        : sql``
    }`;
  const rows = await sql<(OrderRow & { item_count: number })[]>`
    select o.*, (select coalesce(sum(quantity), 0)::int from order_items i where i.order_id = o.id) as item_count
    from orders o ${where} order by created_at desc limit ${size} offset ${(page - 1) * size}`;
  const [{ count }] = await sql<{ count: number }[]>`select count(*)::int from orders ${where}`;
  const counts = await sql<{ status: OrderStatus; n: number }[]>`select status, count(*)::int as n from orders group by status`;
  return { rows, count, pages: Math.max(1, Math.ceil(count / size)), counts: Object.fromEntries(counts.map((c) => [c.status, c.n])) as Partial<Record<OrderStatus, number>> };
}

export type CustomerSummary = CustomerRow & { orders: number; spent: number; last_order: Date | null };

export async function listCustomers(q: string): Promise<CustomerSummary[]> {
  const sql = db();
  const term = q.trim();
  return sql<CustomerSummary[]>`
    select c.*,
      count(o.id) filter (where o.payment_status in ${sql(PAID)})::int as orders,
      coalesce(sum(o.total - o.refunded_amount) filter (where o.payment_status in ${sql(PAID)}), 0)::int as spent,
      max(o.created_at) as last_order
    from customers c left join orders o on o.customer_id = c.id
    ${term ? sql`where c.name ilike ${"%" + term + "%"} or c.email ilike ${"%" + term + "%"} or c.phone ilike ${"%" + term + "%"}` : sql``}
    group by c.id order by last_order desc nulls last limit 500`;
}

export async function getCustomer(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const sql = db();
  const [customer] = await sql<CustomerRow[]>`select * from customers where id = ${id}`;
  if (!customer) return null;
  const orders = await sql<OrderRow[]>`select * from orders where customer_id = ${id} order by created_at desc`;
  const [address] = await sql<Pick<OrderRow, "ship_address" | "ship_city" | "ship_state" | "ship_pincode">[]>`
    select ship_address, ship_city, ship_state, ship_pincode from orders where customer_id = ${id} order by created_at desc limit 1`;
  return { customer, orders, address: address ?? null };
}

export async function listCoupons(): Promise<CouponRow[]> {
  return db()<CouponRow[]>`select * from coupons order by active desc, created_at desc`;
}
