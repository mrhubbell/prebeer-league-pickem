import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  calculateFixturePoints,
} from "@/services/scoringService";

export async function scoreMatchPredictions(
  matchweekId: number
) {
  const { data: fixtureIds, error: fixtureIdError } =
    await supabaseAdmin
      .from("fixtures")
      .select("fixture_id")
      .eq("matchweek_id", matchweekId);

  if (fixtureIdError) throw fixtureIdError;

  const ids = (fixtureIds ?? []).map(
    (f) => f.fixture_id
  );

  if (ids.length === 0) {
    return {
      totals: {},
      correctPredictions: {},
    };
  }

  await supabaseAdmin
    .from("match_picks")
    .update({
      points_awarded: 0,
    })
    .in("fixture_id", ids);

  const { data: fixtures, error: fixtureError } =
    await supabaseAdmin
      .from("fixtures")
      .select(`
        fixture_id,
        home_score,
        away_score,
        finished,
        matchweeks!fixtures_matchweek_id_fkey(
          featured_match_fixture_id,
          game_of_the_week_fixture_id
        )
      `)
      .eq("matchweek_id", matchweekId);

  if (fixtureError) throw fixtureError;

  const { data: picks, error: pickError } =
    await supabaseAdmin
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
  const correctPredictions: Record<number, number> = {};

  for (const fixture of fixtures) {

    // Do not score fixtures that have not finished.
    if (
      !fixture.finished ||
      fixture.home_score === null ||
      fixture.away_score === null
    ) {
      continue;
    }

    let result: string;

    if (fixture.home_score > fixture.away_score) {
      result = "HOME";
    } else if (fixture.away_score > fixture.home_score) {
      result = "AWAY";
    } else {
      result = "DRAW";
    }

    const featuredId =
      (fixture.matchweeks as any)
        .featured_match_fixture_id;

    const gameOfWeekId =
      (fixture.matchweeks as any)
        .game_of_the_week_fixture_id;

    const fixturePicks = picks.filter(
      (p) => p.fixture_id === fixture.fixture_id
    );

    for (const pick of fixturePicks) {

      const isCorrect =
        pick.predicted_result === result;

      const points =
        calculateFixturePoints(
          isCorrect,
          fixture.fixture_id === featuredId,
          fixture.fixture_id === gameOfWeekId
        );

      if (isCorrect) {
        correctPredictions[pick.member_id] =
          (correctPredictions[pick.member_id] ?? 0) + 1;
      }

      await supabaseAdmin
        .from("match_picks")
        .update({
          points_awarded: points,
        })
        .eq("pick_id", pick.pick_id);

      totals[pick.member_id] =
        (totals[pick.member_id] ?? 0) +
        points;
    }
  }

  return {
    totals,
    correctPredictions,
  };
}