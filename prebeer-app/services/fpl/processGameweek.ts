import { syncFixtures } from "./fixtures";
import { syncGameweekPerformance } from "./gameweekPerformanceSync";
import { scoreGameweek } from "../scoreGameweekService";

interface ProcessGameweekOptions {
  dryRun?: boolean;
}

export async function processGameweek(
  gameweekId: number,
  options: ProcessGameweekOptions = {}
) {
  const dryRun = options.dryRun ?? true;

  console.log("");
  console.log("🍺 PRE-BEER GAMEWEEK PROCESS");
  console.log("======================================");
  console.log(`Gameweek: ${gameweekId}`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log("");

  /*
   * -------------------------------------------------------
   * 1. SYNC FIXTURES
   * -------------------------------------------------------
   */

  console.log("📅 Step 1: Syncing fixtures...");

  const fixtureResult = await syncFixtures();

  console.log(
    `✅ Fixtures synced: ${fixtureResult.synced}`
  );
  console.log("");

  /*
   * -------------------------------------------------------
   * 2. SYNC GAMEWEEK PERFORMANCE
   * -------------------------------------------------------
   */

  console.log(
    "⚽ Step 2: Syncing Gameweek performance..."
  );

  const performanceResult =
    await syncGameweekPerformance(
      gameweekId,
      {
        dryRun,
      }
    );

  console.log(
    `Goals: ${performanceResult.goals}`
  );

  console.log(
    `Assists: ${performanceResult.assists}`
  );

  console.log(
    `Clean sheets: ${performanceResult.cleanSheets}`
  );

  console.log("");

  /*
   * -------------------------------------------------------
   * 3. SCORE GAMEWEEK
   * -------------------------------------------------------
   *
   * Never score while running in dry-run mode.
   */

  if (dryRun) {
    console.log(
      "🟡 DRY RUN — Gameweek scoring skipped."
    );

    console.log("");
    console.log(
      "======================================"
    );
    console.log(
      "✅ GAMEWEEK PROCESS DRY RUN COMPLETE"
    );
    console.log(
      "======================================"
    );

    return {
      success: true,
      gameweekId,
      dryRun: true,
      fixturesSynced: fixtureResult.synced,
      performance: performanceResult,
      scoring: null,
    };
  }

  console.log(
    "🏆 Step 3: Scoring Gameweek..."
  );

  const scoringResult =
    await scoreGameweek(gameweekId);

  console.log(
    `✅ Members scored: ${scoringResult.membersScored}`
  );

  console.log("");
  console.log(
    "======================================"
  );
  console.log(
    "🍺 GAMEWEEK PROCESS COMPLETE"
  );
  console.log(
    "======================================"
  );

  return {
    success: true,
    gameweekId,
    dryRun: false,
    fixturesSynced: fixtureResult.synced,
    performance: performanceResult,
    scoring: scoringResult,
  };
}