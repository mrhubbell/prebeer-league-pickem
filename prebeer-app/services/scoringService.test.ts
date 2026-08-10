import {
  calculateFixturePoints,
  calculateWeeklyPredictionBonus,
  getGoalPointsByPosition,
} from "./scoringService";

console.log("🍺 PRE-BEER LEAGUE SCORING TEST");
console.log("================================");

let passed = 0;
let failed = 0;

function test(
  description: string,
  actual: number,
  expected: number
) {
  if (actual === expected) {
    console.log(`✅ PASS: ${description} → ${actual}`);
    passed++;
  } else {
    console.error(
      `❌ FAIL: ${description} → expected ${expected}, got ${actual}`
    );
    failed++;
  }
}

/*
 * MATCH PREDICTIONS
 */

test(
  "Incorrect prediction",
  calculateFixturePoints(false, false, false),
  0
);

test(
  "Correct normal prediction",
  calculateFixturePoints(true, false, false),
  1
);

test(
  "Correct Featured Match prediction",
  calculateFixturePoints(true, true, false),
  2
);

test(
  "Correct Game of the Week prediction",
  calculateFixturePoints(true, false, true),
  3
);

test(
  "Incorrect Featured Match prediction",
  calculateFixturePoints(false, true, false),
  0
);

test(
  "Incorrect Game of the Week prediction",
  calculateFixturePoints(false, false, true),
  0
);

/*
 * WEEKLY PREDICTION BONUS
 */

test(
  "6 correct predictions",
  calculateWeeklyPredictionBonus(6),
  0
);

test(
  "7 correct predictions",
  calculateWeeklyPredictionBonus(7),
  2
);

test(
  "8 correct predictions",
  calculateWeeklyPredictionBonus(8),
  4
);

test(
  "9 correct predictions",
  calculateWeeklyPredictionBonus(9),
  7
);

test(
  "10 correct predictions",
  calculateWeeklyPredictionBonus(10),
  10
);

/*
 * GOALSCORER POINTS
 */

test(
  "Forward goal",
  getGoalPointsByPosition("FWD"),
  2
);

test(
  "Midfielder goal",
  getGoalPointsByPosition("MID"),
  4
);

test(
  "Defender goal",
  getGoalPointsByPosition("DEF"),
  12
);

console.log("");
console.log("================================");
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log("================================");

if (failed > 0) {
  process.exit(1);
}

console.log("🍻 ALL SCORING RULES PASSED!");