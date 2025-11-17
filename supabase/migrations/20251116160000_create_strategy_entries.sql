create table if not exists public.strategy_entries (
    id uuid primary key default gen_random_uuid(),
    domain text not null,
    entity_id text not null,
    phase text not null,
    plan jsonb,
    ai_suggestion jsonb,
    finalized boolean default false,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists strategy_entries_domain_entity_phase_idx
    on public.strategy_entries (domain, entity_id, phase);

create or replace function public.set_strategy_entries_timestamp()
returns trigger as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$ language plpgsql;

create trigger strategy_entries_set_timestamp
    before update on public.strategy_entries
    for each row
    execute function public.set_strategy_entries_timestamp();
