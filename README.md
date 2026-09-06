This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Payments (Razorpay)

`/checkout` takes payment through Razorpay. Two route handlers do the work:

- `app/api/razorpay/order` recomputes the amount **server-side** from
  `lib/data/products.ts` and creates the Razorpay order. The browser sends only
  slug, colour, size and quantity — never a price — so the amount can't be
  tampered with from devtools.
- `app/api/razorpay/verify` checks the HMAC signature Razorpay returns. An
  order is only recorded after this passes.

### Setup

1. Razorpay dashboard → Settings → API Keys → Generate Test Key.
2. `cp .env.example .env.local` and fill in `RAZORPAY_KEY_ID` and
   `RAZORPAY_KEY_SECRET`.
3. Restart the dev server — Next reads env files only at startup.

Test cards are on Razorpay's docs; card `4111 1111 1111 1111` with any future
expiry and any CVV succeeds in test mode. Test-mode payments move no real money.

### Two limits worth knowing

**Only committed products can be bought.** A piece added in `/admin/products`
lives in one browser's local storage; the server has never seen it and rejects
it at checkout with a clear message. To make a piece purchasable, add it to
`lib/data/products.ts` and deploy.

**Orders are not persisted server-side.** A verified order is written to the
shopper's own browser storage and shows up in `/admin/orders` on that browser
only. If they close the tab mid-payment, the money moves and the shop has no
record. Before taking real money this needs a database and a Razorpay webhook
handler to reconcile against.
