import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { calculateFixturePoints } from "@/services/scoringService";

export async function scoreGameweek(matchweekId: number) {
  // Reset previously awarded points for this gameweek
  const { data: fixtureIds, error: fixtureIdError } = await supabaseAdmin
    .from("fixtures")
    .select("fixture_id")
    .eq("matchweek_id", matchweekId);

  if (fixtureIdError) throw fixtureIdError;

  const ids = (fixtureIds ?? []).map(f => f.fixture_id);

  if (ids.length === 0) {
    return { success: false, message: "No fixtures found." };
  }

  await supabaseAdmin
    .from("match_picks")
    .update({ points_awarded: 0 })
    .in("fixture_id", ids);

  const { data: fixtures, error: fixtureError } = await supabaseAdmin
    .from("fixtures")
    .select(`
      fixture_id,
      result,
      matchweeks!inner(
        featured_match_fixture_id,
        game_of_the_week_fixture_id
      )
    `)
    .eq("matchweek_id", matchweekId)
    .eq("finished", true);

  if (fixtureError) throw fixtureError;

  const { data: picks, error: pickError } = await supabaseAdmin
    .from("match_picks")
    .select(`
      pick_id,
      member_id,
      fixture_id,
      predicted_result
    `)
    .in("fixture_id", ids);

  if (pickError) throw pickError;

  const totals: Record<number, number> = {};

  for (const fixture of fixtures) {

    const featuredId =
      (fixture.matchweeks as any).featured_match_fixture_id;

    const gameOfWeekId =
      (fixture.matchweeks as any).game_of_the_week_fixture_id;

    const fixturePicks = picks.filter(
      p => p.fixture_id === fixture.fixture_id
    );

    for (const pick of fixturePicks) {

      const points = calculateFixturePoints(
        pick.predicted_result === fixture.result,
        fixture.fixture_id === featuredId,
        fixture.fixture_id === gameOfWeekId
      );

      await supabaseAdmin
        .from("match_picks")
        .update({
          points_awarded: points,
        })
        .eq("pick_id", pick.pick_id);

      totals[pick.member_id] =
        (totals[pick.member_id] ?? 0) + points;
    }
  }

  for (const memberId of Object.keys(totals)) {

    await supabaseAdmin
      .from("weekly_scores")
      .upsert(
        {
          member_id: Number(memberId),
          matchweek_id: matchweekId,
          score: totals[Number(memberId)],
        },
        {
          onConflict: "member_id,matchweek_id",
        }
      );
  }

  return {
    success: true,
    membersScored: Object.keys(totals).length,
  };
}