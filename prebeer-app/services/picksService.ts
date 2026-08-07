import { getCurrentTime } from "@/lib/time";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getCurrentGameweekFixtures() {
  const { data: gameweek, error: gameweekError } = await supabaseAdmin
    .from("matchweeks")
    .select(`
      matchweek_id,
      week_number,
      featured_match_fixture_id,
      game_of_the_week_fixture_id
    `)
    .eq("status", "UPCOMING")
    .order("week_number")
    .limit(1)
    .single();

  if (gameweekError || !gameweek) {
    throw new Error("No open gameweek found.");
  }

  const { data: fixtures, error: fixtureError } = await supabaseAdmin
    .from("fixtures")
    .select(`
      fixture_id,
      kickoff_time,
      home_club_id,
      away_club_id,
      clubs!fixtures_home_club_id_fkey (
        club_name,
        badge_code
      ),
      away:clubs!fixtures_away_club_id_fkey (
        club_name,
        badge_code
      )
    `)
    .eq("matchweek_id", gameweek.matchweek_id)
    .order("kickoff_time");

  if (fixtureError) throw fixtureError;

  return {
    weekNumber: gameweek.week_number,
    matchweekId: gameweek.matchweek_id,
    featuredMatchFixtureId: gameweek.featured_match_fixture_id,
    gameOfTheWeekFixtureId: gameweek.game_of_the_week_fixture_id,
    fixtures,
  };
}

export async function saveMemberPicks(
  memberId: number,
  picks: {
    fixture_id: number;
    predicted_result: string;
  }[]
) {
  const fixtureIds = picks.map((p) => p.fixture_id);

  const { data: fixtures, error: fixtureError } = await supabaseAdmin
    .from("fixtures")
    .select("fixture_id, kickoff_time")
    .in("fixture_id", fixtureIds);

  if (fixtureError) throw fixtureError;

  const now = getCurrentTime();

  const unlockedFixtureIds = new Set(
    fixtures
      .filter((fixture) => new Date(fixture.kickoff_time) > now)
      .map((fixture) => fixture.fixture_id)
  );

  const rows = picks
    .filter((pick) => unlockedFixtureIds.has(pick.fixture_id))
    .map((pick) => ({
      member_id: memberId,
      fixture_id: pick.fixture_id,
      predicted_result: pick.predicted_result,
    }));

  if (rows.length > 0) {
    const { error } = await supabaseAdmin
      .from("match_picks")
      .upsert(rows, {
        onConflict: "member_id,fixture_id",
      });

    if (error) throw error;
  }

  return {
    success: true,
    saved: rows.length,
    locked: picks.length - rows.length,
  };
}

export async function getMemberPicks(memberId: number) {
  const { data, error } = await supabaseAdmin
    .from("match_picks")
    .select("fixture_id, predicted_result")
    .eq("member_id", memberId);

  if (error) throw error;

  const selections: Record<number, string> = {};

  data.forEach((pick) => {
    selections[pick.fixture_id] = pick.predicted_result;
  });

  return selections;
}

export async function saveFeaturedMatches(
  matchweekId: number,
  featuredMatchFixtureId: number | null,
  gameOfTheWeekFixtureId: number | null
) {
  const { error } = await supabaseAdmin
    .from("matchweeks")
    .update({
      featured_match_fixture_id: featuredMatchFixtureId,
      game_of_the_week_fixture_id: gameOfTheWeekFixtureId,
    })
    .eq("matchweek_id", matchweekId);

  if (error) throw error;

  return {
    success: true,
  };
}