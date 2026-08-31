import {
  getGoalPointsByPosition,
  calculateWeeklyPredictionBonus,
} from "@/services/scoringService";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface Standing {
  member_id: number;
  first_name: string;
  last_name: string;
  team_name: string;
  season_points: number;
  rank_change: number;
  match_prediction_accuracy: number;
  goalscorer_accuracy: number;
  assist_accuracy: number;
  clean_sheet_accuracy: number;
}

export async function getSeasonStandings() {
  const { data, error } = await supabaseAdmin
    .from("weekly_scores")
    .select(`
      member_id,
      matchweek_id,
      score,
      members!weekly_scores_member_id_fkey (
        first_name,
        last_name,
        team_name
      )
    `);

  if (error) throw error;

  const rows = data ?? [];

  if (rows.length === 0) {
    return [];
  }

    /*
   * ---------------------------------------------------------
   * GET SEASON PERFORMANCE DATA
   * ---------------------------------------------------------
   */

  const [
    matchPicksResult,
    goalPicksResult,
    assistPicksResult,
    cleanSheetPicksResult,
    fixturesResult,
    goalsResult,
    assistsResult,
    cleanSheetsResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("match_picks")
      .select(`
        member_id,
        fixture_id,
        predicted_result
      `),

    supabaseAdmin
      .from("goal_scorer_picks")
      .select(`
        member_id,
        player_id,
        matchweek_id
      `),

    supabaseAdmin
      .from("assists_picks")
      .select(`
        member_id,
        player_id,
        matchweek_id
      `),

    supabaseAdmin
      .from("clean_sheet_picks")
      .select(`
        member_id,
        club_id,
        matchweek_id
      `),

    supabaseAdmin
  .from("fixtures")
  .select(`
    fixture_id,
    matchweek_id,
    home_score,
    away_score,
    finished,
    finished_provisional
  `),

    supabaseAdmin
      .from("goals")
      .select(`
        player_id,
        fixture_id,
        own_goal
      `),

    supabaseAdmin
      .from("assists")
      .select(`
        player_id,
        fixture_id
      `),

    supabaseAdmin
      .from("clean_sheets")
      .select(`
        club_id,
        fixture_id
      `),
  ]);

  if (matchPicksResult.error) throw matchPicksResult.error;
  if (goalPicksResult.error) throw goalPicksResult.error;
  if (assistPicksResult.error) throw assistPicksResult.error;
  if (cleanSheetPicksResult.error) {
    throw cleanSheetPicksResult.error;
  }
  if (fixturesResult.error) throw fixturesResult.error;
  if (goalsResult.error) throw goalsResult.error;
  if (assistsResult.error) throw assistsResult.error;
  if (cleanSheetsResult.error) {
    throw cleanSheetsResult.error;
  }

  const matchPicks =
    matchPicksResult.data ?? [];

  const goalPicks =
    goalPicksResult.data ?? [];

  const assistPicks =
    assistPicksResult.data ?? [];

  const cleanSheetPicks =
    cleanSheetPicksResult.data ?? [];

  const fixtures =
    fixturesResult.data ?? [];

  const goals =
    goalsResult.data ?? [];

  const assists =
    assistsResult.data ?? [];

  const cleanSheets =
    cleanSheetsResult.data ?? [];

  /*
   * Only completed/provisional-completed fixtures
   * count toward accuracy.
   *
   * FPL can mark a fixture as finished_provisional
   * before it is formally finished.
   *
   * Our fixtures table stores this as finished.
   */
  const completedFixtureIds = new Set(
  fixtures
    .filter(
      (fixture) =>
        (fixture.finished ||
          fixture.finished_provisional) &&
        fixture.home_score !== null &&
        fixture.away_score !== null
    )
    .map(
      (fixture) => fixture.fixture_id
    )
);

  /*
   * ---------------------------------------------------------
   * MATCH PREDICTION ACCURACY
   * ---------------------------------------------------------
   */

  const predictionStats =
    new Map<
      number,
      {
        selected: number;
        correct: number;
      }
    >();

  const fixtureMap =
    new Map(
      fixtures.map(
        (fixture) => [
          fixture.fixture_id,
          fixture,
        ]
      )
    );

  for (const pick of matchPicks) {
    if (
      !completedFixtureIds.has(
        pick.fixture_id
      )
    ) {
      continue;
    }

    const fixture =
      fixtureMap.get(
        pick.fixture_id
      );

    if (!fixture) continue;

    let actualResult: string;

    if (
      fixture.home_score >
      fixture.away_score
    ) {
      actualResult = "HOME";
    } else if (
      fixture.away_score >
      fixture.home_score
    ) {
      actualResult = "AWAY";
    } else {
      actualResult = "DRAW";
    }

    const stats =
      predictionStats.get(
        pick.member_id
      ) ?? {
        selected: 0,
        correct: 0,
      };

    stats.selected += 1;

    if (
      pick.predicted_result ===
      actualResult
    ) {
      stats.correct += 1;
    }

    predictionStats.set(
      pick.member_id,
      stats
    );
  }

  /*
   * ---------------------------------------------------------
   * GOALSCORER ACCURACY
   * ---------------------------------------------------------
   */

  const goalPickStats =
    new Map<
      number,
      {
        selected: number;
        correct: number;
      }
    >();

  const goalsByPlayer =
    new Map<number, number>();

  for (const goal of goals) {
    if (
      goal.own_goal ||
      !completedFixtureIds.has(
        goal.fixture_id
      )
    ) {
      continue;
    }

    goalsByPlayer.set(
      goal.player_id,
      (goalsByPlayer.get(
        goal.player_id
      ) ?? 0) + 1
    );
  }

  for (const pick of goalPicks) {
    /*
     * A goalscorer pick is eligible once
     * at least one fixture in its matchweek
     * has completed.
     */
    const hasCompletedFixture =
      fixtures.some(
        (fixture) =>
          fixture.matchweek_id ===
            pick.matchweek_id &&
          completedFixtureIds.has(
            fixture.fixture_id
          )
      );

    if (!hasCompletedFixture) {
      continue;
    }

    const stats =
      goalPickStats.get(
        pick.member_id
      ) ?? {
        selected: 0,
        correct: 0,
      };

    stats.selected += 1;

    if (
      (goalsByPlayer.get(
        pick.player_id
      ) ?? 0) > 0
    ) {
      stats.correct += 1;
    }

    goalPickStats.set(
      pick.member_id,
      stats
    );
  }

  /*
   * ---------------------------------------------------------
   * ASSIST ACCURACY
   * ---------------------------------------------------------
   */

  const assistPickStats =
    new Map<
      number,
      {
        selected: number;
        correct: number;
      }
    >();

  const assistsByPlayer =
    new Map<number, number>();

  for (const assist of assists) {
    if (
      !completedFixtureIds.has(
        assist.fixture_id
      )
    ) {
      continue;
    }

    assistsByPlayer.set(
      assist.player_id,
      (assistsByPlayer.get(
        assist.player_id
      ) ?? 0) + 1
    );
  }

  for (const pick of assistPicks) {
    const hasCompletedFixture =
      fixtures.some(
        (fixture) =>
          fixture.matchweek_id ===
            pick.matchweek_id &&
          completedFixtureIds.has(
            fixture.fixture_id
          )
      );

    if (!hasCompletedFixture) {
      continue;
    }

    const stats =
      assistPickStats.get(
        pick.member_id
      ) ?? {
        selected: 0,
        correct: 0,
      };

    stats.selected += 1;

    if (
      (assistsByPlayer.get(
        pick.player_id
      ) ?? 0) > 0
    ) {
      stats.correct += 1;
    }

    assistPickStats.set(
      pick.member_id,
      stats
    );
  }

  /*
   * ---------------------------------------------------------
   * CLEAN SHEET ACCURACY
   * ---------------------------------------------------------
   */

  const cleanSheetPickStats =
    new Map<
      number,
      {
        selected: number;
        correct: number;
      }
    >();

  const cleanSheetSet =
    new Set<string>();

  for (const cleanSheet of cleanSheets) {
    if (
      !completedFixtureIds.has(
        cleanSheet.fixture_id
      )
    ) {
      continue;
    }

    const fixture =
      fixtureMap.get(
        cleanSheet.fixture_id
      );

    if (!fixture) continue;

    cleanSheetSet.add(
      `${fixture.matchweek_id}-${cleanSheet.club_id}`
    );
  }

  for (const pick of cleanSheetPicks) {
    const hasCompletedFixture =
      fixtures.some(
        (fixture) =>
          fixture.matchweek_id ===
            pick.matchweek_id &&
          completedFixtureIds.has(
            fixture.fixture_id
          )
      );

    if (!hasCompletedFixture) {
      continue;
    }

    const stats =
      cleanSheetPickStats.get(
        pick.member_id
      ) ?? {
        selected: 0,
        correct: 0,
      };

    stats.selected += 1;

    if (
      cleanSheetSet.has(
        `${pick.matchweek_id}-${pick.club_id}`
      )
    ) {
      stats.correct += 1;
    }

    cleanSheetPickStats.set(
      pick.member_id,
      stats
    );
  }

  // Find the current and previous scored gameweeks.
  const matchweekIds = [
    ...new Set(
      rows.map((row) => row.matchweek_id)
    ),
  ].sort((a, b) => b - a);

  const currentMatchweekId =
    matchweekIds[0];

  const previousMatchweekId =
    matchweekIds[1];

  // Calculate current season totals.
  const currentTotals = new Map<
    number,
    {
      member_id: number;
      first_name: string;
      last_name: string;
      team_name: string;
      season_points: number;
    }
  >();

  for (const row of rows) {
    const existing =
      currentTotals.get(row.member_id);

    if (existing) {
      existing.season_points += row.score;
    } else {
      currentTotals.set(row.member_id, {
        member_id: row.member_id,
        first_name:
          (row.members as any)?.first_name ??
          "",
        last_name:
          (row.members as any)?.last_name ??
          "",
        team_name:
          (row.members as any)?.team_name ??
          "Unknown",
        season_points: row.score,
      });
    }
  }

  // Calculate standings after the previous gameweek.
  const previousTotals = new Map<
    number,
    number
  >();

  if (
    previousMatchweekId !== undefined
  ) {
    for (const row of rows) {
      if (
        row.matchweek_id <=
        previousMatchweekId
      ) {
        previousTotals.set(
          row.member_id,
          (previousTotals.get(
            row.member_id
          ) ?? 0) + row.score
        );
      }
    }
  }

  // Sort current standings.
  const currentStandings = [
    ...currentTotals.values(),
  ].sort((a, b) => {
    if (
      b.season_points !==
      a.season_points
    ) {
      return (
        b.season_points -
        a.season_points
      );
    }

    return (
      a.member_id -
      b.member_id
    );
  });

  // Calculate previous rankings.
  const previousStandings = [
    ...previousTotals.entries(),
  ].sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }

    return a[0] - b[0];
  });

  const previousRanks = new Map<
    number,
    number
  >();

  previousStandings.forEach(
    ([memberId], index) => {
      previousRanks.set(
        memberId,
        index + 1
      );
    }
  );

  // Add movement information.
  const standings: Standing[] =
    currentStandings.map(
      (member, index) => {
        const currentRank =
          index + 1;

        const previousRank =
          previousRanks.get(
            member.member_id
          );

        const predictionStatsForMember =
  predictionStats.get(
    member.member_id
  );

const goalStatsForMember =
  goalPickStats.get(
    member.member_id
  );

const assistStatsForMember =
  assistPickStats.get(
    member.member_id
  );

const cleanSheetStatsForMember =
  cleanSheetPickStats.get(
    member.member_id
  );

const percentage = (
  stats:
    | {
        selected: number;
        correct: number;
      }
    | undefined
) =>
  stats &&
  stats.selected > 0
    ? Math.round(
        (stats.correct /
          stats.selected) *
          100
      )
    : 0;

return {
  ...member,
  rank_change:
    previousRank !==
    undefined
      ? previousRank -
        currentRank
      : 0,

  match_prediction_accuracy:
    percentage(
      predictionStatsForMember
    ),

  goalscorer_accuracy:
    percentage(
      goalStatsForMember
    ),

  assist_accuracy:
    percentage(
      assistStatsForMember
    ),

  clean_sheet_accuracy:
    percentage(
      cleanSheetStatsForMember
    ),
};
      }
    );

  return standings;
}

