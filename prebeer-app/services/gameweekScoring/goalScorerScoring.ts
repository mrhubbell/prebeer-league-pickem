import {
  getGoalScorerPicks,
  getGoalsForMatchweek,
} from "@/services/gameweekDataService";

import {
  getGoalPointsByPosition,
} from "@/services/scoringService";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function scoreGoalScorerPicks(
  matchweekId: number,
  totals: Record<number, number>
) {

  const picks =
    await getGoalScorerPicks(matchweekId);

  const goals =
    await getGoalsForMatchweek(matchweekId);

  for (const pick of picks) {

    const playerGoals =
      goals.filter(
        (goal: any) =>
          goal.player_id === pick.player_id
      ).length;

    const position =
      (pick.players as any)?.position ?? "FWD";

    const points =
      playerGoals *
      getGoalPointsByPosition(position);

    await supabaseAdmin
      .from("goal_scorer_picks")
      .update({
        points_awarded: points,
      })
      .eq(
        "goal_pick_id",
        pick.goal_pick_id
      );

    totals[pick.member_id] =
      (totals[pick.member_id] ?? 0) +
      points;

  }

  return totals;

}