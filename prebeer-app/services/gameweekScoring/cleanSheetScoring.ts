import { supabaseAdmin } from "@/lib/supabaseAdmin";

import {
  getCleanSheetPicks,
} from "@/services/gameweekDataService";

export async function scoreCleanSheetPicks(
  matchweekId: number,
  totals: Record<number, number>
) {

  const picks =
    await getCleanSheetPicks(matchweekId);

  const { data: cleanSheets, error: cleanSheetError } =
  await supabaseAdmin
    .from("clean_sheets")
    .select("fixture_id, club_id");

if (cleanSheetError) throw cleanSheetError;

const fixtureIds =
  (cleanSheets ?? []).map(
    (cleanSheet) => cleanSheet.fixture_id
  );

let matchweekCleanSheets = cleanSheets ?? [];

if (fixtureIds.length > 0) {
  const { data: fixtures, error: fixtureError } =
    await supabaseAdmin
      .from("fixtures")
      .select("fixture_id, matchweek_id")
      .in("fixture_id", fixtureIds);

  if (fixtureError) throw fixtureError;

  const currentMatchweekFixtureIds = new Set(
    (fixtures ?? [])
      .filter(
        (fixture) =>
          fixture.matchweek_id === matchweekId
      )
      .map((fixture) => fixture.fixture_id)
  );

  matchweekCleanSheets =
    (cleanSheets ?? []).filter(
      (cleanSheet) =>
        currentMatchweekFixtureIds.has(
          cleanSheet.fixture_id
        )
    );
}

const cleanSheetClubs = new Set(
  matchweekCleanSheets.map(
    (cleanSheet) => cleanSheet.club_id
  )
);

  for (const pick of picks) {

    const keptCleanSheet =
  cleanSheetClubs.has(pick.club_id);

    const points =
      keptCleanSheet ? 3 : 0;

    await supabaseAdmin
      .from("clean_sheet_picks")
      .update({
        points_awarded: points,
      })
      .eq(
        "clean_sheet_pick_id",
        pick.clean_sheet_pick_id
      );

    totals[pick.member_id] =
      (totals[pick.member_id] ?? 0) +
      points;

  }

  return totals;

}