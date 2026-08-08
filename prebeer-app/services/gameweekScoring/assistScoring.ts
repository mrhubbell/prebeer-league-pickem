import { supabaseAdmin } from "@/lib/supabaseAdmin";

import {
  getAssistPicks,
  getAssistsForMatchweek,
} from "@/services/gameweekDataService";

export async function scoreAssistPicks(
  matchweekId: number,
  totals: Record<number, number>
) {

  const picks =
    await getAssistPicks(matchweekId);

  const assists =
    await getAssistsForMatchweek(matchweekId);

  for (const pick of picks) {

    const playerAssists =
      assists.filter(
        (assist: any) =>
          assist.player_id === pick.player_id
      ).length;

    const points =
      playerAssists * 2;

    await supabaseAdmin
      .from("assist_picks")
      .update({
        points_awarded: points,
      })
      .eq(
        "assist_pick_id",
        pick.assist_pick_id
      );

    totals[pick.member_id] =
      (totals[pick.member_id] ?? 0) +
      points;

  }

  return totals;

}