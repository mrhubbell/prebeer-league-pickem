import { processGameweek } from "./processGameweek";

async function runTest() {
  const gameweekId = 1;

  console.log("");
  console.log("🍺 PRE-BEER COMPLETE GAMEWEEK PROCESS TEST");
  console.log("===========================================");
  console.log("");

  const result = await processGameweek(
    gameweekId,
    {
      dryRun: true,
    }
  );

  console.log("");
  console.log("PROCESS RESULT");
  console.log("--------------");
  console.log(JSON.stringify(result, null, 2));
  console.log("");

  if (!result.success) {
    throw new Error(
      "Gameweek process did not complete successfully."
    );
  }

  if (!result.dryRun) {
    throw new Error(
      "Expected the process to run in dry-run mode."
    );
  }

  if (result.scoring !== null) {
    throw new Error(
      "Scoring should not run during a dry run."
    );
  }

  console.log(
    "==========================================="
  );
  console.log(
    "✅ COMPLETE GAMEWEEK DRY RUN PASSED"
  );
  console.log(
    "✅ NO GAMEWEEK SCORING WAS PERFORMED"
  );
  console.log(
    "==========================================="
  );
  console.log("");
}

runTest().catch((error) => {
  console.error("");
  console.error(
    "❌ COMPLETE GAMEWEEK PROCESS TEST FAILED"
  );
  console.error(error);
  process.exit(1);
});