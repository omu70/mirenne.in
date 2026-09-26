# Mirenne — going live checklist

The store now saves every order, customer and coupon in a real database
(Supabase). Do these steps once. Takes about 30 minutes.

## 1. Database (Supabase) — 10 min

1. Sign up at supabase.com → **New project**. Region: **Mumbai (ap-south-1)**.
   Save the database password it asks you to set.
2. Open **SQL Editor** → New query → paste everything from `supabase/schema.sql`
   → **Run**. (Safe to run again later; it won't delete anything.)
3. Click **Connect** (top of the project) → **Transaction pooler** → copy the URI.
   Put your database password in place of `[YOUR-PASSWORD]`. This is `DATABASE_URL`.

## 2. Environment variables — 5 min

In your hosting dashboard (Vercel → Project → Settings → Environment Variables),
add these, then **redeploy**:

| Name | Value |
|---|---|
| `DATABASE_URL` | from step 1 |
| `ADMIN_PASSWORD` | a long password only you know |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay → Settings → API Keys (use **Live** keys when you launch) |
| `RAZORPAY_WEBHOOK_SECRET` | step 3 |
| `RESEND_API_KEY`, `EMAIL_FROM`, `ORDER_ALERT_EMAIL` | step 4 |
| `NEXT_PUBLIC_SITE_URL` | `https://mirenne.in` |

Copy the same into `.env.local` if you run the site on your laptop.

## 3. Razorpay webhook — 5 min

Razorpay → Settings → Webhooks → **Add New Webhook**
- URL: `https://mirenne.in/api/razorpay/webhook`
- Secret: make one up, and put the same value in `RAZORPAY_WEBHOOK_SECRET`
- Events: `payment.captured`, `payment.failed`, `refund.processed`

Without this, an order is still saved when the customer pays — but if they close
the tab in the few seconds after paying, it stays "Awaiting Payment" until you
check Razorpay. The webhook closes that gap.

## 4. Order emails (Resend) — 10 min

1. resend.com → **Domains** → add `mirenne.in` → add the DNS records it shows at
   your domain provider → wait for "Verified".
2. **API Keys** → create → that's `RESEND_API_KEY`.
3. `EMAIL_FROM` = `Mirenne <orders@mirenne.in>`, `ORDER_ALERT_EMAIL` = your inbox.

Emails sent automatically: order confirmation (customer), new-order alert (you),
shipped with tracking (customer), delivered and cancelled/refunded (customer,
when you tick "email the customer").

## 5. Test before launch

1. Use Razorpay **test** keys first. Place an order with coupon `MIRENNE10` and
   a Razorpay test card.
2. Check: the order is in **Admin → Orders**, the customer is in **Customers**, both
   emails arrived, and the **Dashboard** shows the revenue.
3. Open the order → add a test AWB → "Mark As Shipped" → check the shipping email.
4. Refund it from the order page → check it shows in Razorpay.
5. Switch to **Live** keys and redeploy.

## Day-to-day in the admin

- **Orders → To Dispatch**: paid orders waiting to be made or shipped.
- Open an order to: change status (In Production, Delivered…), add courier + AWB
  (emails the customer), refund (full or part, the money goes back through
  Razorpay), print a packing slip, WhatsApp the customer, and keep internal notes.
- **Orders → Unfinished Checkouts**: people who filled checkout but didn't pay —
  worth a follow-up.
- **Customers**: order history, lifetime spend and notes (measurements etc.).
- **Coupons**: create % or ₹ codes with a minimum bag, usage limit and dates.
- **Export CSV** on the Orders page for accounts/GST.

## Still not connected to the database

Products, homepage, menu and collections edited in admin still save only in your
own browser. To change a price or add a product for real, it has to be edited in
`lib/data/products.ts` and deployed. Moving these into the database is the next step.
