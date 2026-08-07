/*
==========================================

PRE-BEER LEAGUE PICK'EM
OFFICIAL SCORING RULES

------------------------------------------
Correct Match Prediction = 1
Featured Match = 2
Game of the Week = 3

Goalscorer Pick = 2 points per goal
Assist Pick = 2 points per assist
Clean Sheet Pick = 3 points

Weekly Prediction Bonus
7 Correct = +1
8 Correct = +3
9 Correct = +6
10 Correct = +10

==========================================
*/

export function calculateFixturePoints(
  isCorrect: boolean,
  isFeaturedMatch: boolean,
  isGameOfTheWeek: boolean
): number {
  if (!isCorrect) {
    return 0;
  }

  if (isGameOfTheWeek) {
    return 3;
  }

  if (isFeaturedMatch) {
    return 2;
  }

  return 1;
}

export function calculateWeeklyPredictionBonus(
  correctPredictions: number
): number {
  switch (correctPredictions) {
    case 10:
      return 10;

    case 9:
      return 6;

    case 8:
      return 3;

    case 7:
      return 1;

    default:
      return 0;
  }
}