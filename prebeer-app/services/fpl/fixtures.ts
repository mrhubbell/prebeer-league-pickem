import { supabaseAdmin } from "@/lib/supabaseAdmin";

const FPL_API = "https://fantasy.premierleague.com/api";

export async function syncFixtures() {
  const response = await fetch(`${FPL_API}/fixtures/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to download fixtures.");
  }

  const data = await response.json();

  const fixtures = data.map((fixture: any) => ({
    fixture_id: fixture.id,
    season_id: 1,
    matchweek_id: fixture.event,
    kickoff_time: fixture.kickoff_time,
    home_club_id: fixture.team_h,
    away_club_id: fixture.team_a,
    home_score: fixture.team_h_score,
    away_score: fixture.team_a_score,
    started: fixture.started,
    finished:
      fixture.finished ||
      fixture.finished_provisional ||
      false,
    finished_provisional:
      fixture.finished_provisional ?? false,
    provisional:
      fixture.provisional ?? false,
  }));

  const { data: result, error } = await supabaseAdmin
    .from("fixtures")
    .upsert(fixtures, {
      onConflict: "fixture_id",
    })
    .select();

  if (error) {
    throw error;
  }

  return {
    synced: result?.length ?? 0,
  };
}