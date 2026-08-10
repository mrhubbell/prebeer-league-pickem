import { applyWeeklyPredictionBonus } from "./gameweekScoring/weeklyBonusScoring";

console.log("🍺 PRE-BEER LEAGUE WEEKLY BONUS TEST");
console.log("====================================");

const totals = {
  1: 10,
  2: 20,
  3: 30,
  4: 40,
  5: 50,
};

const correctPredictions = {
  1: 6,
  2: 7,
  3: 8,
  4: 9,
  5: 10,
};

applyWeeklyPredictionBonus(
  totals,
  correctPredictions
);

console.log(`Member 1: ${totals[1]} (expected 10)`);
console.log(`Member 2: ${totals[2]} (expected 22)`);
console.log(`Member 3: ${totals[3]} (expected 34)`);
console.log(`Member 4: ${totals[4]} (expected 47)`);
console.log(`Member 5: ${totals[5]} (expected 60)`);

const passed =
  totals[1] === 10 &&
  totals[2] === 22 &&
  totals[3] === 34 &&
  totals[4] === 47 &&
  totals[5] === 60;

console.log("");

if (passed) {
  console.log("🍻 WEEKLY BONUS TEST PASSED!");
} else {
  console.error("❌ WEEKLY BONUS TEST FAILED!");
  process.exit(1);
}