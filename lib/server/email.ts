import { formatINR } from "@/lib/utils";
import type { OrderItemRow, OrderRow } from "@/lib/commerce/types";

/**
 * Transactional email through Resend's HTTP API (no SDK needed). Every send is
 * best-effort: a mail outage must never fail a payment or an admin action, so
 * errors are logged and reported back, not thrown.
 *
 * Env: RESEND_API_KEY, EMAIL_FROM ("Mirenne <orders@mirenne.in>", on a domain
 * verified in Resend), ORDER_ALERT_EMAIL (where new-order alerts go),
 * NEXT_PUBLIC_SITE_URL (for links).
 */

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mirenne.in").replace(/\/$/, "");
}

export function orderStatusUrl(order: Pick<OrderRow, "number" | "public_token">): string {
  return `${siteUrl()}/checkout/success?order=${encodeURIComponent(order.number)}&t=${order.public_token}`;
}

async function send(to: string, subject: string, html: string, replyTo?: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return false;
  try {
    // RESEND_API_URL exists only so tests can point at a local mock; leave it unset.
    const res = await fetch(process.env.RESEND_API_URL ?? "https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) console.error("[email] resend failed", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("[email] resend error", e);
    return false;
  }
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f6f1ea;font-family:Georgia,'Times New Roman',serif;color:#3b2a1a">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1ea;padding:32px 12px"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf9;border:1px solid #e7dccd">
<tr><td style="padding:28px 32px 8px;text-align:center;letter-spacing:6px;font-size:20px;color:#763400">MIRENNE</td></tr>
<tr><td style="padding:8px 32px 0;text-align:center;font-size:24px;line-height:1.3">${title}</td></tr>
<tr><td style="padding:20px 32px 32px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#4a3b2c">${body}</td></tr>
</table></td></tr></table></body></html>`;
}

function itemsTable(order: OrderRow, items: OrderItemRow[]): string {
  const rows = items
    .map(
      (i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee4d6">${esc(i.product_name)}<br>
<span style="color:#8a7a68;font-size:12px">${esc([i.color, i.size, `Qty ${i.quantity}`].filter(Boolean).join(" · "))}${
        i.customization ? `<br>${esc(i.customization)}` : ""
      }</span></td><td style="padding:8px 0;border-bottom:1px solid #eee4d6;text-align:right;white-space:nowrap">${formatINR(
        i.unit_price * i.quantity
      )}</td></tr>`
    )
    .join("");
  const line = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:4px 0;${strong ? "font-weight:bold" : "color:#8a7a68"}">${label}</td><td style="padding:4px 0;text-align:right;${
      strong ? "font-weight:bold" : ""
    }">${value}</td></tr>`;
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0">${rows}
${line("Subtotal", formatINR(order.subtotal))}
${order.discount > 0 ? line(`Discount${order.coupon_code ? ` (${esc(order.coupon_code)})` : ""}`, `−${formatINR(order.discount)}`) : ""}
${line("Shipping", order.shipping === 0 ? "Complimentary" : formatINR(order.shipping))}
${line("Total paid", formatINR(order.total), true)}</table>`;
}

function address(order: OrderRow): string {
  return esc(`${order.customer_name}\n${order.ship_address}\n${order.ship_city}, ${order.ship_state} ${order.ship_pincode}\n${order.customer_phone}`).replace(/\n/g, "<br>");
}

function button(href: string, label: string): string {
  return `<p style="text-align:center;margin:24px 0 8px"><a href="${href}" style="background:#763400;color:#fffdf9;text-decoration:none;padding:12px 24px;display:inline-block;letter-spacing:2px;font-size:12px">${label}</a></p>`;
}

export async function sendOrderConfirmation(order: OrderRow, items: OrderItemRow[]): Promise<boolean> {
  const body = `<p>Hi ${esc(order.customer_name.split(" ")[0] || order.customer_name)},</p>
<p>Thank you for your order <strong>${esc(order.number)}</strong>. Your payment has been received.</p>
<p>Every Mirenne piece is made to order — our karigars begin once your order is confirmed, and we'll write again with tracking as soon as it ships.</p>
${itemsTable(order, items)}
<p style="margin-bottom:4px;color:#8a7a68">Delivering to</p><p style="margin-top:0">${address(order)}</p>
${button(orderStatusUrl(order), "VIEW YOUR ORDER")}
<p style="color:#8a7a68;font-size:12px;text-align:center">Questions? Just reply to this email.</p>`;
  return send(order.customer_email, `Your Mirenne order ${order.number} is confirmed`, layout("Thank you — your order is in.", body), process.env.ORDER_ALERT_EMAIL);
}

export async function sendNewOrderAlert(order: OrderRow, items: OrderItemRow[]): Promise<boolean> {
  const to = process.env.ORDER_ALERT_EMAIL;
  if (!to) return false;
  const admin = `${siteUrl()}/admin/orders/${order.id}`;
  const body = `<p><strong>${esc(order.customer_name)}</strong> · ${esc(order.customer_email)} · ${esc(order.customer_phone)}</p>
${itemsTable(order, items)}
<p style="margin-bottom:4px;color:#8a7a68">Ship to</p><p style="margin-top:0">${address(order)}</p>
${order.gift_wrap ? "<p>🎁 Gift wrap requested.</p>" : ""}${order.gift_message ? `<p>Gift message: ${esc(order.gift_message)}</p>` : ""}
${order.delivery_note ? `<p>Delivery note: ${esc(order.delivery_note)}</p>` : ""}
${button(admin, "OPEN IN ADMIN")}`;
  return send(to, `New order ${order.number} — ${formatINR(order.total)}`, layout(`New order ${esc(order.number)}`, body));
}

export async function sendShippedEmail(order: OrderRow, items: OrderItemRow[]): Promise<boolean> {
  const tracking = order.tracking_url
    ? button(order.tracking_url, "TRACK YOUR PARCEL")
    : button(orderStatusUrl(order), "VIEW YOUR ORDER");
  const body = `<p>Hi ${esc(order.customer_name.split(" ")[0] || order.customer_name)},</p>
<p>Your order <strong>${esc(order.number)}</strong> is on its way.</p>
<p>${order.courier ? `Courier: <strong>${esc(order.courier)}</strong><br>` : ""}${
    order.tracking_number ? `Tracking number: <strong>${esc(order.tracking_number)}</strong>` : ""
  }</p>
${tracking}
${itemsTable(order, items)}
<p style="color:#8a7a68;font-size:12px;text-align:center">Questions? Just reply to this email.</p>`;
  return send(order.customer_email, `Your Mirenne order ${order.number} has shipped`, layout("Your order is on its way.", body), process.env.ORDER_ALERT_EMAIL);
}

export async function sendDeliveredEmail(order: OrderRow): Promise<boolean> {
  const body = `<p>Hi ${esc(order.customer_name.split(" ")[0] || order.customer_name)},</p>
<p>Your order <strong>${esc(order.number)}</strong> has been delivered. We hope it feels made for you — because it was.</p>
<p>If anything isn't quite right with the fit, reply to this email and we'll help.</p>`;
  return send(order.customer_email, `Your Mirenne order ${order.number} was delivered`, layout("Delivered.", body), process.env.ORDER_ALERT_EMAIL);
}

export async function sendCancelledEmail(order: OrderRow, refunded: boolean): Promise<boolean> {
  const body = `<p>Hi ${esc(order.customer_name.split(" ")[0] || order.customer_name)},</p>
<p>Your order <strong>${esc(order.number)}</strong> has been cancelled.${
    refunded ? ` A refund of <strong>${formatINR(order.refunded_amount || order.total)}</strong> has been issued to your original payment method; banks usually take 5–7 working days to show it.` : ""
  }</p>
<p>If you didn't expect this, reply to this email and we'll sort it out.</p>`;
  return send(order.customer_email, `Your Mirenne order ${order.number} was cancelled`, layout("Order cancelled.", body), process.env.ORDER_ALERT_EMAIL);
}
