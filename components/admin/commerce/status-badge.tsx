import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/commerce/types";

const ORDER_TONE: Record<OrderStatus, string> = {
  pending_payment: "border-hairline-dark text-graphite",
  confirmed: "border-gold bg-gold/10 text-gold-dark",
  in_production: "border-gold bg-gold/10 text-gold-dark",
  shipped: "border-ink bg-ink/5 text-ink",
  delivered: "border-ink bg-ink text-ivory",
  cancelled: "border-hairline-dark text-graphite line-through",
  returned: "border-hairline-dark text-graphite",
};

const PAYMENT_TONE: Record<PaymentStatus, string> = {
  unpaid: "text-graphite",
  paid: "text-ink",
  failed: "text-gold-dark",
  refunded: "text-graphite",
  partially_refunded: "text-gold-dark",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-block whitespace-nowrap border px-2 py-0.5 text-[11px]", ORDER_TONE[status])}>
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <span className={cn("whitespace-nowrap text-xs", PAYMENT_TONE[status])}>{PAYMENT_STATUS_LABEL[status]}</span>;
}
