export interface FPLExplainStat {
  identifier: string;
  points: number;
  value: number;
}

export interface FPLExplain {
  fixture: number;
  stats: FPLExplainStat[];
}

export interface FPLGameweekPlayer {
  id: number;
  stats?: {
    goals_scored?: number;
    assists?: number;
    clean_sheets?: number;
  };
  explain?: FPLExplain[];
}

export interface GoalRow {
  fixture_id: number;
  player_id: number;
  minute: number | null;
  own_goal: boolean;
  penalty: boolean;
}

export interface AssistRow {
  fixture_id: number;
  player_id: number;
}

export interface CleanSheetRow {
  fixture_id: number;
  club_id: number;
}

export interface GameweekPerformanceResult {
  goals: GoalRow[];
  assists: AssistRow[];
  cleanSheets: CleanSheetRow[];
}

/**
 * Transforms FPL Gameweek Live data into the
 * format expected by the Pre-Beer database.
 *
 * This function does NOT write to Supabase.
 */
export function transformGameweekPerformance(
  players: FPLGameweekPlayer[],
  playerClubMap: Map<number, number>
): GameweekPerformanceResult {
  const goals: GoalRow[] = [];
  const assists: AssistRow[] = [];
  const cleanSheets: CleanSheetRow[] = [];

  for (const player of players) {
    const playerId = player.id;

    for (const explanation of player.explain ?? []) {
      const fixtureId = explanation.fixture;
      const stats = explanation.stats ?? [];

      const goalsScored =
        stats.find(
          (stat) => stat.identifier === "goals_scored"
        )?.value ?? 0;

      const assistsRecorded =
        stats.find(
          (stat) => stat.identifier === "assists"
        )?.value ?? 0;

      const cleanSheetsRecorded =
        stats.find(
          (stat) => stat.identifier === "clean_sheets"
        )?.value ?? 0;

      /*
       * -------------------------------------------------------
       * GOALS
       * -------------------------------------------------------
       *
       * FPL's goals_scored is the player's actual goals,
       * excluding own goals.
       *
       * One database row = one goal.
       */
      for (let i = 0; i < goalsScored; i++) {
        goals.push({
          fixture_id: fixtureId,
          player_id: playerId,
          minute: null,
          own_goal: false,
          penalty: false,
        });
      }

      /*
       * -------------------------------------------------------
       * ASSISTS
       * -------------------------------------------------------
       *
       * One database row = one assist.
       */
      for (let i = 0; i < assistsRecorded; i++) {
        assists.push({
          fixture_id: fixtureId,
          player_id: playerId,
        });
      }

      /*
       * -------------------------------------------------------
       * CLEAN SHEETS
       * -------------------------------------------------------
       *
       * One database row = one club/fixture.
       */
      if (cleanSheetsRecorded > 0) {
        const clubId = playerClubMap.get(playerId);

        if (clubId !== undefined) {
          const alreadyExists = cleanSheets.some(
            (row) =>
              row.fixture_id === fixtureId &&
              row.club_id === clubId
          );

          if (!alreadyExists) {
            cleanSheets.push({
              fixture_id: fixtureId,
              club_id: clubId,
            });
          }
        }
      }
    }
  }

  return {
    goals,
    assists,
    cleanSheets,
  };
}