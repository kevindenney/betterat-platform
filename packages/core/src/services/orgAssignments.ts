import { supabase } from '../database';

export type DomainType = 'sailracing' | 'nursing' | 'drawing';

export interface OrgAssignmentSuggestion {
  id: string;
  domain: DomainType;
  orgName: string;
  title: string;
  dateLabel: string;
  metadata: string;
  templateText?: string;
  fields?: Record<string, string>;
}

type ClubMemberRow = {
  club_id?: string | null;
  yacht_club_id?: string | null;
  club?: { name?: string | null } | null;
  yacht_clubs?: { name?: string | null } | null;
};

type ClubEventRow = {
  id?: string;
  club_id?: string | null;
  title?: string | null;
  event_type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  location_name?: string | null;
  summary?: string | null;
  metadata?: Record<string, any> | null;
};

const SAMPLE_SUGGESTIONS: Record<DomainType, OrgAssignmentSuggestion[]> = {
  sailracing: [
    {
      id: 'sail-1',
      domain: 'sailracing',
      orgName: 'Royal Hong Kong Yacht Club',
      title: 'Friday Night Series · Race 5',
      dateLabel: 'Nov 22 · Warning 18:00',
      metadata: 'Course set: Harbour · VHF 72 · Dragons + Etchells',
      templateText:
        'Race: Friday Night Series - Race 5\nVenue: Royal Hong Kong Yacht Club (Harbour course)\nDate: November 22, 2025\nWarning signal: 18:00\nClasses: Dragon, Etchells\nVHF 72. Special: two rolling starts, mark changes likely after gate. ',
    },
    {
      id: 'sail-2',
      domain: 'sailracing',
      orgName: 'St. Francis Yacht Club',
      title: 'Winter Champagne Regatta',
      dateLabel: 'Dec 7 · First gun 11:00',
      metadata: 'F-leet + PHRF · Fillmore courses \u2022 Upload SI v2',
      templateText:
        'Race: Winter Champagne Regatta\nVenue: St. Francis Yacht Club (SF Bay)\nDate: December 7, 2025\nFirst gun: 11:00 local\nClasses: F-leet, PHRF\nNotes: tide max flood at 12:30, monitor gate flags.',
    },
  ],
  nursing: [
    {
      id: 'nur-1',
      domain: 'nursing',
      orgName: 'Mercy Baltimore Hospital',
      title: 'Telemetry Day Shift',
      dateLabel: 'Nov 18 · 07:00-19:00',
      metadata: 'South Tower L4 · educator on call 09:00',
      fields: {
        name: 'Telemetry Day Shift',
        unit: 'South Tower L4',
        time: '07:00 - 19:00',
      },
    },
    {
      id: 'nur-2',
      domain: 'nursing',
      orgName: 'Johns Hopkins School of Nursing',
      title: 'Simulation block · Respiratory',
      dateLabel: 'Nov 20 · 13:00-17:00',
      metadata: 'Lab C · Preceptor Dr. Lam · Team Bravo',
      fields: {
        name: 'Simulation Lab C - Respiratory',
        unit: 'Hopkins SON Lab C',
        time: '13:00 - 17:00',
      },
    },
  ],
  drawing: [
    {
      id: 'draw-1',
      domain: 'drawing',
      orgName: 'ArtCenter LA',
      title: 'Gesture Workshop',
      dateLabel: 'Nov 19 · 19:00-21:00',
      metadata: 'Instructor: Vega · bring charcoal + newsprint',
      templateText:
        'Session: Gesture Workshop\nLocation: ArtCenter LA Studio 4\nTime: 19:00-21:00\nMedium: Charcoal + newsprint\nFocus: 30s / 2min / 5min poses.',
    },
  ],
};

export async function fetchOrgAssignmentSuggestions(
  domain: DomainType,
  _userId?: string
): Promise<OrgAssignmentSuggestion[]> {
  if (!_userId) {
    return SAMPLE_SUGGESTIONS[domain];
  }

  try {
    if (domain === 'sailracing') {
      const dynamic = await fetchSailRacingSuggestions(_userId);
      if (dynamic.length) {
        return dynamic;
      }
    }

    if (domain === 'nursing') {
      const dynamic = await fetchNursingAffiliationSuggestions(_userId);
      if (dynamic.length) {
        return dynamic;
      }
    }

    if (domain === 'drawing') {
      const dynamic = await fetchDrawingAffiliationSuggestions(_userId);
      if (dynamic.length) {
        return dynamic;
      }
    }

    return SAMPLE_SUGGESTIONS[domain];
  } catch (error) {
    console.warn('[OrgAssignments] Falling back to sample suggestions:', error);
    return SAMPLE_SUGGESTIONS[domain];
  }
}

