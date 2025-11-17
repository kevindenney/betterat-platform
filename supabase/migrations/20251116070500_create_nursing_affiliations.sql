create extension if not exists "pgcrypto";

create table if not exists public.nursing_affiliations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    affiliation_type text not null check (affiliation_type in ('university', 'hospital')),
    location text,
    focus text,
    contact_email text,
    icon text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.nursing_affiliation_assignments (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    affiliation_id uuid references public.nursing_affiliations(id) on delete cascade,
    role text,
    status text not null default 'pending',
    started_on date,
    ended_on date,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(user_id, affiliation_id)
);

create table if not exists public.nursing_affiliation_rotations (
    id uuid primary key default gen_random_uuid(),
    affiliation_id uuid references public.nursing_affiliations(id) on delete cascade,
    title text not null,
    cohort text,
    start_date date,
    end_date date,
    capacity integer,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_nursing_affiliations_type on public.nursing_affiliations(affiliation_type);
create index if not exists idx_nursing_affiliation_assignments_user on public.nursing_affiliation_assignments(user_id);
create index if not exists idx_nursing_affiliation_rotations_dates on public.nursing_affiliation_rotations(start_date, end_date);

insert into public.nursing_affiliations (id, name, affiliation_type, location, focus, contact_email, icon)
values
    ('3f7c5394-6c3c-4ed0-8a0a-9d2a3d0d1f01', 'Johns Hopkins School of Nursing', 'university', 'Baltimore, MD · East Baltimore Campus', 'Simulation lab · graduate residency', 'placements@jhu.edu', '🏫'),
    ('0a3fca8a-5a0b-4628-9dd0-2d9db5d29c0b', 'Mercy Medical Center', 'hospital', 'Downtown Baltimore', 'Telemetry · Med/Surg · Women''s services', 'education@mdmercy.com', '🏥'),
    ('9b23986a-3b7d-4f65-a739-924a4ab0d7b9', 'MedStar Harbor Hospital', 'hospital', 'Baltimore Harbor · Cherry Hill', 'Emergency · Critical care · OR exposure', 'academics@medstar.net', '🏥')
on conflict (id) do update
set name = excluded.name,
    affiliation_type = excluded.affiliation_type,
    location = excluded.location,
    focus = excluded.focus,
    contact_email = excluded.contact_email,
    icon = excluded.icon,
    updated_at = now();

insert into public.nursing_affiliation_rotations (affiliation_id, title, cohort, start_date, end_date, capacity, metadata)
values
    ('3f7c5394-6c3c-4ed0-8a0a-9d2a3d0d1f01', 'Simulation Block · Respiratory', 'Team Bravo', '2025-11-20', '2025-11-20', 24, '{"type":"simulation"}'::jsonb),
    ('0a3fca8a-5a0b-4628-9dd0-2d9db5d29c0b', 'Telemetry Day Shift', 'Telemetry Residency', '2025-11-18', '2025-11-18', 12, '{"unit":"Telemetry"}'::jsonb),
    ('9b23986a-3b7d-4f65-a739-924a4ab0d7b9', 'ED Immersion', 'Critical Care', '2025-11-25', '2025-11-25', 10, '{"unit":"Emergency"}'::jsonb)
on conflict do nothing;
