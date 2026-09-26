import { connection } from "next/server";
import { DbNotice } from "@/components/admin/commerce/db-notice";
import { CouponManager } from "@/components/admin/commerce/coupon-manager";
import { isDatabaseConfigured } from "@/lib/server/db";
import { listCoupons } from "@/lib/server/admin-queries";

export default async function AdminCouponsPage() {
  await connection();
  if (!isDatabaseConfigured()) return <DbNotice title="Coupons" />;
  return <CouponManager coupons={await listCoupons()} />;
}
