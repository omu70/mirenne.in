/**
 * Order/coupon shapes shared by the admin UI, the storefront and the server.
 * Plain types and labels only — safe to import from client components.
 */

export type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "in_production"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded" | "partially_refunded";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Awaiting Payment",
  confirmed: "Confirmed",
  in_production: "In Production",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

/** Statuses an admin can move a paid order to by hand (shipping has its own form). */
export const MANUAL_STATUSES: OrderStatus[] = ["confirmed", "in_production", "delivered", "cancelled", "returned"];

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  partially_refunded: "Part Refunded",
};

export interface OrderItemRow {
  id: string;
  product_slug: string;
  product_name: string;
  color: string;
  size: string;
  customization: string;
  quantity: number;
  unit_price: number;
}

export interface OrderRow {
  id: string;
  number: string;
  public_token: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  ship_address: string;
  ship_city: string;
  ship_state: string;
  ship_pincode: string;
  delivery_note: string;
  gift_wrap: boolean;
  gift_message: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon_code: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  refunded_amount: number;
  courier: string;
  tracking_number: string;
  tracking_url: string;
  admin_note: string;
  created_at: Date;
  paid_at: Date | null;
  shipped_at: Date | null;
  delivered_at: Date | null;
  updated_at: Date;
}

export interface OrderEventRow {
  id: string;
  kind: string;
  message: string;
  created_at: Date;
}

export interface CouponRow {
  id: string;
  code: string;
  description: string;
  kind: "percent" | "flat";
  value: number;
  min_subtotal: number;
  max_uses: number | null;
  used_count: number;
  starts_at: Date | null;
  ends_at: Date | null;
  active: boolean;
  created_at: Date;
}

export interface CustomerRow {
  id: string;
  email: string;
  name: string;
  phone: string;
  admin_note: string;
  created_at: Date;
}