async function fetchSailRacingSuggestions(userId: string): Promise<OrgAssignmentSuggestion[]> {
  const { clubIds, clubNames } = await resolveUserClubs(userId);
  if (!clubIds.length) {
    return [];
  }

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('club_events')
    .select('id, club_id, title, event_type, start_date, end_date, location_name, summary, metadata')
    .in('club_id', clubIds)
    .gte('start_date', todayIso)
    .order('start_date', { ascending: true })
    .limit(12);

  if (error) {
    console.warn('[OrgAssignments] club_events query failed, falling back', error);
    throw error;
  }

  if (!data?.length) {
    return [];
  }

  return data.map((event) => buildSailSuggestion(event, clubNames));
}

async function resolveUserClubs(userId: string) {
  const clubNames = new Map<string, string>();
  const clubIds: string[] = [];

  const applyClubRows = (rows?: ClubMemberRow[] | null) => {
    rows?.forEach((row) => {
      const id = (row.club_id || row.yacht_club_id || undefined) ?? undefined;
      if (!id) return;
      clubIds.push(id);
      const clubName =
        row.club?.name ||
        row.yacht_clubs?.name ||
        'Yacht Club';
      if (!clubNames.has(id) && clubName) {
        clubNames.set(id, clubName);
      }
    });
  };

  // Primary membership table
  const { data: memberData, error: memberError } = await supabase
    .from('club_members')
    .select('club_id, yacht_club_id, club:clubs(name), yacht_clubs:club_id(name)')
    .eq('user_id', userId);

  if (memberData?.length) {
    applyClubRows(memberData as ClubMemberRow[]);
  } else if (memberError) {
    console.warn('[OrgAssignments] club_members query failed, trying legacy table', memberError);
  }

  if (!clubIds.length) {
    const { data: legacyData, error: legacyError } = await supabase
      .from('club_memberships')
      .select('yacht_club_id, club:yacht_clubs(name)')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    if (legacyData?.length) {
      applyClubRows(
        legacyData.map((row: any) => ({
          club_id: row.yacht_club_id,
          club: row.club,
          yacht_clubs: row.club,
        }))
      );
    } else if (legacyError) {
      console.warn('[OrgAssignments] club_memberships query failed', legacyError);
    }
  }

  return { clubIds: Array.from(new Set(clubIds)), clubNames };
}

function buildSailSuggestion(
  event: ClubEventRow,
  clubNames: Map<string, string>
): OrgAssignmentSuggestion {
  const clubId = event.club_id ?? undefined;
  const clubLabel = (clubId && clubNames.get(clubId)) || 'Club Event';
  const title = event.title ?? 'Upcoming Race';
  const dateLabel = formatDateLabel(event.start_date, event.end_date);
  const metadata = buildMetadataLine(event, clubLabel);

  return {
    id: event.id ?? `${clubId ?? 'event'}-${event.start_date ?? Date.now()}`,
    domain: 'sailracing',
    orgName: clubLabel,
    title,
    dateLabel,
    metadata,
    templateText: buildTemplateText(title, clubLabel, event),
  };
}

function formatDateLabel(start?: string | null, end?: string | null) {
  if (!start) {
    return 'Date TBD';
  }
  const startDate = new Date(start);
  const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
  const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
  const datePart = dateFormatter.format(startDate);
  const timePart = timeFormatter.format(startDate);
  if (!end) {
    return `${datePart} · ${timePart}`;
  }
  const endDate = new Date(end);
  const sameDay = startDate.toDateString() === endDate.toDateString();
  if (sameDay) {
    return `${datePart} · ${timePart}-${timeFormatter.format(endDate)}`;
  }
  return `${datePart} → ${dateFormatter.format(endDate)}`;
}

function buildMetadataLine(event: ClubEventRow, clubLabel: string) {
  const parts: string[] = [];
  if (event.location_name) {
    parts.push(event.location_name);
  } else if (clubLabel) {
    parts.push(clubLabel);
  }
  if (event.event_type) {
    parts.push(`Type: ${event.event_type}`);
  }
  if (event.summary) {
    parts.push(event.summary);
  }
  if (event.metadata?.vhf_channel) {
    parts.push(`VHF ${event.metadata.vhf_channel}`);
  }
  return parts.join(' · ') || 'Club schedule';
}

