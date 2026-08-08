import {
  calculateWeeklyPredictionBonus,
} from "@/services/scoringService";

export function applyWeeklyPredictionBonus(
  totals: Record<number, number>,
  correctPredictions: Record<number, number>
) {

  for (const memberId of Object.keys(totals)) {

    const id = Number(memberId);

    const weeklyBonus =
      calculateWeeklyPredictionBonus(
        correctPredictions[id] ?? 0
      );

    totals[id] =
      (totals[id] ?? 0) +
      weeklyBonus;

  }

  return totals;

}