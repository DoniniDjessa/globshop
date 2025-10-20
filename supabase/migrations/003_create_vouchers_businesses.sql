-- Voucher plans
create table if not exists public.dd_voucher_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  max_businesses int not null check (max_businesses > 0),
  created_at timestamptz default now()
);

-- Vouchers
create table if not exists public.dd_vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  plan_id uuid references public.dd_voucher_plans(id) on delete set null,
  max_businesses int not null,
  expires_at timestamptz,
  used_by_user_id uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz default now(),
  status text generated always as (
    case when used_at is not null then 'used' else 'available' end
  ) stored
);

-- Businesses
create table if not exists public.dd_businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.dd_users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('salon_spa','boutique','supermarche','autre')),
  created_at timestamptz default now()
);

create index if not exists idx_dd_businesses_owner on public.dd_businesses(owner_id);

-- RLS enable (optional; tighten later)
alter table public.dd_voucher_plans enable row level security;
alter table public.dd_vouchers enable row level security;
alter table public.dd_businesses enable row level security;

-- Basic policies: super_admin can do anything (assumes role stored in dd_users)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='dd_voucher_plans' and policyname='plans_read_all') then
    create policy plans_read_all on public.dd_voucher_plans for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='dd_vouchers' and policyname='vouchers_read_all') then
    create policy vouchers_read_all on public.dd_vouchers for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='dd_businesses' and policyname='businesses_owner_select') then
    create policy businesses_owner_select on public.dd_businesses for select using (auth.uid() = owner_id);
  end if;
end $$;


