import {
  getLiveSeasonStandings,
} from "@/services/standingsService";

import { getLeagueLeaders } from "@/services/leagueLeadersService";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getDashboardData(memberId?: number) {
  /*
   * ---------------------------------------------------------
   * INITIAL DASHBOARD DATA
   * ---------------------------------------------------------
   *
   * These queries are independent, so run them all at once.
   */

  const [
    leagueLeaders,
    seasonResult,
    gameweekResult,
    clubsResult,
    playersResult,
    fixturesCountResult,
  ] = await Promise.all([
    getLeagueLeaders(),

    supabaseAdmin
      .from("seasons")
      .select("*")
      .eq("is_current", true)
      .single(),

    supabaseAdmin
      .from("matchweeks")
      .select("*")
      .eq("status", "UPCOMING")
      .order("week_number")
      .limit(1)
      .single(),

    supabaseAdmin
      .from("clubs")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabaseAdmin
      .from("players")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabaseAdmin
      .from("fixtures")
      .select("*", {
        count: "exact",
        head: true,
      }),
  ]);

  const season = seasonResult.data;
  const gameweek = gameweekResult.data;

  if (seasonResult.error) {
    throw seasonResult.error;
  }

  if (gameweekResult.error) {
    throw gameweekResult.error;
  }

  if (clubsResult.error) {
    throw clubsResult.error;
  }

  if (playersResult.error) {
    throw playersResult.error;
  }

  if (fixturesCountResult.error) {
    throw fixturesCountResult.error;
  }

  /*
   * ---------------------------------------------------------
   * DEFAULT VALUES
   * ---------------------------------------------------------
   */

  let correctPredictions = 0;
  let completedPredictions = 0;

  let goals = 0;
  let assists = 0;
  let cleanSheets = 0;

  let picksComplete = 0;
  let totalMatches = 0;

  let bonusPicksComplete = 0;

  const totalBonusPicks = 5;

  let currentRank: number | null = null;
  let rankChange = 0;

  /*
   * ---------------------------------------------------------
   * CURRENT GAMEWEEK
   * ---------------------------------------------------------
   */

  if (gameweek) {
    /*
     * -------------------------------------------------------
     * GET CURRENT GAMEWEEK FIXTURES
     * -------------------------------------------------------
     */

    const {
      data: gameweekFixtures,
      error: fixtureError,
    } = await supabaseAdmin
      .from("fixtures")
      .select(`
        fixture_id,
        finished,
        home_score,
        away_score
      `)
      .eq(
        "matchweek_id",
        gameweek.matchweek_id
      );

    if (fixtureError) {
      throw fixtureError;
    }

    const fixtureIds =
      gameweekFixtures?.map(
        (fixture) => fixture.fixture_id
      ) ?? [];

    totalMatches = fixtureIds.length;

    /*
     * -------------------------------------------------------
     * MEMBER-SPECIFIC DASHBOARD DATA
     * -------------------------------------------------------
     *
     * All of these are independent once we know the fixture IDs,
     * so retrieve them simultaneously.
     */

    if (memberId) {
      const [
        matchPicksResult,
        goalScorerResult,
        assistsResult,
        cleanSheetResult,
        goalsResult,
        assistsScoringResult,
        cleanSheetsResult,
        liveStandingsResult,
      ] = await Promise.all([
        /*
         * Match predictions
         */
        fixtureIds.length > 0
          ? supabaseAdmin
              .from("match_picks")
              .select(`
                fixture_id,
                predicted_result
              `)
              .eq("member_id", memberId)
              .in(
                "fixture_id",
                fixtureIds
              )
          : Promise.resolve({
              data: [],
              error: null,
            }),

        /*
         * Goal scorer picks
         */
        supabaseAdmin
          .from("goal_scorer_picks")
          .select("player_id")
          .eq("member_id", memberId)
          .eq(
            "matchweek_id",
            gameweek.matchweek_id
          ),

        /*
         * Assist picks
         */
        supabaseAdmin
          .from("assists_picks")
          .select("player_id")
          .eq("member_id", memberId)
          .eq(
            "matchweek_id",
            gameweek.matchweek_id
          ),

        /*
         * Clean sheet picks
         */
        supabaseAdmin
          .from("clean_sheet_picks")
          .select("club_id")
          .eq("member_id", memberId)
          .eq(
            "matchweek_id",
            gameweek.matchweek_id
          ),

        /*
         * Goals actually scored in this gameweek
         */
        fixtureIds.length > 0
          ? supabaseAdmin
              .from("goals")
              .select(`
                player_id,
                own_goal
              `)
              .in(
                "fixture_id",
                fixtureIds
              )
          : Promise.resolve({
              data: [],
              error: null,
            }),

        /*
         * Assists actually recorded in this gameweek
         */
        fixtureIds.length > 0
          ? supabaseAdmin
              .from("assists")
              .select(`
                player_id
              `)
              .in(
                "fixture_id",
                fixtureIds
              )
          : Promise.resolve({
              data: [],
              error: null,
            }),

        /*
         * Clean sheets recorded in this gameweek
         */
        fixtureIds.length > 0
          ? supabaseAdmin
              .from("clean_sheets")
              .select(`
                club_id
              `)
              .in(
                "fixture_id",
                fixtureIds
              )
          : Promise.resolve({
              data: [],
              error: null,
            }),

        /*
         * Live standings
         */
        getLiveSeasonStandings(
          gameweek.matchweek_id
        ),
      ]);

      /*
       * -----------------------------------------------------
       * CHECK ERRORS
       * -----------------------------------------------------
       */

      if (matchPicksResult.error) {
        throw matchPicksResult.error;
      }

      if (goalScorerResult.error) {
        throw goalScorerResult.error;
      }

      if (assistsResult.error) {
        throw assistsResult.error;
      }

      if (cleanSheetResult.error) {
        throw cleanSheetResult.error;
      }

      if (goalsResult.error) {
        throw goalsResult.error;
      }

      if (assistsScoringResult.error) {
        throw assistsScoringResult.error;
      }

      if (cleanSheetsResult.error) {
        throw cleanSheetsResult.error;
      }

      /*
       * -----------------------------------------------------
       * MATCH PREDICTIONS
       * -----------------------------------------------------
       */

      const matchPicks =
        matchPicksResult.data ?? [];

      picksComplete = matchPicks.length;

      for (const pick of matchPicks) {
        const fixture =
          gameweekFixtures?.find(
            (item) =>
              item.fixture_id ===
              pick.fixture_id
          );

        /*
         * Only completed fixtures count
         * toward prediction accuracy.
         */

        if (
          !fixture ||
          !fixture.finished ||
          fixture.home_score === null ||
          fixture.away_score === null
        ) {
          continue;
        }

        completedPredictions += 1;

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

        if (
          pick.predicted_result ===
          actualResult
        ) {
          correctPredictions += 1;
        }
      }

      /*
       * -----------------------------------------------------
       * BONUS PICK COMPLETION
       * -----------------------------------------------------
       */

      const goalScorerPicks =
        goalScorerResult.data ?? [];

      const assistPicks =
        assistsResult.data ?? [];

      const cleanSheetPicks =
        cleanSheetResult.data ?? [];

      bonusPicksComplete =
        goalScorerPicks.length +
        assistPicks.length +
        cleanSheetPicks.length;

      /*
       * -----------------------------------------------------
       * GOALSCORER RESULTS
       * -----------------------------------------------------
       */

      const selectedGoalScorers =
        new Set(
          goalScorerPicks.map(
            (pick) => pick.player_id
          )
        );

      goals =
        (goalsResult.data ?? []).filter(
          (goal) =>
            !goal.own_goal &&
            selectedGoalScorers.has(
              goal.player_id
            )
        ).length;

      /*
       * -----------------------------------------------------
       * ASSIST RESULTS
       * -----------------------------------------------------
       */

      const selectedAssistPlayers =
        new Set(
          assistPicks.map(
            (pick) => pick.player_id
          )
        );

      assists =
        (assistsScoringResult.data ?? [])
          .filter((assist) =>
            selectedAssistPlayers.has(
              assist.player_id
            )
          )
          .length;

      /*
       * -----------------------------------------------------
       * CLEAN SHEET RESULTS
       * -----------------------------------------------------
       */

      const selectedCleanSheetClubs =
        new Set(
          cleanSheetPicks.map(
            (pick) => pick.club_id
          )
        );

      cleanSheets =
        (cleanSheetsResult.data ?? [])
          .filter((cleanSheet) =>
            selectedCleanSheetClubs.has(
              cleanSheet.club_id
            )
          )
          .length;

      /*
       * -----------------------------------------------------
       * CURRENT RANK
       * -----------------------------------------------------
       */

      const memberLiveStanding =
  (liveStandingsResult ?? []).find(
    (standing) =>
      standing.member_id === memberId
  );

      if (memberLiveStanding) {
        currentRank =
          memberLiveStanding.rank;
      }

      /*
       * -----------------------------------------------------
       * RANK CHANGE
       * -----------------------------------------------------
       *
       * getLiveSeasonStandings gives us the current
       * standings, but not movement. We calculate the
       * previous rank from the same weekly scores data
       * used by the standings service.
       */

      const {
        data: previousScores,
        error: previousScoresError,
      } = await supabaseAdmin
        .from("weekly_scores")
        .select(`
          member_id,
          matchweek_id,
          score
        `)
        .neq(
          "matchweek_id",
          gameweek.matchweek_id
        );

      if (previousScoresError) {
        throw previousScoresError;
      }

      const previousTotals =
        new Map<number, number>();

      for (
        const score of previousScores ?? []
      ) {
        previousTotals.set(
          score.member_id,
          (
            previousTotals.get(
              score.member_id
            ) ?? 0
          ) + (score.score ?? 0)
        );
      }

      /*
       * Members with no previous scores still
       * need to appear in the previous ranking.
       */

      const {
        data: allMembers,
        error: allMembersError,
      } = await supabaseAdmin
        .from("members")
        .select("member_id");

      if (allMembersError) {
        throw allMembersError;
      }

      for (
        const member of allMembers ?? []
      ) {
        if (
          !previousTotals.has(
            member.member_id
          )
        ) {
          previousTotals.set(
            member.member_id,
            0
          );
        }
      }

      const previousStandings =
        [...previousTotals.entries()].sort(
          (a, b) => {
            if (b[1] !== a[1]) {
              return b[1] - a[1];
            }

            return a[0] - b[0];
          }
        );

      const previousRank =
        previousStandings.findIndex(
          ([id]) =>
            id === memberId
        ) + 1;

      if (
        previousRank > 0 &&
        currentRank !== null
      ) {
        rankChange =
          previousRank -
          currentRank;
      }
    }
  }

  /*
   * ---------------------------------------------------------
   * SUBMISSION STATUS
   * ---------------------------------------------------------
   */

  const submitted =
    totalMatches > 0 &&
    picksComplete === totalMatches &&
    bonusPicksComplete ===
      totalBonusPicks;

  /*
   * ---------------------------------------------------------
   * DEADLINE
   * ---------------------------------------------------------
   */

  const deadline = gameweek?.deadline
    ? (() => {
        const d =
          new Date(
            gameweek.deadline
          );

        const date =
          d.toLocaleDateString(
            "en-US",
            {
              weekday:
                "long",
              month: "short",
              day: "numeric",
            }
          );

        const time =
          d.toLocaleTimeString(
            "en-US",
            {
              hour:
                "numeric",
              minute:
                "2-digit",
            }
          );

        return `${date} • ${time}`;
      })()
    : "Friday, Aug 21 • 3:00 PM";

  /*
   * ---------------------------------------------------------
   * RETURN DASHBOARD
   * ---------------------------------------------------------
   */
      /*
 * ---------------------------------------------------------
 * FANBOY CLUBS
 * ---------------------------------------------------------
 */

const fanboyClubNames = [
  "Arsenal",
  "Chelsea",
  "Manchester United",
  "Tottenham",
];

const {
  data: fanboyFixtures,
  error: fanboyFixturesError,
} = await supabaseAdmin
  .from("fixtures")
  .select(`
    fixture_id,
    home_score,
    away_score,
    finished,
    home:clubs!fixtures_home_club_id_fkey (
      club_name
    ),
    away:clubs!fixtures_away_club_id_fkey (
      club_name
    )
  `);

if (fanboyFixturesError) {
  throw fanboyFixturesError;
}

const fanboyStats = new Map<
  string,
  {
    clubName: string;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
  }
>();

for (const clubName of fanboyClubNames) {
  fanboyStats.set(clubName, {
    clubName,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  });
}

for (const fixture of fanboyFixtures ?? []) {
  if (
    !fixture.finished ||
    fixture.home_score === null ||
    fixture.away_score === null
  ) {
    continue;
  }

  const homeClub =
    (fixture.home as any)?.club_name;

  const awayClub =
    (fixture.away as any)?.club_name;

  const homeStats =
    fanboyStats.get(homeClub);

  const awayStats =
    fanboyStats.get(awayClub);

  /*
   * Ignore fixtures that don't involve
   * one of our four fanboy clubs.
   */
  if (!homeStats && !awayStats) {
    continue;
  }

  /*
   * Update home club.
   */
  if (homeStats) {
    homeStats.played += 1;
    homeStats.goalsFor +=
      fixture.home_score;
    homeStats.goalsAgainst +=
      fixture.away_score;

    if (
      fixture.home_score >
      fixture.away_score
    ) {
      homeStats.wins += 1;
      homeStats.points += 3;
    } else if (
      fixture.home_score ===
      fixture.away_score
    ) {
      homeStats.draws += 1;
      homeStats.points += 1;
    } else {
      homeStats.losses += 1;
    }
  }

  /*
   * Update away club.
   */
  if (awayStats) {
    awayStats.played += 1;
    awayStats.goalsFor +=
      fixture.away_score;
    awayStats.goalsAgainst +=
      fixture.home_score;

    if (
      fixture.away_score >
      fixture.home_score
    ) {
      awayStats.wins += 1;
      awayStats.points += 3;
    } else if (
      fixture.away_score ===
      fixture.home_score
    ) {
      awayStats.draws += 1;
      awayStats.points += 1;
    } else {
      awayStats.losses += 1;
    }
  }
}

const fanboyClubs = [
  ...fanboyStats.values(),
]
  .map((club) => ({
    ...club,
    goalDifference:
      club.goalsFor -
      club.goalsAgainst,
  }))
  .sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    if (
      b.goalDifference !==
      a.goalDifference
    ) {
      return (
        b.goalDifference -
        a.goalDifference
      );
    }

    return (
      b.goalsFor -
      a.goalsFor
    );
  })
  .map((club, index) => ({
    ...club,
    position: index + 1,
  }));
  
  return {
    gameweek: {
      status:
        gameweek?.status ??
        "UPCOMING",

      number:
        gameweek?.week_number ??
        1,

      season: season
        ? `${season.start_year}/${String(
            season.end_year
          ).slice(-2)}`
        : "2026/27",

      deadline,

      progress: 0,

      countdown:
        "Live Soon",
    },

    myWeek: {
      submitted,

      correctPredictions,

      completedPredictions,

      goals,

      assists,

      cleanSheets,

      currentRank,

      rankChange,
    },

    leaders:
      leagueLeaders,

    fanboyClubs,
  };
}