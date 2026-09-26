import { AdminPageHeader } from "@/components/admin/admin-page-header";

/** Shown in place of a data screen until DATABASE_URL is set. */
export function DbNotice({ title }: { title: string }) {
  return (
    <div>
      <AdminPageHeader title={title} />
      <div className="max-w-xl border border-hairline bg-paper p-6 text-sm leading-relaxed text-graphite">
        <p className="text-ink">The database isn&apos;t connected yet.</p>
        <p className="mt-2">
          Add <code className="text-ink">DATABASE_URL</code> (your Supabase connection string) to the site&apos;s environment
          variables and redeploy. Orders, customers and coupons will appear here as soon as it&apos;s connected.
        </p>
      </div>
    </div>
  );
}