export async function getLiveSeasonStandings(
  currentMatchweekId: number
) {
  /*
   * ---------------------------------------------------------
   * GET INITIAL DATA IN PARALLEL
   * ---------------------------------------------------------
   */

  const [
    membersResult,
    weeklyScoresResult,
    fixturesResult,
    matchweekResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("members")
      .select(`
        member_id,
        first_name,
        last_name,
        team_name
      `)
      .eq("active", true)
      .order("display_name"),

    supabaseAdmin
      .from("weekly_scores")
      .select(`
        member_id,
        score
      `)
      .neq(
        "matchweek_id",
        currentMatchweekId
      ),

    supabaseAdmin
      .from("fixtures")
      .select(`
        fixture_id,
        home_score,
        away_score,
        finished
      `)
      .eq(
        "matchweek_id",
        currentMatchweekId
      ),

    supabaseAdmin
      .from("matchweeks")
      .select(`
        featured_match_fixture_id,
        game_of_the_week_fixture_id
      `)
      .eq(
        "matchweek_id",
        currentMatchweekId
      )
      .single(),
  ]);

  /*
   * ---------------------------------------------------------
   * CHECK INITIAL ERRORS
   * ---------------------------------------------------------
   */

  if (membersResult.error) {
    throw membersResult.error;
  }

  if (weeklyScoresResult.error) {
    throw weeklyScoresResult.error;
  }

  if (fixturesResult.error) {
    throw fixturesResult.error;
  }

  if (matchweekResult.error) {
    throw matchweekResult.error;
  }

  const members =
    membersResult.data ?? [];

  const weeklyScores =
    weeklyScoresResult.data ?? [];

  const fixtures =
    fixturesResult.data ?? [];

  const matchweek =
    matchweekResult.data;

  const fixtureIds =
    fixtures.map(
      (fixture) =>
        fixture.fixture_id
    );

  /*
   * ---------------------------------------------------------
   * START EVERY MEMBER AT ZERO
   * ---------------------------------------------------------
   */

  const totals = new Map<
    number,
    number
  >();

  for (const member of members) {
    totals.set(
      member.member_id,
      0
    );
  }

  /*
   * ---------------------------------------------------------
   * ADD COMPLETED GAMEWEEK SCORES
   * ---------------------------------------------------------
   */

  for (const row of weeklyScores) {
    totals.set(
      row.member_id,
      (totals.get(
        row.member_id
      ) ?? 0) +
        (row.score ?? 0)
    );
  }

  /*
   * ---------------------------------------------------------
   * GET CURRENT GAMEWEEK PICKS / RESULTS IN PARALLEL
   * ---------------------------------------------------------
   */

  let picks: Array<{
    member_id: number;
    fixture_id: number;
    predicted_result: string;
  }> = [];

  let goalPicks: Array<{
    member_id: number;
    player_id: number;
  }> = [];

  let assistPicks: Array<{
    member_id: number;
    player_id: number;
  }> = [];

  let cleanSheetPicks: Array<{
    member_id: number;
    club_id: number;
  }> = [];

  let goals: Array<{
    player_id: number;
    own_goal: boolean;
    fixture_id: number;
  }> = [];

  let assists: Array<{
    player_id: number;
    fixture_id: number;
  }> = [];

  let cleanSheets: Array<{
    club_id: number;
    fixture_id: number;
  }> = [];

  if (fixtureIds.length > 0) {
    const [
      picksResult,
      goalPicksResult,
      assistPicksResult,
      cleanSheetPicksResult,
      goalsResult,
      assistsResult,
      cleanSheetsResult,
    ] = await Promise.all([
      supabaseAdmin
        .from("match_picks")
        .select(`
          member_id,
          fixture_id,
          predicted_result
        `)
        .in(
          "fixture_id",
          fixtureIds
        ),

      supabaseAdmin
        .from("goal_scorer_picks")
        .select(`
          member_id,
          player_id
        `)
        .eq(
          "matchweek_id",
          currentMatchweekId
        ),

      supabaseAdmin
        .from("assists_picks")
        .select(`
          member_id,
          player_id
        `)
        .eq(
          "matchweek_id",
          currentMatchweekId
        ),

      supabaseAdmin
        .from("clean_sheet_picks")
        .select(`
          member_id,
          club_id
        `)
        .eq(
          "matchweek_id",
          currentMatchweekId
        ),

      supabaseAdmin
        .from("goals")
        .select(`
          player_id,
          own_goal,
          fixture_id
        `)
        .in(
          "fixture_id",
          fixtureIds
        ),

      supabaseAdmin
        .from("assists")
        .select(`
          player_id,
          fixture_id
        `)
        .in(
          "fixture_id",
          fixtureIds
        ),

      supabaseAdmin
        .from("clean_sheets")
        .select(`
          club_id,
          fixture_id
        `)
        .in(
          "fixture_id",
          fixtureIds
        ),
    ]);

    if (picksResult.error) {
      throw picksResult.error;
    }

    if (goalPicksResult.error) {
      throw goalPicksResult.error;
    }

    if (assistPicksResult.error) {
      throw assistPicksResult.error;
    }

    if (
      cleanSheetPicksResult.error
    ) {
      throw cleanSheetPicksResult.error;
    }

    if (goalsResult.error) {
      throw goalsResult.error;
    }

    if (assistsResult.error) {
      throw assistsResult.error;
    }

    if (cleanSheetsResult.error) {
      throw cleanSheetsResult.error;
    }

    picks =
      picksResult.data ?? [];

    goalPicks =
      goalPicksResult.data ?? [];

    assistPicks =
      assistPicksResult.data ?? [];

    cleanSheetPicks =
      cleanSheetPicksResult.data ??
      [];

    goals =
      goalsResult.data ?? [];

    assists =
      assistsResult.data ?? [];

    cleanSheets =
      cleanSheetsResult.data ?? [];
  }

    /*
   * Track correct match predictions for the
   * current gameweek so the weekly bonus can
   * be calculated once all fixtures are complete.
   */
  const correctPredictions = new Map<
    number,
    number
  >();

  for (const member of members) {
    correctPredictions.set(
      member.member_id,
      0
    );
  }

  /*
   * ---------------------------------------------------------
   * MATCH PREDICTION POINTS
   * ---------------------------------------------------------
   */

  /*
   * Build a map of picks by fixture.
   *
   * This avoids repeatedly filtering the entire
   * picks array for every fixture.
   */

  const picksByFixture = new Map<
    number,
    Array<{
      member_id: number;
      fixture_id: number;
      predicted_result: string;
    }>
  >();

  for (const pick of picks) {
    const existing =
      picksByFixture.get(
        pick.fixture_id
      ) ?? [];

    existing.push(pick);

    picksByFixture.set(
      pick.fixture_id,
      existing
    );
  }

  for (const fixture of fixtures) {
    if (
      !fixture.finished ||
      fixture.home_score === null ||
      fixture.away_score === null
    ) {
      continue;
    }

    let actualResult: string;

    if (
      fixture.home_score >
      fixture.away_score
    ) {
      actualResult = "HOME";
    } else if (
      fixture.away_score >
      fixture.home_score
    ) {
      actualResult = "AWAY";
    } else {
      actualResult = "DRAW";
    }

    const fixturePicks =
      picksByFixture.get(
        fixture.fixture_id
      ) ?? [];

    for (const pick of fixturePicks) {
      if (
        pick.predicted_result !==
        actualResult
      ) {
        continue;
      }

      correctPredictions.set(
        pick.member_id,
        (correctPredictions.get(
          pick.member_id
        ) ?? 0) + 1
      );

      let points = 1;

      if (
        fixture.fixture_id ===
        matchweek?.game_of_the_week_fixture_id
      ) {
        points = 3;
      } else if (
        fixture.fixture_id ===
        matchweek?.featured_match_fixture_id
      ) {
        points = 2;
      }

      totals.set(
        pick.member_id,
        (totals.get(
          pick.member_id
        ) ?? 0) + points
      );
    }
  }

   /*
 * ---------------------------------------------------------
 * WEEKLY PREDICTION BONUS
 * ---------------------------------------------------------
 *
 * Calculate the bonus from correct predictions
 * completed so far in the current gameweek.
 */

