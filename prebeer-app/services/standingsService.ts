import {
  getGoalPointsByPosition,
} from "@/services/scoringService";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface Standing {
  member_id: number;
  first_name: string;
  last_name: string;
  team_name: string;
  season_points: number;
  rank_change: number;
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

  // Find the current and previous scored gameweeks.
  const matchweekIds = [
    ...new Set(rows.map((row) => row.matchweek_id)),
  ].sort((a, b) => b - a);

  const currentMatchweekId = matchweekIds[0];
  const previousMatchweekId = matchweekIds[1];

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
    const existing = currentTotals.get(row.member_id);

    if (existing) {
      existing.season_points += row.score;
    } else {
      currentTotals.set(row.member_id, {
        member_id: row.member_id,
        first_name:
          (row.members as any)?.first_name ?? "",
        last_name:
          (row.members as any)?.last_name ?? "",
        team_name:
          (row.members as any)?.team_name ?? "Unknown",
        season_points: row.score,
      });
    }
  }

  // Calculate standings after the previous gameweek.
  const previousTotals = new Map<number, number>();

  if (previousMatchweekId !== undefined) {
    for (const row of rows) {
      if (row.matchweek_id <= previousMatchweekId) {
        previousTotals.set(
          row.member_id,
          (previousTotals.get(row.member_id) ?? 0) +
            row.score
        );
      }
    }
  }

  // Sort current standings.
  const currentStandings = [...currentTotals.values()].sort(
    (a, b) => {
      if (b.season_points !== a.season_points) {
        return b.season_points - a.season_points;
      }

      return a.member_id - b.member_id;
    }
  );

  // Calculate previous rankings.
  const previousStandings = [...previousTotals.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }

      return a[0] - b[0];
    });

  const previousRanks = new Map<number, number>();

  previousStandings.forEach(([memberId], index) => {
    previousRanks.set(memberId, index + 1);
  });

  // Add movement information.
  const standings: Standing[] = currentStandings.map(
    (member, index) => {
      const currentRank = index + 1;
      const previousRank =
        previousRanks.get(member.member_id);

      return {
        ...member,
        rank_change:
          previousRank !== undefined
            ? previousRank - currentRank
            : 0,
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
   * GET ALL MEMBERS
   * ---------------------------------------------------------
   */

  const { data: members, error: membersError } =
    await supabaseAdmin
      .from("members")
      .select("member_id");

  if (membersError) throw membersError;

  /*
   * ---------------------------------------------------------
   * GET SEASON POINTS FROM COMPLETED GAMEWEEKS
   * ---------------------------------------------------------
   */

  const { data: weeklyScores, error: weeklyScoresError } =
    await supabaseAdmin
      .from("weekly_scores")
      .select(`
        member_id,
        matchweek_id,
        score
      `)
      .neq(
        "matchweek_id",
        currentMatchweekId
      );

  if (weeklyScoresError) {
    throw weeklyScoresError;
  }

  /*
   * Start every member at zero so members who haven't
   * scored yet are still included in the standings.
   */

  const totals = new Map<number, number>();

  for (const member of members ?? []) {
    totals.set(member.member_id, 0);
  }

  /*
   * Add all completed gameweek scores.
   */

  for (const row of weeklyScores ?? []) {
    totals.set(
      row.member_id,
      (totals.get(row.member_id) ?? 0) +
        (row.score ?? 0)
    );
  }

  /*
   * ---------------------------------------------------------
   * GET CURRENT GAMEWEEK FIXTURES
   * ---------------------------------------------------------
   */

  const { data: fixtures, error: fixturesError } =
    await supabaseAdmin
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
      );

  if (fixturesError) {
    throw fixturesError;
  }

  const fixtureIds =
    (fixtures ?? []).map(
      (fixture) => fixture.fixture_id
    );

  /*
   * Get the featured / Game of the Week fixtures.
   */

  const { data: matchweek, error: matchweekError } =
    await supabaseAdmin
      .from("matchweeks")
      .select(`
        featured_match_fixture_id,
        game_of_the_week_fixture_id
      `)
      .eq(
        "matchweek_id",
        currentMatchweekId
      )
      .single();

  if (matchweekError) {
    throw matchweekError;
  }

  /*
   * ---------------------------------------------------------
   * MATCH PREDICTION POINTS
   * ---------------------------------------------------------
   */

  if (fixtureIds.length > 0) {
    const { data: picks, error: picksError } =
      await supabaseAdmin
        .from("match_picks")
        .select(`
          member_id,
          fixture_id,
          predicted_result
        `)
        .in(
          "fixture_id",
          fixtureIds
        );

    if (picksError) {
      throw picksError;
    }

    for (const fixture of fixtures ?? []) {
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
        (picks ?? []).filter(
          (pick) =>
            pick.fixture_id ===
            fixture.fixture_id
        );

      for (const pick of fixturePicks) {
        if (
          pick.predicted_result !==
          actualResult
        ) {
          continue;
        }

        let points = 1;

        if (
          fixture.fixture_id ===
          matchweek
            ?.game_of_the_week_fixture_id
        ) {
          points = 3;
        } else if (
          fixture.fixture_id ===
          matchweek
            ?.featured_match_fixture_id
        ) {
          points = 2;
        }

        totals.set(
          pick.member_id,
          (totals.get(pick.member_id) ?? 0) +
            points
        );
      }
    }
  }

  /*
   * ---------------------------------------------------------
   * GOALSCORER POINTS
   * ---------------------------------------------------------
   */

  const { data: goalPicks, error: goalPicksError } =
    await supabaseAdmin
      .from("goal_scorer_picks")
      .select(`
        member_id,
        player_id
      `)
      .eq(
        "matchweek_id",
        currentMatchweekId
      );

  if (goalPicksError) {
    throw goalPicksError;
  }

  const goalPlayerIds = [
    ...new Set(
      (goalPicks ?? []).map(
        (pick) => pick.player_id
      )
    ),
  ];

  const { data: goalPlayers, error: goalPlayersError } =
    goalPlayerIds.length > 0
      ? await supabaseAdmin
          .from("players")
          .select(`
            player_id,
            position
          `)
          .in(
            "player_id",
            goalPlayerIds
          )
      : { data: [], error: null };

  if (goalPlayersError) {
    throw goalPlayersError;
  }

  const playerPositions = new Map(
    (goalPlayers ?? []).map(
      (player) => [
        player.player_id,
        player.position,
      ]
    )
  );

  const { data: goals, error: goalsError } =
    await supabaseAdmin
      .from("goals")
      .select(`
        player_id,
        own_goal,
        fixture_id
      `)
      .in(
        "fixture_id",
        fixtureIds
      );

  if (goalsError) {
    throw goalsError;
  }

  for (const goal of goals ?? []) {
    if (goal.own_goal) {
      continue;
    }

    const position =
      playerPositions.get(
        goal.player_id
      ) ?? "FWD";

    /*
     * Use the same scoring function that the actual
     * gameweek scoring process uses.
     */
  
    const points =
      getGoalPointsByPosition(
        position
      );

    const memberGoalPicks =
      (goalPicks ?? []).filter(
        (pick) =>
          pick.player_id ===
          goal.player_id
      );

    for (const pick of memberGoalPicks) {
      totals.set(
        pick.member_id,
        (totals.get(pick.member_id) ?? 0) +
          points
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * ASSIST POINTS
   * ---------------------------------------------------------
   */

  const { data: assistPicks, error: assistPicksError } =
    await supabaseAdmin
      .from("assists_picks")
      .select(`
        member_id,
        player_id
      `)
      .eq(
        "matchweek_id",
        currentMatchweekId
      );

  if (assistPicksError) {
    throw assistPicksError;
  }

  const { data: assists, error: assistsError } =
    await supabaseAdmin
      .from("assists")
      .select(`
        player_id,
        fixture_id
      `)
      .in(
        "fixture_id",
        fixtureIds
      );

  if (assistsError) {
    throw assistsError;
  }

  for (const assist of assists ?? []) {
    const memberAssistPicks =
      (assistPicks ?? []).filter(
        (pick) =>
          pick.player_id ===
          assist.player_id
      );

    for (const pick of memberAssistPicks) {
      totals.set(
        pick.member_id,
        (totals.get(pick.member_id) ?? 0) +
          2
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * CLEAN SHEET POINTS
   * ---------------------------------------------------------
   */

  const { data: cleanSheetPicks, error: cleanSheetPicksError } =
    await supabaseAdmin
      .from("clean_sheet_picks")
      .select(`
        member_id,
        club_id
      `)
      .eq(
        "matchweek_id",
        currentMatchweekId
      );

  if (cleanSheetPicksError) {
    throw cleanSheetPicksError;
  }

  const { data: cleanSheets, error: cleanSheetsError } =
    await supabaseAdmin
      .from("clean_sheets")
      .select(`
        club_id,
        fixture_id
      `)
      .in(
        "fixture_id",
        fixtureIds
      );

  if (cleanSheetsError) {
    throw cleanSheetsError;
  }

  for (const cleanSheet of cleanSheets ?? []) {
    const memberPicks =
      (cleanSheetPicks ?? []).filter(
        (pick) =>
          pick.club_id ===
          cleanSheet.club_id
      );

    for (const pick of memberPicks) {
      totals.set(
        pick.member_id,
        (totals.get(pick.member_id) ?? 0) +
          3
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * SORT LIVE STANDINGS
   * ---------------------------------------------------------
   */

  const liveStandings = [
    ...(members ?? []),
  ]
    .map((member) => ({
      member_id: member.member_id,
      points:
        totals.get(member.member_id) ?? 0,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      return a.member_id - b.member_id;
    })
    .map((member, index) => ({
      ...member,
      rank: index + 1,
    }));

  return liveStandings;
}