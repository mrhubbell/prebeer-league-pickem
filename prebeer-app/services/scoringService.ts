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
7 Correct = +2
8 Correct = +4
9 Correct = +7
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
      return 7;

    case 8:
      return 4;

    case 7:
      return 2;

    default:
      return 0;
  }
}
export function getGoalPointsByPosition(
  position: string
): number {

  switch (position) {

    case "GK":
      return 6;

    case "DEF":
      return 5;

    case "MID":
      return 3;

    case "FWD":
    default:
      return 2;

  }

}