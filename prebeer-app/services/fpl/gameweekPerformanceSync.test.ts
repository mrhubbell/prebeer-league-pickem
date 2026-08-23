import { syncGameweekPerformance } from "./gameweekPerformanceSync";

async function runTest() {
  console.log("");
  console.log("🍺 PRE-BEER GAMEWEEK PERFORMANCE SYNC TEST");
  console.log("===========================================");
  console.log("");

  const result = await syncGameweekPerformance(1, {
    dryRun: true,
  });

  console.log("");
  console.log("SYNC RESULT");
  console.log("-----------");
  console.log(JSON.stringify(result, null, 2));
  console.log("");

  if (!result.dryRun) {
    throw new Error(
      "Expected the sync test to run in dry-run mode."
    );
  }

  console.log("===========================================");
  console.log("✅ SYNC DRY RUN TEST PASSED");
  console.log("✅ NO DATABASE CHANGES WERE MADE");
  console.log("===========================================");
  console.log("");
}

runTest().catch((error) => {
  console.error("");
  console.error("❌ GAMEWEEK PERFORMANCE SYNC TEST FAILED");
  console.error(error);
  process.exit(1);
});