import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getGameweekLive } from "../fplApi";
import {
  transformGameweekPerformance,
  FPLGameweekPlayer,
} from "./gameweekPerformance";

interface SyncOptions {
  dryRun?: boolean;
}

interface SyncResult {
  gameweekId: number;
  fixturesProcessed: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  deletedGoals: number;
  deletedAssists: number;
  deletedCleanSheets: number;
  dryRun: boolean;
}

export async function syncGameweekPerformance(
  gameweekId: number,
  options: SyncOptions = {}
): Promise<SyncResult> {
  const dryRun = options.dryRun ?? true;

  console.log("");
  console.log("🍺 PRE-BEER GAMEWEEK PERFORMANCE SYNC");
  console.log("======================================");
  console.log(`Gameweek: ${gameweekId}`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log("");

  // 1. Get FPL Gameweek Live data
  const fplData = await getGameweekLive(gameweekId);

  const players =
    (fplData.elements ?? []) as FPLGameweekPlayer[];

  if (players.length === 0) {
    console.log(
      "ℹ️ FPL returned no player performance data."
    );

    return {
      gameweekId,
      fixturesProcessed: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      deletedGoals: 0,
      deletedAssists: 0,
      deletedCleanSheets: 0,
      dryRun,
    };
  }

  // 2. Get player → club mapping
  const { data: playerRows, error: playerError } =
    await supabaseAdmin
      .from("players")
      .select("player_id, club_id");

  if (playerError) {
    throw playerError;
  }

  const playerClubMap = new Map<number, number>();

  for (const player of playerRows ?? []) {
    playerClubMap.set(
      player.player_id,
      player.club_id
    );
  }

  // 3. Transform FPL data
  const transformed =
    transformGameweekPerformance(
      players,
      playerClubMap
    );

  // 4. Get completed fixtures for this Gameweek
  const {
    data: fixtures,
    error: fixtureError,
  } = await supabaseAdmin
    .from("fixtures")
.select(
  "fixture_id, finished, finished_provisional"
)
.eq("matchweek_id", gameweekId);

  if (fixtureError) {
    throw fixtureError;
  }

  const finishedFixtureIds = new Set(
  (fixtures ?? [])
    .filter(
      (fixture) =>
        fixture.finished ||
        fixture.finished_provisional
    )
    .map(
      (fixture) => fixture.fixture_id
    )
);

  // Only keep results belonging to completed fixtures
  const goals = transformed.goals.filter(
    (goal) =>
      finishedFixtureIds.has(goal.fixture_id)
  );

  const assists = transformed.assists.filter(
    (assist) =>
      finishedFixtureIds.has(
        assist.fixture_id
      )
  );

  const cleanSheets =
    transformed.cleanSheets.filter(
      (cleanSheet) =>
        finishedFixtureIds.has(
          cleanSheet.fixture_id
        )
    );

  console.log(
    `Finished fixtures: ${finishedFixtureIds.size}`
  );

  console.log(
    `Goals to write: ${goals.length}`
  );

  console.log(
    `Assists to write: ${assists.length}`
  );

  console.log(
    `Clean sheets to write: ${cleanSheets.length}`
  );

  console.log("");

  // 5. Dry run — do NOT touch Supabase
  if (dryRun) {
    console.log(
      "🟡 DRY RUN — NO DATABASE CHANGES MADE"
    );
    console.log("");

    return {
      gameweekId,
      fixturesProcessed:
        finishedFixtureIds.size,
      goals: goals.length,
      assists: assists.length,
      cleanSheets: cleanSheets.length,
      deletedGoals: 0,
      deletedAssists: 0,
      deletedCleanSheets: 0,
      dryRun: true,
    };
  }

  // 6. Delete existing results for completed fixtures
  const fixtureIds =
    Array.from(finishedFixtureIds);

  let deletedGoals = 0;
  let deletedAssists = 0;
  let deletedCleanSheets = 0;

  if (fixtureIds.length > 0) {
    const {
      data: existingGoals,
      error: existingGoalsError,
    } = await supabaseAdmin
      .from("goals")
      .select("goal_id")
      .in("fixture_id", fixtureIds);

    if (existingGoalsError) {
      throw existingGoalsError;
    }

    const {
      data: existingAssists,
      error: existingAssistsError,
    } = await supabaseAdmin
      .from("assists")
      .select("assist_id")
      .in("fixture_id", fixtureIds);

    if (existingAssistsError) {
      throw existingAssistsError;
    }

    const {
      data: existingCleanSheets,
      error: existingCleanSheetsError,
    } = await supabaseAdmin
      .from("clean_sheets")
      .select("clean_sheet_id")
      .in("fixture_id", fixtureIds);

    if (existingCleanSheetsError) {
      throw existingCleanSheetsError;
    }

    deletedGoals =
      existingGoals?.length ?? 0;

    deletedAssists =
      existingAssists?.length ?? 0;

    deletedCleanSheets =
      existingCleanSheets?.length ?? 0;

    const { error: deleteGoalsError } =
      await supabaseAdmin
        .from("goals")
        .delete()
        .in("fixture_id", fixtureIds);

    if (deleteGoalsError) {
      throw deleteGoalsError;
    }

    const { error: deleteAssistsError } =
      await supabaseAdmin
        .from("assists")
        .delete()
        .in("fixture_id", fixtureIds);

    if (deleteAssistsError) {
      throw deleteAssistsError;
    }

    const {
      error: deleteCleanSheetsError,
    } = await supabaseAdmin
      .from("clean_sheets")
      .delete()
      .in("fixture_id", fixtureIds);

    if (deleteCleanSheetsError) {
      throw deleteCleanSheetsError;
    }
  }

  // 7. Insert fresh results
  if (goals.length > 0) {
    const { error } = await supabaseAdmin
      .from("goals")
      .insert(goals);

    if (error) {
      throw error;
    }
  }

  if (assists.length > 0) {
    const { error } = await supabaseAdmin
      .from("assists")
      .insert(assists);

    if (error) {
      throw error;
    }
  }

  if (cleanSheets.length > 0) {
    const { error } = await supabaseAdmin
      .from("clean_sheets")
      .insert(cleanSheets);

    if (error) {
      throw error;
    }
  }

  console.log("");
  console.log("======================================");
  console.log("✅ GAMEWEEK PERFORMANCE SYNC COMPLETE");
  console.log("======================================");
  console.log("");

  return {
    gameweekId,
    fixturesProcessed:
      finishedFixtureIds.size,
    goals: goals.length,
    assists: assists.length,
    cleanSheets: cleanSheets.length,
    deletedGoals,
    deletedAssists,
    deletedCleanSheets,
    dryRun: false,
  };
}