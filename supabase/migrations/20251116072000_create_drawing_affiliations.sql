create extension if not exists "pgcrypto";

create table if not exists public.drawing_affiliations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    affiliation_type text not null check (affiliation_type in ('studio','school','guild')),
    location text,
    focus text,
    contact_email text,
    icon text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.drawing_affiliation_assignments (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    affiliation_id uuid references public.drawing_affiliations(id) on delete cascade,
    role text,
    status text not null default 'pending',
    joined_on date,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(user_id, affiliation_id)
);

create table if not exists public.drawing_affiliation_workshops (
    id uuid primary key default gen_random_uuid(),
    affiliation_id uuid references public.drawing_affiliations(id) on delete cascade,
    title text not null,
    medium text,
    start_date date,
    end_date date,
    capacity integer,
    level text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_drawing_affiliations_type on public.drawing_affiliations(affiliation_type);
create index if not exists idx_drawing_affiliation_assignments_user on public.drawing_affiliation_assignments(user_id);
create index if not exists idx_drawing_workshops_dates on public.drawing_affiliation_workshops(start_date, end_date);

insert into public.drawing_affiliations (id, name, affiliation_type, location, focus, contact_email, icon)
values
    ('a3b5fd74-1f0a-4b3b-b644-1f2876d84999', 'ArtCenter Los Angeles', 'school', 'Los Angeles · Downtown Studio District', 'Figure drawing · concept art · portfolio labs', 'studio@artcenterla.com', '🏛️'),
    ('6d7a7a5d-1ac2-4018-8ce9-4bfb7439855c', 'Society of Illustrators NYC', 'guild', 'New York · Upper East Side', 'Editorial illustration · critiques · juried shows', 'membership@societyillustrators.org', '🖋️'),
    ('43a09178-2515-4c8a-9f33-642f28db8103', 'Urban Sketchers Baltimore', 'studio', 'Baltimore · Rotating field sites', 'Plein air · ink · watercolor meetups', 'hello@uskbaltimore.org', '🖌️')
on conflict (id) do update
set name = excluded.name,
    affiliation_type = excluded.affiliation_type,
    location = excluded.location,
    focus = excluded.focus,
    contact_email = excluded.contact_email,
    icon = excluded.icon,
    updated_at = now();

insert into public.drawing_affiliation_workshops (affiliation_id, title, medium, start_date, end_date, capacity, level, metadata)
values
    ('a3b5fd74-1f0a-4b3b-b644-1f2876d84999', 'Gesture Marathon', 'Charcoal', '2025-11-19', '2025-11-19', 30, 'All levels', '{"cohort":"Evening"}'::jsonb),
    ('6d7a7a5d-1ac2-4018-8ce9-4bfb7439855c', 'Editorial Bootcamp Critique', 'Ink + Digital', '2025-11-22', '2025-11-22', 20, 'Intermediate', '{"juror":"S. Rivera"}'::jsonb),
    ('43a09178-2515-4c8a-9f33-642f28db8103', 'Harbor Plein Air Walk', 'Watercolor', '2025-11-23', '2025-11-23', 40, 'All levels', '{"meeting_point":"Fells Point"}'::jsonb)
on conflict do nothing;
