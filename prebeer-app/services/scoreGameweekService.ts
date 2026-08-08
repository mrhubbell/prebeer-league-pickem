import { scoreGoalScorerPicks }
from "@/services/gameweekScoring/goalScorerScoring";

import { scoreAssistPicks }
from "@/services/gameweekScoring/assistScoring";

import { scoreCleanSheetPicks }
from "@/services/gameweekScoring/cleanSheetScoring";

import { applyWeeklyPredictionBonus }
from "@/services/gameweekScoring/weeklyBonusScoring";

import { scoreMatchPredictions } from "@/services/gameweekScoring/matchPredictionScoring";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function scoreGameweek(matchweekId: number) {
  
  const {
  totals,
  correctPredictions,
} = await scoreMatchPredictions(matchweekId);
await scoreGoalScorerPicks(
  matchweekId,
  totals
);
await scoreAssistPicks(
  matchweekId,
  totals
);
await scoreCleanSheetPicks(
  matchweekId,
  totals
);

  applyWeeklyPredictionBonus(
  totals,
  correctPredictions
);

for (const memberId of Object.keys(totals)) {

  const id = Number(memberId);

  await supabaseAdmin
    .from("weekly_scores")
    .upsert(
      {
        member_id: id,
        matchweek_id: matchweekId,
        score: totals[id],
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