for (const member of members) {
  const bonus =
    calculateWeeklyPredictionBonus(
      correctPredictions.get(
        member.member_id
      ) ?? 0
    );

  if (bonus > 0) {
    totals.set(
      member.member_id,
      (totals.get(
        member.member_id
      ) ?? 0
    ) + bonus);
  }
}

  /*
   * ---------------------------------------------------------
   * GOALSCORER POINTS
   * ---------------------------------------------------------
   */

  if (goalPicks.length > 0) {
    const goalPlayerIds = [
      ...new Set(
        goalPicks.map(
          (pick) => pick.player_id
        )
      ),
    ];

    const {
      data: goalPlayers,
      error: goalPlayersError,
    } = await supabaseAdmin
      .from("players")
      .select(`
        player_id,
        position
      `)
      .in(
        "player_id",
        goalPlayerIds
      );

    if (goalPlayersError) {
      throw goalPlayersError;
    }

    const playerPositions =
      new Map<
        number,
        string
      >(
        (goalPlayers ?? []).map(
          (player) => [
            player.player_id,
            player.position,
          ]
        )
      );

    /*
     * Map goal scorer picks by player.
     */

    const goalPicksByPlayer =
      new Map<
        number,
        number[]
      >();

    for (const pick of goalPicks) {
      const existing =
        goalPicksByPlayer.get(
          pick.player_id
        ) ?? [];

      existing.push(
        pick.member_id
      );

      goalPicksByPlayer.set(
        pick.player_id,
        existing
      );
    }

    for (const goal of goals) {
      if (goal.own_goal) {
        continue;
      }

      const position =
        playerPositions.get(
          goal.player_id
        ) ?? "FWD";

      const points =
        getGoalPointsByPosition(
          position
        );

      const memberIds =
        goalPicksByPlayer.get(
          goal.player_id
        ) ?? [];

      for (const memberId of memberIds) {
        totals.set(
          memberId,
          (totals.get(
            memberId
          ) ?? 0) + points
        );
      }
    }
  }

  /*
   * ---------------------------------------------------------
   * ASSIST POINTS
   * ---------------------------------------------------------
   */

  /*
   * Map assist picks by player.
   */

  const assistPicksByPlayer =
    new Map<
      number,
      number[]
    >();

  for (const pick of assistPicks) {
    const existing =
      assistPicksByPlayer.get(
        pick.player_id
      ) ?? [];

    existing.push(
      pick.member_id
    );

    assistPicksByPlayer.set(
      pick.player_id,
      existing
    );
  }

  for (const assist of assists) {
    const memberIds =
      assistPicksByPlayer.get(
        assist.player_id
      ) ?? [];

    for (const memberId of memberIds) {
      totals.set(
        memberId,
        (totals.get(
          memberId
        ) ?? 0) + 2
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * CLEAN SHEET POINTS
   * ---------------------------------------------------------
   */

  /*
   * Map clean sheet picks by club.
   */

  const cleanSheetPicksByClub =
    new Map<
      number,
      number[]
    >();

  for (
    const pick of cleanSheetPicks
  ) {
    const existing =
      cleanSheetPicksByClub.get(
        pick.club_id
      ) ?? [];

    existing.push(
      pick.member_id
    );

    cleanSheetPicksByClub.set(
      pick.club_id,
      existing
    );
  }

  for (
    const cleanSheet of cleanSheets
  ) {
    const memberIds =
      cleanSheetPicksByClub.get(
        cleanSheet.club_id
      ) ?? [];

    for (const memberId of memberIds) {
      totals.set(
        memberId,
        (totals.get(
          memberId
        ) ?? 0) + 3
      );
    }
  }

/*
 * ---------------------------------------------------------
 * GET SEASON PERFORMANCE DATA
 * ---------------------------------------------------------
 *
 * Use the existing season standings calculation for
 * accuracy statistics. Live points remain calculated
 * independently above.
 */

const seasonStandings =
  await getSeasonStandings();

const seasonPerformanceByMember =
  new Map(
    seasonStandings.map((member) => [
      member.member_id,
      member,
    ])
  );

  /*
   * ---------------------------------------------------------
   * SORT LIVE STANDINGS
   * ---------------------------------------------------------
   */

  const liveStandings = [
  ...members,
]
  .map((member) => {
  const performance =
    seasonPerformanceByMember.get(
      member.member_id
    );

  return {
    member_id: member.member_id,
    first_name: member.first_name,
    last_name: member.last_name,
    team_name: member.team_name,
    season_points:
      totals.get(
        member.member_id
      ) ?? 0,

    rank_change:
      performance?.rank_change ?? 0,

    match_prediction_accuracy:
      performance?.match_prediction_accuracy ?? 0,

    goalscorer_accuracy:
      performance?.goalscorer_accuracy ?? 0,

    assist_accuracy:
      performance?.assist_accuracy ?? 0,

    clean_sheet_accuracy:
      performance?.clean_sheet_accuracy ?? 0,
  };
})
    .sort((a, b) => {
      if (
        b.season_points !==
        a.season_points
      ) {
        return (
          b.season_points -
          a.season_points
        );
      }

      return (
        a.member_id -
        b.member_id
      );
    })
    .map((member, index) => ({
      ...member,
      rank: index + 1,
    }));

  return liveStandings;
}