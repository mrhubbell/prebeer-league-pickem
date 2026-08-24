import { syncFixtures } from "./fixtures";
import { syncGameweekPerformance } from "./gameweekPerformanceSync";
import { scoreGameweek } from "../scoreGameweekService";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

  /*
   * -------------------------------------------------------
   * 4. CHECK GAMEWEEK COMPLETION
   * -------------------------------------------------------
   *
   * A gameweek is complete when every fixture has either:
   *
   *   finished === true
   *   OR
   *   finished_provisional === true
   *
   * This allows FPL's provisional completion state to count
   * as complete without waiting for the formal finished flag.
   */

  console.log(
    "🔒 Step 4: Checking Gameweek status..."
  );

  const {
    data: gameweekFixtures,
    error: fixtureStatusError,
  } = await supabaseAdmin
    .from("fixtures")
    .select(
      "fixture_id, finished, finished_provisional"
    )
    .eq(
      "matchweek_id",
      gameweekId
    );

  if (fixtureStatusError) {
    throw fixtureStatusError;
  }

  const fixtures =
    gameweekFixtures ?? [];

  const gameweekComplete =
    fixtures.length > 0 &&
    fixtures.every(
      (fixture) =>
        fixture.finished === true ||
        fixture.finished_provisional === true
    );

  if (gameweekComplete) {
    const {
      error: lockError,
    } = await supabaseAdmin
      .from("matchweeks")
      .update({
        status: "LOCKED",
      })
      .eq(
        "matchweek_id",
        gameweekId
      );

    if (lockError) {
      throw lockError;
    }

    console.log(
      `🔒 Gameweek ${gameweekId} is complete — LOCKED.`
    );

    /*
     * Open the next gameweek.
     *
     * Only the first UPCOMING gameweek is opened.
     */

    const {
      data: nextGameweek,
      error: nextGameweekError,
    } = await supabaseAdmin
      .from("matchweeks")
      .select(
        "matchweek_id, week_number"
      )
      .eq(
        "status",
        "UPCOMING"
      )
      .order(
        "week_number",
        {
          ascending: true,
        }
      )
      .limit(1)
      .maybeSingle();

    if (nextGameweekError) {
      throw nextGameweekError;
    }

    if (nextGameweek) {
      const {
        error: openError,
      } = await supabaseAdmin
        .from("matchweeks")
        .update({
          status: "OPEN",
        })
        .eq(
          "matchweek_id",
          nextGameweek.matchweek_id
        );

      if (openError) {
        throw openError;
      }

      console.log(
        `🔓 Gameweek ${nextGameweek.week_number} is now OPEN.`
      );
    }
  } else {
    console.log(
      `🟡 Gameweek ${gameweekId} is not complete — remains OPEN.`
    );
  }

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
    gameweekComplete,
  };
}