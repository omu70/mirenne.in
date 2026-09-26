import Link from "next/link";
import { connection } from "next/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DbNotice } from "@/components/admin/commerce/db-notice";
import { SearchBox } from "@/components/admin/commerce/search-box";
import { fmtDate } from "@/components/admin/commerce/format";
import { isDatabaseConfigured } from "@/lib/server/db";
import { listCustomers } from "@/lib/server/admin-queries";
import { formatINR } from "@/lib/utils";

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await connection();
  if (!isDatabaseConfigured()) return <DbNotice title="Customers" />;
  const { q = "" } = await searchParams;
  const customers = await listCustomers(q);

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        description="Everyone who has completed a paid order, with their order history and lifetime spend."
      />
      <div className="mb-5">
        <SearchBox placeholder="Search name, email or phone" />
      </div>

      {customers.length === 0 ? (
        <p className="py-16 text-center text-sm text-graphite">
          {q ? `No customers match “${q}”.` : "No customers yet — they're added automatically when an order is paid."}
        </p>
      ) : (
        <div className="overflow-x-auto border border-hairline">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-hairline bg-paper text-left">
                {["Customer", "Phone", "Orders", "Spent", "Last Order", "Since"].map((h) => (
                  <th key={h} className="label-luxury px-4 py-3 font-normal text-graphite">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-hairline last:border-b-0 hover:bg-paper/60">
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${c.id}`} className="text-ink underline-offset-4 hover:underline">
                      {c.name || c.email}
                    </Link>
                    <p className="text-xs text-graphite">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-graphite">{c.phone}</td>
                  <td className="px-4 py-3 text-ink">{c.orders}</td>
                  <td className="px-4 py-3 text-ink">{formatINR(c.spent)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-graphite">{fmtDate(c.last_order, false)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-graphite">{fmtDate(c.created_at, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