function buildTemplateText(title: string, clubLabel: string, event: ClubEventRow) {
  const lines = [
    `Race: ${title}`,
    `Organizing authority: ${clubLabel}`,
  ];

  if (event.location_name) {
    lines.push(`Venue: ${event.location_name}`);
  }

  if (event.start_date) {
    lines.push(`Date: ${new Date(event.start_date).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })}`);
  }

  if (event.metadata?.warning_signal) {
    lines.push(`Warning signal: ${event.metadata.warning_signal}`);
  }

  if (event.metadata?.vhf_channel) {
    lines.push(`VHF channel: ${event.metadata.vhf_channel}`);
  }

  if (event.metadata?.course_area) {
    lines.push(`Course area: ${event.metadata.course_area}`);
  }

  if (event.summary) {
    lines.push(`Notes: ${event.summary}`);
  }

  return lines.join('\n');
}

type NursingAffiliationRow = {
  id: string;
  name: string;
  location?: string | null;
  focus?: string | null;
  affiliation_type?: string | null;
};

type NursingAssignmentRow = {
  affiliation: NursingAffiliationRow | null;
  role?: string | null;
  status?: string | null;
};

type NursingRotationRow = {
  id: string;
  affiliation_id: string;
  title?: string | null;
  cohort?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  metadata?: Record<string, any> | null;
};

async function fetchNursingAffiliationSuggestions(userId: string) {
  const { data: assignments, error } = await supabase
    .from('nursing_affiliation_assignments')
    .select('role, status, affiliation:nursing_affiliations (id, name, location, focus, affiliation_type)')
    .eq('user_id', userId);

  if (error) {
    console.warn('[OrgAssignments] nursing assignments query failed', error);
    throw error;
  }

  const affRows = (assignments ?? []).filter((row) => row.affiliation) as unknown as NursingAssignmentRow[];
  const affiliationIds = Array.from(
    new Set(
      affRows
        .map((row) => row.affiliation?.id)
        .filter((id): id is string => Boolean(id))
    )
  );

  const todayIso = new Date().toISOString().slice(0, 10);
  const rotationMap = new Map<string, NursingRotationRow>();

  if (affiliationIds.length) {
    const { data: rotations, error: rotationsError } = await supabase
      .from('nursing_affiliation_rotations')
      .select('id, affiliation_id, title, cohort, start_date, end_date, metadata')
      .in('affiliation_id', affiliationIds)
      .gte('start_date', todayIso)
      .order('start_date', { ascending: true });

    if (rotationsError) {
      console.warn('[OrgAssignments] nursing rotations query failed', rotationsError);
    } else {
      rotations?.forEach((rotation) => {
        if (!rotationMap.has(rotation.affiliation_id)) {
          rotationMap.set(rotation.affiliation_id, rotation);
        }
      });
    }

    const suggestions = affRows
      .map((row) => row.affiliation && buildNursingSuggestion(row.affiliation, rotationMap.get(row.affiliation.id)))
      .filter((suggestion): suggestion is OrgAssignmentSuggestion => Boolean(suggestion));

    if (suggestions.length) {
      return suggestions;
    }
  }

  const { data: fallback } = await supabase
    .from('nursing_affiliations')
    .select('id, name, location, focus, affiliation_type')
    .order('name')
    .limit(3);

  if (fallback?.length) {
    return fallback
      .map((aff) => buildNursingSuggestion(aff, undefined))
      .filter((suggestion): suggestion is OrgAssignmentSuggestion => Boolean(suggestion));
  }

  return [];
}

function buildNursingSuggestion(
  affiliation: NursingAffiliationRow,
  rotation?: NursingRotationRow
): OrgAssignmentSuggestion | null {
  if (!affiliation.id) {
    return null;
  }

  const title = rotation?.title ?? `${affiliation.name} shift`;
  const dateLabel = formatDateLabel(rotation?.start_date, rotation?.end_date);
  const metadataParts = [affiliation.focus, rotation?.cohort].filter(Boolean).join(' · ');

  const templateLines = [
    `Site: ${affiliation.name}`,
    `Location: ${affiliation.location ?? 'TBD'}`,
    `Focus: ${affiliation.focus ?? 'Clinical placement'}`,
  ];

  if (rotation?.title) {
    templateLines.push(`Rotation: ${rotation.title}`);
  }
  if (rotation?.cohort) {
    templateLines.push(`Cohort: ${rotation.cohort}`);
  }
  if (rotation?.start_date) {
    templateLines.push(`Start: ${rotation.start_date}`);
  }

  return {
    id: rotation?.id ?? affiliation.id,
    domain: 'nursing',
    orgName: affiliation.name,
    title,
    dateLabel,
    metadata: metadataParts || affiliation.location || 'Clinical placement',
    templateText: templateLines.join('\n'),
    fields: {
      name: title,
      unit: rotation?.metadata?.unit ?? affiliation.focus ?? affiliation.location ?? '',
      time: '07:00 - 19:00',
    },
  };
}

