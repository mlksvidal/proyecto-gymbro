-- ============================================================
-- GYMBRO — Initial Schema Migration
-- Sprint 24 — Backend Supabase
-- Apply via: Supabase MCP apply_migration OR Supabase Dashboard SQL editor
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- users: extends auth.users with app-specific profile
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  goal text,
  experience_level text,
  level int default 1,
  xp int default 0,
  avatar_kind text default 'mascot',
  avatar_value text default 'idle',
  units text default 'kg',
  default_rest_seconds int default 90,
  auto_start_timer boolean default true,
  days_per_week_goal int default 4,
  vibration_intensity text default 'medium',
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- routines: user-created routines (seed data stays local)
create table if not exists public.routines (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text,
  days_per_week int,
  difficulty text,
  estimated_minutes int,
  image_url text,
  days jsonb,
  is_seed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_routines_user on public.routines(user_id);

-- workouts: completed workout sessions
create table if not exists public.workouts (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  routine_id text,
  routine_name text,
  day_name text,
  started_at bigint not null,
  completed_at bigint,
  duration_minutes int,
  total_volume_kg numeric,
  sets_completed int,
  xp_earned int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_workouts_user_started on public.workouts(user_id, started_at desc);

-- sets: individual exercise sets within a workout
create table if not exists public.sets (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  workout_id text not null references public.workouts(id) on delete cascade,
  exercise_id text not null,
  exercise_name text,
  set_number int,
  reps int,
  weight_kg numeric,
  completed boolean default false,
  pr_flag boolean default false,
  completed_at bigint,
  created_at timestamptz default now()
);
create index if not exists idx_sets_workout on public.sets(workout_id);
create index if not exists idx_sets_user_exercise on public.sets(user_id, exercise_id);

-- prs: personal records per exercise
create table if not exists public.prs (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  exercise_id text not null,
  exercise_name text,
  weight_kg numeric not null,
  reps int not null,
  one_rm_estimated numeric,
  achieved_at bigint not null,
  workout_id text references public.workouts(id) on delete set null,
  created_at timestamptz default now()
);
create index if not exists idx_prs_user_exercise on public.prs(user_id, exercise_id);

-- achievement_records: unlocked achievements per user
create table if not exists public.achievement_records (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  achievement_id text not null,
  unlocked_at bigint not null,
  created_at timestamptz default now(),
  unique(user_id, achievement_id)
);
create index if not exists idx_achievements_user on public.achievement_records(user_id);

-- ============================================================
-- 2. UPDATED_AT TRIGGER FUNCTION
-- ============================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply trigger to tables with updated_at
create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger routines_updated_at
  before update on public.routines
  for each row execute function public.set_updated_at();

create trigger workouts_updated_at
  before update on public.workouts
  for each row execute function public.set_updated_at();

-- ============================================================
-- 3. AUTO-CREATE PUBLIC USER ON AUTH SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', 'Bro')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

-- users
alter table public.users enable row level security;

create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- routines
alter table public.routines enable row level security;

create policy "routines_select_own" on public.routines
  for select using (auth.uid() = user_id);

create policy "routines_insert_own" on public.routines
  for insert with check (auth.uid() = user_id);

create policy "routines_update_own" on public.routines
  for update using (auth.uid() = user_id);

create policy "routines_delete_own" on public.routines
  for delete using (auth.uid() = user_id);

-- workouts
alter table public.workouts enable row level security;

create policy "workouts_select_own" on public.workouts
  for select using (auth.uid() = user_id);

create policy "workouts_insert_own" on public.workouts
  for insert with check (auth.uid() = user_id);

create policy "workouts_update_own" on public.workouts
  for update using (auth.uid() = user_id);

create policy "workouts_delete_own" on public.workouts
  for delete using (auth.uid() = user_id);

-- sets
alter table public.sets enable row level security;

create policy "sets_select_own" on public.sets
  for select using (auth.uid() = user_id);

create policy "sets_insert_own" on public.sets
  for insert with check (auth.uid() = user_id);

create policy "sets_update_own" on public.sets
  for update using (auth.uid() = user_id);

create policy "sets_delete_own" on public.sets
  for delete using (auth.uid() = user_id);

-- prs
alter table public.prs enable row level security;

create policy "prs_select_own" on public.prs
  for select using (auth.uid() = user_id);

create policy "prs_insert_own" on public.prs
  for insert with check (auth.uid() = user_id);

create policy "prs_update_own" on public.prs
  for update using (auth.uid() = user_id);

create policy "prs_delete_own" on public.prs
  for delete using (auth.uid() = user_id);

-- achievement_records
alter table public.achievement_records enable row level security;

create policy "achievements_select_own" on public.achievement_records
  for select using (auth.uid() = user_id);

create policy "achievements_insert_own" on public.achievement_records
  for insert with check (auth.uid() = user_id);

create policy "achievements_delete_own" on public.achievement_records
  for delete using (auth.uid() = user_id);
