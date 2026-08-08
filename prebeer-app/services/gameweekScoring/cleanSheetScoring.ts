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

  const { data: cleanSheets, error } =
    await supabaseAdmin
      .from("clean_sheets")
      .select("club_id")
      .eq("matchweek_id", matchweekId);

  if (error) throw error;

  for (const pick of picks) {

    const keptCleanSheet =
      cleanSheets.some(
        (club: any) =>
          club.club_id === pick.club_id
      );

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