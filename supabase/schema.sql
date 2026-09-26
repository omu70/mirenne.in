-- Mirenne commerce schema. Run once in Supabase → SQL Editor (safe to re-run).
-- The site talks to this database only from server code (API routes and admin
-- pages) using DATABASE_URL, so Row Level Security is switched on with no
-- policies: Supabase's public REST API can read nothing, and only the server
-- connection string (which bypasses RLS as the table owner) can.

create extension if not exists pgcrypto;

create sequence if not exists order_number_seq start 1001;

create table if not exists customers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,            -- stored lower-cased
  name        text not null default '',
  phone       text not null default '',
  admin_note  text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists coupons (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,          -- stored upper-cased
  description   text not null default '',
  kind          text not null check (kind in ('percent', 'flat')),
  value         integer not null check (value > 0),
  min_subtotal  integer not null default 0 check (min_subtotal >= 0),
  max_uses      integer check (max_uses is null or max_uses > 0),
  used_count    integer not null default 0,
  starts_at     timestamptz,
  ends_at       timestamptz,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  check (kind <> 'percent' or value <= 90)
);

create table if not exists orders (
  id                   uuid primary key default gen_random_uuid(),
  number               text not null unique default ('MRN-' || nextval('order_number_seq')),
  public_token         text not null unique default encode(gen_random_bytes(16), 'hex'),
  customer_id          uuid references customers(id) on delete set null,

  customer_name        text not null,
  customer_email       text not null,
  customer_phone       text not null,
  ship_address         text not null,
  ship_city            text not null,
  ship_state           text not null,
  ship_pincode         text not null,
  delivery_note        text not null default '',
  gift_wrap            boolean not null default false,
  gift_message         text not null default '',

  subtotal             integer not null,
  discount             integer not null default 0,
  shipping             integer not null default 0,
  total                integer not null,
  coupon_code          text,

  status               text not null default 'pending_payment' check (status in
                         ('pending_payment','confirmed','in_production','shipped','delivered','cancelled','returned')),
  payment_status       text not null default 'unpaid' check (payment_status in
                         ('unpaid','paid','failed','refunded','partially_refunded')),
  razorpay_order_id    text unique,
  razorpay_payment_id  text,
  refunded_amount      integer not null default 0,

  courier              text not null default '',
  tracking_number      text not null default '',
  tracking_url         text not null default '',
  admin_note           text not null default '',

  created_at           timestamptz not null default now(),
  paid_at              timestamptz,
  shipped_at           timestamptz,
  delivered_at         timestamptz,
  updated_at           timestamptz not null default now()
);

create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_customer_idx on orders (customer_id);

create table if not exists order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references orders(id) on delete cascade,
  product_slug   text not null,
  product_name   text not null,
  color          text not null default '',
  size           text not null default '',
  customization  text not null default '',
  quantity       integer not null check (quantity > 0),
  unit_price     integer not null check (unit_price >= 0)
);
create index if not exists order_items_order_idx on order_items (order_id);

-- Timeline shown on the admin order page: payments, status changes, emails.
create table if not exists order_events (
  id          bigserial primary key,
  order_id    uuid not null references orders(id) on delete cascade,
  kind        text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists order_events_order_idx on order_events (order_id, created_at);

alter table customers    enable row level security;
alter table coupons      enable row level security;
alter table orders       enable row level security;
alter table order_items  enable row level security;
alter table order_events enable row level security;

-- The two codes the site shipped with, carried over so existing promotions keep
-- working. Edit or switch them off in Admin → Coupons.
insert into coupons (code, description, kind, value) values
  ('MIRENNE10', 'Launch code (carried over)', 'percent', 10),
  ('WELCOME15', 'Welcome code (carried over)', 'percent', 15)
on conflict (code) do nothing;
