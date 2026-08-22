create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  avatar_url text,
  provider text default 'email',
  provider_id text,
  password_hash text,
  onboarding_completed boolean default false,
  subscription_tier text default 'free',
  last_login timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_module_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  module_name text not null,
  record_key text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.career_passports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  profile jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text,
  content jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  session_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  job_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.business_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  plan_data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  message_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.users enable row level security;
alter table public.user_module_data enable row level security;
alter table public.career_passports enable row level security;
alter table public.resumes enable row level security;
alter table public.interviews enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.business_plans enable row level security;
alter table public.chat_history enable row level security;

create policy if not exists users_self_access on public.users for all using (auth.uid() = id) with check (auth.uid() = id);
create policy if not exists module_data_self_access on public.user_module_data for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists passports_self_access on public.career_passports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists resumes_self_access on public.resumes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists interviews_self_access on public.interviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists saved_jobs_self_access on public.saved_jobs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists business_plans_self_access on public.business_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists chat_history_self_access on public.chat_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
