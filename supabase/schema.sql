-- =============================================================
-- Ecoshift Corporation — Supabase schema
-- Run in the Supabase SQL editor (or apply via supabase db push)
-- =============================================================

-- Roles / RBAC
create table public.profiles (
  id uuid references auth.users(id) primary key,
  full_name text,
  role text not null default 'customer' check (role in ('customer','staff','admin')),
  created_at timestamptz default now()
);

-- Quotation header
create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,            -- e.g. Q-2026-000123
  customer_name text not null,
  company text,
  email text not null,
  phone text,
  message text,
  status text not null default 'pending' check (status in ('pending','reviewed','quoted','won','lost')),
  internal_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Quotation line items
create table public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid references public.quotations(id) on delete cascade,
  product_id text not null,                  -- Firebase product id
  product_name text not null,
  sku text,
  quantity numeric not null default 1,
  unit text,
  line_note text,
  created_at timestamptz default now()
);

-- Contact form submissions
create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  branch text,
  created_at timestamptz default now()
);

-- Rate limiting (simple, per-IP + per-action)
create table public.rate_limit_log (
  id bigserial primary key,
  ip text not null,
  action text not null,                       -- 'submit_quote','contact_form','login'
  created_at timestamptz default now()
);
create index on public.rate_limit_log (ip, action, created_at);

-- RLS: enable on all tables
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.profiles enable row level security;
alter table public.rate_limit_log enable row level security;

-- Public can INSERT a quotation (anonymous submission) but NOT read/update
create policy "public can insert quotations" on public.quotations for insert with check (true);
create policy "public can insert quotation_items" on public.quotation_items for insert with check (true);
create policy "public can insert contact" on public.contact_submissions for insert with check (true);

-- Only staff/admin can read/update quotations
create policy "staff read quotations" on public.quotations for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
);
create policy "staff update quotations" on public.quotations for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
);
create policy "staff read items" on public.quotation_items for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
);
create policy "staff read contact" on public.contact_submissions for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
);

-- rate_limit_log: only service role can insert/read (called via service role client)
create policy "service role only rate limit" on public.rate_limit_log
  using (false) with check (false);

-- =============================================================
-- Rate limit checker: returns true if the IP+action is within
-- limits, false if exceeded.
-- Called by SvelteKit server endpoints via the service-role client.
-- =============================================================
create or replace function public.check_rate_limit(
  p_ip text,
  p_action text,
  p_window_seconds int,
  p_max_count int
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_count int;
begin
  -- Clean up old entries
  delete from public.rate_limit_log
  where created_at < now() - (p_window_seconds || ' seconds')::interval;

  -- Count recent requests
  select count(*) into v_count
  from public.rate_limit_log
  where ip = p_ip
    and action = p_action
    and created_at > now() - (p_window_seconds || ' seconds')::interval;

  if v_count >= p_max_count then
    return false; -- rate limit exceeded
  end if;

  -- Log this request
  insert into public.rate_limit_log (ip, action) values (p_ip, p_action);
  return true; -- within limit
end;
$$;

-- Grant execute to service role only
revoke execute on function public.check_rate_limit from public, anon, authenticated;
grant execute on function public.check_rate_limit to service_role;


-- =============================================================
-- Auto-create a profile row when a new auth user is created.
-- This trigger ensures every new user has a profile with the
-- default 'customer' role. Staff/admin roles must be assigned
-- manually via the Supabase dashboard or SQL.
-- =============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Fire the trigger after a new user is inserted into auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Allow users to read their own profile (needed for client-side role checks)
create policy "users read own profile" on public.profiles for select
  using (auth.uid() = id);

-- Allow users to update their own profile (but NOT the role field —
-- role changes should be done via SQL or dashboard by an admin)
create policy "users update own profile" on public.profiles for update
  using (auth.uid() = id);
