import {
  getLiveSeasonStandings,
} from "@/services/standingsService";
import { getLeagueLeaders } from "@/services/leagueLeadersService";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getDashboardData(memberId?: number) {
  const leagueLeaders = await getLeagueLeaders();
  const { data: season } = await supabaseAdmin
    .from("seasons")
    .select("*")
    .eq("is_current", true)
    .single();

  const { data: gameweek } = await supabaseAdmin
    .from("matchweeks")
    .select("*")
    .eq("status", "UPCOMING")
    .order("week_number")
    .limit(1)
    .single();

  const [
    clubs,
    players,
    fixtures,
  ] = await Promise.all([
    supabaseAdmin
      .from("clubs")
      .select("*", { count: "exact", head: true }),

    supabaseAdmin
      .from("players")
      .select("*", { count: "exact", head: true }),

    supabaseAdmin
      .from("fixtures")
      .select("*", { count: "exact", head: true }),
  ]);

let correctPredictions = 0;
let completedPredictions = 0;
let goals = 0;
let assists = 0;
let cleanSheets = 0;
let picksComplete = 0;
let totalMatches = 0;
let bonusPicksComplete = 0;

const totalBonusPicks = 5;

if (gameweek) {
  const { data: gameweekFixtures, error: fixtureError } =
    await supabaseAdmin
      .from("fixtures")
      .select(`
        fixture_id,
        finished,
        home_score,
        away_score
      `)
      .eq("matchweek_id", gameweek.matchweek_id);

  if (fixtureError) {
    throw fixtureError;
  }

  const fixtureIds =
    gameweekFixtures?.map(
      (fixture) => fixture.fixture_id
    ) ?? [];

  totalMatches = fixtureIds.length;

  /*
   * ---------------------------------------------------------
   * MATCH PREDICTIONS
   * ---------------------------------------------------------
   */

  if (memberId && fixtureIds.length > 0) {
    const { data: matchPicks, error: pickError } =
      await supabaseAdmin
        .from("match_picks")
        .select(`
          fixture_id,
          predicted_result
        `)
        .eq("member_id", memberId)
        .in("fixture_id", fixtureIds);

    if (pickError) {
      throw pickError;
    }

    picksComplete = matchPicks?.length ?? 0;

    for (const pick of matchPicks ?? []) {
      const fixture = gameweekFixtures?.find(
        (item) =>
          item.fixture_id === pick.fixture_id
      );

      /*
       * Only completed fixtures count toward accuracy.
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

      if (fixture.home_score > fixture.away_score) {
        actualResult = "HOME";
      } else if (
        fixture.away_score > fixture.home_score
      ) {
        actualResult = "AWAY";
      } else {
        actualResult = "DRAW";
      }

      if (pick.predicted_result === actualResult) {
        correctPredictions += 1;
      }
    }
  }

  /*
   * ---------------------------------------------------------
   * BONUS PICKS
   * ---------------------------------------------------------
   */

  if (memberId) {
    const [
      goalScorerResult,
      assistsResult,
      cleanSheetResult,
    ] = await Promise.all([
      supabaseAdmin
        .from("goal_scorer_picks")
        .select("player_id")
        .eq("member_id", memberId)
        .eq(
          "matchweek_id",
          gameweek.matchweek_id
        ),

      supabaseAdmin
        .from("assists_picks")
        .select("player_id")
        .eq("member_id", memberId)
        .eq(
          "matchweek_id",
          gameweek.matchweek_id
        ),

      supabaseAdmin
        .from("clean_sheet_picks")
        .select("club_id")
        .eq("member_id", memberId)
        .eq(
          "matchweek_id",
          gameweek.matchweek_id
        ),
    ]);

    if (goalScorerResult.error) {
      throw goalScorerResult.error;
    }

    if (assistsResult.error) {
      throw assistsResult.error;
    }

    if (cleanSheetResult.error) {
      throw cleanSheetResult.error;
    }

    /*
     * -------------------------------------------------------
     * GOALS
     * -------------------------------------------------------
     */

    const { data: gameweekGoals, error: goalsError } =
      await supabaseAdmin
        .from("goals")
        .select(`
          player_id,
          own_goal,
          fixture:fixtures!goals_fixture_id_fkey (
            matchweek_id
          )
        `);

    if (goalsError) {
      throw goalsError;
    }

    const selectedGoalScorers =
      new Set(
        (goalScorerResult.data ?? []).map(
          (pick) => pick.player_id
        )
      );

    goals = (gameweekGoals ?? []).filter(
      (goal: any) =>
        goal.fixture?.matchweek_id ===
          gameweek.matchweek_id &&
        !goal.own_goal &&
        selectedGoalScorers.has(goal.player_id)
    ).length;

    /*
     * -------------------------------------------------------
     * ASSISTS
     * -------------------------------------------------------
     */

    const { data: gameweekAssists, error: assistsError } =
      await supabaseAdmin
        .from("assists")
        .select(`
          player_id,
          fixture:fixtures!assists_fixture_id_fkey (
            matchweek_id
          )
        `);

    if (assistsError) {
      throw assistsError;
    }

    const selectedAssistPlayers =
      new Set(
        (assistsResult.data ?? []).map(
          (pick) => pick.player_id
        )
      );

    assists = (gameweekAssists ?? []).filter(
      (assist: any) =>
        assist.fixture?.matchweek_id ===
          gameweek.matchweek_id &&
        selectedAssistPlayers.has(assist.player_id)
    ).length;

    /*
     * -------------------------------------------------------
     * CLEAN SHEETS
     * -------------------------------------------------------
     */

    const { data: gameweekCleanSheets, error: cleanSheetError } =
      await supabaseAdmin
        .from("clean_sheets")
        .select(`
          club_id,
          fixture:fixtures!clean_sheets_fixture_id_fkey (
            matchweek_id
          )
        `);

    if (cleanSheetError) {
      throw cleanSheetError;
    }

    const selectedCleanSheetClubs =
      new Set(
        (cleanSheetResult.data ?? []).map(
          (pick) => pick.club_id
        )
      );

    cleanSheets = (gameweekCleanSheets ?? []).filter(
      (cleanSheet: any) =>
        cleanSheet.fixture?.matchweek_id ===
          gameweek.matchweek_id &&
        selectedCleanSheetClubs.has(
          cleanSheet.club_id
        )
    ).length;

    bonusPicksComplete =
      (goalScorerResult.data?.length ?? 0) +
      (assistsResult.data?.length ?? 0) +
      (cleanSheetResult.data?.length ?? 0);
  }
}

const submitted =
  totalMatches > 0 &&
  picksComplete === totalMatches &&
  bonusPicksComplete === totalBonusPicks;

  const deadline = gameweek?.deadline
    ? (() => {
        const d = new Date(gameweek.deadline);

        const date = d.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        });

        const time = d.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        return `${date} • ${time}`;
      })()
    : "Friday, Aug 21 • 3:00 PM";
let currentRank: number | null = null;
let rankChange = 0;

if (memberId && gameweek) {
  const liveStandings =
    await getLiveSeasonStandings(
      gameweek.matchweek_id
    );

  const memberLiveStanding =
    liveStandings.find(
      (standing) =>
        standing.member_id === memberId
    );

  if (memberLiveStanding) {
    currentRank =
      memberLiveStanding.rank;
  }

  /*
   * Get standings entering the current
   * gameweek.
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

  for (const score of previousScores ?? []) {
    previousTotals.set(
      score.member_id,
      (previousTotals.get(score.member_id) ?? 0) +
        (score.score ?? 0)
    );
  }

  /*
   * Make sure members with no previous
   * points are still included.
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

  for (const member of allMembers ?? []) {
    if (!previousTotals.has(member.member_id)) {
      previousTotals.set(
        member.member_id,
        0
      );
    }
  }

  /*
   * Sort the standings before this gameweek.
   */
  const previousStandings =
    [...previousTotals.entries()]
      .sort((a, b) => {
        if (b[1] !== a[1]) {
          return b[1] - a[1];
        }

        return a[0] - b[0];
      });

  const previousRank =
    previousStandings.findIndex(
      ([id]) => id === memberId
    ) + 1;

  if (
    previousRank > 0 &&
    currentRank !== null
  ) {
    rankChange =
      previousRank - currentRank;
  }
}
  return {
    gameweek: {
      status: gameweek?.status ?? "UPCOMING",
      number: gameweek?.week_number ?? 1,
      season: season
        ? `${season.start_year}/${String(season.end_year).slice(-2)}`
        : "2026/27",
      deadline,
      progress: 0,
      countdown: "Live Soon",
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

    leaders: leagueLeaders,

    activity: [
      {
        id: 1,
        title: "Players",
        message: `${players.count ?? 0} players synchronized`,
        time: "Just now",
      },
      {
        id: 2,
        title: "Fixtures",
        message: `${fixtures.count ?? 0} fixtures synchronized`,
        time: "Just now",
      },
      {
        id: 3,
        title: "Clubs",
        message: `${clubs.count ?? 0} clubs synchronized`,
        time: "Just now",
      },
    ],
  };
}