type DrawingAffiliationRow = {
  id: string;
  name: string;
  location?: string | null;
  focus?: string | null;
  affiliation_type?: string | null;
};

type DrawingWorkshopRow = {
  id: string;
  affiliation_id: string;
  title?: string | null;
  medium?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  level?: string | null;
};

async function fetchDrawingAffiliationSuggestions(userId: string) {
  const { data: assignments, error } = await supabase
    .from('drawing_affiliation_assignments')
    .select('affiliation:drawing_affiliations (id, name, location, focus, affiliation_type)')
    .eq('user_id', userId);

  if (error) {
    console.warn('[OrgAssignments] drawing assignments query failed', error);
    throw error;
  }

  const affRows = (assignments ?? []).map((row: any) => row.affiliation).filter(Boolean) as DrawingAffiliationRow[];
  const affiliationIds = Array.from(new Set(affRows.map((aff) => aff.id))).filter(Boolean);

  const todayIso = new Date().toISOString().slice(0, 10);
  const workshopMap = new Map<string, DrawingWorkshopRow>();

  if (affiliationIds.length) {
    const { data: workshops, error: workshopError } = await supabase
      .from('drawing_affiliation_workshops')
      .select('id, affiliation_id, title, medium, start_date, end_date, level')
      .in('affiliation_id', affiliationIds)
      .gte('start_date', todayIso)
      .order('start_date', { ascending: true });

    if (workshopError) {
      console.warn('[OrgAssignments] drawing workshops query failed', workshopError);
    } else {
      workshops?.forEach((workshop) => {
        if (!workshopMap.has(workshop.affiliation_id)) {
          workshopMap.set(workshop.affiliation_id, workshop);
        }
      });
    }

    const suggestions = affRows
      .map((aff) => buildDrawingSuggestion(aff, workshopMap.get(aff.id)))
      .filter((suggestion): suggestion is OrgAssignmentSuggestion => Boolean(suggestion));

    if (suggestions.length) {
      return suggestions;
    }
  }

  const { data: fallback } = await supabase
    .from('drawing_affiliations')
    .select('id, name, location, focus, affiliation_type')
    .order('name')
    .limit(3);

  if (fallback?.length) {
    const mapped = fallback
      .map((aff) => buildDrawingSuggestion(aff, undefined))
      .filter((suggestion): suggestion is OrgAssignmentSuggestion => Boolean(suggestion));
    if (mapped.length) {
      return mapped;
    }
  }

  return [];
}

function buildDrawingSuggestion(
  affiliation: DrawingAffiliationRow,
  workshop?: DrawingWorkshopRow
): OrgAssignmentSuggestion | null {
  if (!affiliation.id) {
    return null;
  }

  const title = workshop?.title ?? `${affiliation.name} session`;
  const dateLabel = formatDateLabel(workshop?.start_date, workshop?.end_date);
  const metadataParts = [affiliation.focus, workshop?.medium, workshop?.level]
    .filter(Boolean)
    .join(' · ');

  const templateLines = [
    `Studio: ${affiliation.name}`,
    `Location: ${affiliation.location ?? 'TBD'}`,
    `Focus: ${affiliation.focus ?? 'Practice block'}`,
  ];

  if (workshop?.title) {
    templateLines.push(`Workshop: ${workshop.title}`);
  }
  if (workshop?.medium) {
    templateLines.push(`Medium: ${workshop.medium}`);
  }
  if (workshop?.level) {
    templateLines.push(`Level: ${workshop.level}`);
  }
  if (workshop?.start_date) {
    templateLines.push(`Date: ${workshop.start_date}`);
  }

  return {
    id: workshop?.id ?? affiliation.id,
    domain: 'drawing',
    orgName: affiliation.name,
    title,
    dateLabel,
    metadata: metadataParts || affiliation.location || 'Studio program',
    templateText: templateLines.join('\n'),
    fields: {
      name: title,
      unit: workshop?.medium ?? affiliation.focus ?? '',
      time: workshop?.start_date ?? '',
    },
  };
}
