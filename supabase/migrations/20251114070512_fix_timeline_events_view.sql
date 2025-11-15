-- Ensure regatta location values are coerced to text when projecting timeline events
create or replace view public.timeline_events as
with regatta_events as (
  select
    r.id,
    'yachtracing'::text as domain_id,
    r.name as title,
    r.start_date as start_time,
    case
      when r.start_date > now() then 'upcoming'
      when coalesce(r.end_date, r.start_date) >= now() then 'active'
      else 'completed'
    end as status,
    nullif(
      coalesce(trim(both '"' from (r.location::text)), r.metadata->>'venue'),
      ''
    ) as location,
    coalesce(
      nullif(r.metadata->>'summary', ''),
      nullif(r.description, ''),
      concat_ws(
        ' • ',
        to_char(r.start_date, 'Mon DD'),
        to_char(r.start_date, 'HH24:MI'),
        nullif(
          coalesce(trim(both '"' from (r.location::text)), r.metadata->>'venue'),
          ''
        )
      )
    ) as summary
  from public.regattas r
  where r.start_date is not null
),
clinical_events as (
  select
    cs.id,
    coalesce(nullif(cs.domain_id, ''), 'nursing') as domain_id,
    cs.scenario_title as title,
    cs.scheduled_start as start_time,
    case
      when cs.scheduled_start > now() then 'upcoming'
      else 'active'
    end as status,
    nullif(cs.unit_name, '') as location,
    coalesce(nullif(cs.learning_focus, ''), nullif(cs.notes, '')) as summary
  from public.clinical_sessions cs
)
select * from regatta_events
union all
select * from clinical_events;

alter view public.timeline_events set (security_invoker = true);

grant select on public.timeline_events to anon, authenticated, service_role;
