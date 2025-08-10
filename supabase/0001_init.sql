create schema if not exists hr;

create type hr.user_role as enum ('HR','Manager','Employee');

create table if not exists hr.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists hr.departments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references hr.companies(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists hr.employees (
  id text primary key,
  company_id uuid not null references hr.companies(id) on delete cascade,
  department_id uuid references hr.departments(id) on delete set null,
  manager_id text references hr.employees(id) on delete set null,
  first_name text not null,
  last_name text not null,
  role_title text,
  tenure_years int default 0,
  created_at timestamptz default now()
);

create table if not exists hr.survey_responses (
  id bigserial primary key,
  company_id uuid not null references hr.companies(id) on delete cascade,
  employee_id text not null references hr.employees(id) on delete cascade,
  period_month date not null,
  wellbeing_score numeric(4,2) not null check (wellbeing_score between 0 and 10),
  created_at timestamptz default now(),
  unique (employee_id, period_month)
);

create table if not exists hr.evaluations (
  id bigserial primary key,
  company_id uuid not null references hr.companies(id) on delete cascade,
  employee_id text not null references hr.employees(id) on delete cascade,
  period_month date not null,
  performance_score numeric(5,2) not null check (performance_score between 0 and 100),
  okr_score numeric(5,2),
  created_at timestamptz default now(),
  unique (employee_id, period_month)
);

create table if not exists hr.company_events (
  id bigserial primary key,
  company_id uuid not null references hr.companies(id) on delete cascade,
  event_type text not null,
  event_date date not null,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists hr.timesheet_monthly (
  id bigserial primary key,
  company_id uuid not null references hr.companies(id) on delete cascade,
  employee_id text not null references hr.employees(id) on delete cascade,
  period_month date not null,
  hours_month numeric(6,2) not null,
  overtime_hours numeric(6,2) not null default 0,
  night_hours numeric(6,2) not null default 0,
  absences_days numeric(5,2) not null default 0,
  created_at timestamptz default now(),
  unique (employee_id, period_month)
);

create materialized view if not exists hr.mv_employee_latest as
select e.id, e.company_id, d.name as department_name, e.manager_id,
       e.first_name, e.last_name, e.role_title, e.tenure_years,
       coalesce(ev.performance_score, 75) as performance_score,
       coalesce(sr.wellbeing_score, 6.5) as wellbeing_score,
       coalesce(tm.hours_month, 160) as hours_month,
       coalesce(tm.overtime_hours, 8) as overtime_hours,
       coalesce(tm.night_hours, 0) as night_hours,
       coalesce(tm.absences_days, 1) as absences_days,
       0.25::numeric as turnover_risk
from hr.employees e
left join hr.departments d on d.id = e.department_id
left join lateral (select performance_score from hr.evaluations ev where ev.employee_id = e.id order by ev.period_month desc limit 1) ev on true
left join lateral (select wellbeing_score from hr.survey_responses sr where sr.employee_id = e.id order by sr.period_month desc limit 1) sr on true
left join lateral (select hours_month, overtime_hours, night_hours, absences_days from hr.timesheet_monthly tm where tm.employee_id = e.id order by tm.period_month desc limit 1) tm on true;

create or replace function public.hrmind_department_aggregates()
returns table(department text, count int, "avgRisk" numeric, "avgWellbeing" numeric, overtime numeric, absences numeric)
language sql security definer set search_path = public, hr, extensions
as $$
  select m.department_name as department,
         count(*)::int as count,
         round(avg(m.turnover_risk)::numeric, 2) as "avgRisk",
         round(avg(m.wellbeing_score)::numeric, 2) as "avgWellbeing",
         round(sum(m.overtime_hours)::numeric, 2) as overtime,
         round(sum(m.absences_days)::numeric, 2) as absences
  from hr.mv_employee_latest m
  group by m.department_name
  order by m.department_name;
$$;

create or replace function public.refresh_mv_employee_latest()
returns void language sql as $$
  refresh materialized view hr.mv_employee_latest;
$$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references hr.companies(id) on delete cascade,
  role hr.user_role not null default 'HR',
  employee_id text references hr.employees(id) on delete set null,
  created_at timestamptz default now()
);

alter table hr.companies enable row level security;
alter table hr.departments enable row level security;
alter table hr.employees enable row level security;
alter table hr.survey_responses enable row level security;
alter table hr.evaluations enable row level security;
alter table hr.company_events enable row level security;
alter table hr.timesheet_monthly enable row level security;
alter table public.profiles enable row level security;

create policy "company read companies" on hr.companies for select using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.company_id = id));
create policy "company read deps" on hr.departments for select using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.company_id = company_id));
create policy "company read employees" on hr.employees for select using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.company_id = company_id));
create policy "company read survey" on hr.survey_responses for select using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.company_id = company_id));
create policy "company read eval" on hr.evaluations for select using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.company_id = company_id));
create policy "company read events" on hr.company_events for select using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.company_id = company_id));
create policy "company read timesheet" on hr.timesheet_monthly for select using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.company_id = company_id));

create policy "company write employees HR" on hr.employees for insert with check (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.company_id = company_id and p.role = 'HR'));
create policy "company write timesheet HR" on hr.timesheet_monthly for insert with check (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.company_id = company_id and p.role = 'HR'));
create policy "company write eval HR" on hr.evaluations for insert with check (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.company_id = company_id and p.role = 'HR'));
create policy "company write survey HR" on hr.survey_responses for insert with check (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.company_id = company_id and p.role = 'HR'));
