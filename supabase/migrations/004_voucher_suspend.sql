-- Add suspension flag to vouchers; expiration is not used
alter table public.dd_vouchers
  add column if not exists is_suspended boolean not null default false;

-- Optional: index for admin listing/filtering
create index if not exists idx_dd_vouchers_suspended on public.dd_vouchers(is_suspended);


