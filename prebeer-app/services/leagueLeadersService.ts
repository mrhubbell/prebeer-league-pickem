import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getSeasonStandings } from "@/services/standingsService";

export interface LeagueLeaderStat {
  teamName: string;
  value: number;
}

export interface LeagueLeaders {
  points: LeagueLeaderStat | null;
  matchPredictions: LeagueLeaderStat | null;
  goalscorers: LeagueLeaderStat | null;
  assists: LeagueLeaderStat | null;
  cleanSheets: LeagueLeaderStat | null;
}

type MemberInfo = {
  member_id: number;
  team_name: string;
};

function getTeamName(member: MemberInfo | undefined) {
  return member?.team_name || "Unknown Team";
}

export async function getLeagueLeaders(): Promise<LeagueLeaders> {
  /*
   * Get the current season.
   */
  const { data: currentSeason, error: seasonError } =
    await supabaseAdmin
      .from("seasons")
      .select("season_id")
      .eq("is_current", true)
      .single();

  if (seasonError) throw seasonError;

  const currentSeasonId = currentSeason.season_id;

  /*
   * Get all members so the statistical leaders can display
   * the member's team name.
   */
  const { data: members, error: membersError } =
    await supabaseAdmin
      .from("members")
      .select("member_id, team_name");

  if (membersError) throw membersError;

  const memberMap = new Map<number, MemberInfo>(
    (members ?? []).map((member) => [
      member.member_id,
      member,
    ])
  );

  /*
   * ---------------------------------------------------------
   * 1. POINTS LEADER
   * ---------------------------------------------------------
   *
   * Reuse the existing standings calculation so there is
   * only one source of truth for season points.
   */
  const standings = await getSeasonStandings();

  const pointsLeader =
    standings.length > 0
      ? {
          teamName: standings[0].team_name,
          value: standings[0].season_points,
        }
      : null;

  /*
   * ---------------------------------------------------------
   * 2. MATCH PREDICTION LEADER
   * ---------------------------------------------------------
   *
   * Correct predictions / predictions selected.
   *
   * A member does NOT need to have completed every week.
   * Missing a week simply means fewer predictions in their
   * denominator.
   */
  const { data: matchPicks, error: matchPicksError } =
    await supabaseAdmin
      .from("match_picks")
      .select(`
        member_id,
        fixture_id,
        predicted_result,
        fixtures!match_picks_fixture_id_fkey (
          home_score,
          away_score,
          finished
        )
      `);

  if (matchPicksError) throw matchPicksError;

  const predictionStats = new Map<
    number,
    { selected: number; correct: number }
  >();

  for (const pick of matchPicks ?? []) {
    const fixture = (pick.fixtures as any);

    if (!fixture?.finished) {
      continue;
    }

    if (
      fixture.home_score === null ||
      fixture.away_score === null
    ) {
      continue;
    }

    let actualResult: string;

    if (fixture.home_score > fixture.away_score) {
      actualResult = "HOME";
    } else if (fixture.away_score > fixture.home_score) {
      actualResult = "AWAY";
    } else {
      actualResult = "DRAW";
    }

    const existing = predictionStats.get(
      pick.member_id
    ) ?? {
      selected: 0,
      correct: 0,
    };

    existing.selected += 1;

    if (pick.predicted_result === actualResult) {
      existing.correct += 1;
    }

    predictionStats.set(
      pick.member_id,
      existing
    );
  }

  let matchPredictionLeader: LeagueLeaderStat | null =
    null;

  for (const [memberId, stats] of predictionStats) {
    if (stats.selected === 0) continue;

    const percentage =
      (stats.correct / stats.selected) * 100;

    if (
      !matchPredictionLeader ||
      percentage > matchPredictionLeader.value
    ) {
      matchPredictionLeader = {
        teamName: getTeamName(memberMap.get(memberId)),
        value: percentage,
      };
    }
  }

  /*
   * ---------------------------------------------------------
   * 3. GOALSCORER LEADER
   * ---------------------------------------------------------
   *
   * Count the actual goals scored by players selected by
   * each member.
   *
   * Own goals are excluded, matching the existing scoring
   * service.
   */
  const { data: goalPicks, error: goalPicksError } =
    await supabaseAdmin
      .from("goal_scorer_picks")
      .select("member_id, player_id");

  if (goalPicksError) throw goalPicksError;

  const { data: goals, error: goalsError } =
  await supabaseAdmin
    .from("goals")
    .select(`
      player_id,
      own_goal,
      fixture:fixtures!goals_fixture_id_fkey (
        matchweek:matchweeks!fixtures_matchweek_id_fkey (
          season_id
        )
      )
    `);

  if (goalsError) throw goalsError;

  const goalsByPlayer = new Map<number, number>();

  for (const goal of goals ?? []) {
  if (goal.own_goal) continue;

  const matchweek = (goal.fixture as any)?.matchweek;

  if (matchweek?.season_id !== currentSeasonId) {
    continue;
  }

  goalsByPlayer.set(
    goal.player_id,
    (goalsByPlayer.get(goal.player_id) ?? 0) + 1
  );
}

  const goalsByMember = new Map<number, number>();

  for (const pick of goalPicks ?? []) {
    const goalsScored =
      goalsByPlayer.get(pick.player_id) ?? 0;

    goalsByMember.set(
      pick.member_id,
      (goalsByMember.get(pick.member_id) ?? 0) +
        goalsScored
    );
  }

  let goalscorerLeader: LeagueLeaderStat | null = null;

  for (const [memberId, goalsScored] of goalsByMember) {
  if (goalsScored <= 0) {
    continue;
  }

  if (
    !goalscorerLeader ||
    goalsScored > goalscorerLeader.value
  ) {
    goalscorerLeader = {
      teamName: getTeamName(memberMap.get(memberId)),
      value: goalsScored,
    };
  }
}

  /*
   * ---------------------------------------------------------
   * 4. ASSIST LEADER
   * ---------------------------------------------------------
   *
   * Count actual assists generated by each member's selected
   * players.
   */
  const { data: assistPicks, error: assistPicksError } =
    await supabaseAdmin
      .from("assists_picks")
      .select("member_id, player_id");

  if (assistPicksError) throw assistPicksError;

  const { data: assists, error: assistsError } =
  await supabaseAdmin
    .from("assists")
    .select(`
      player_id,
      fixture:fixtures!assists_fixture_id_fkey (
        matchweek:matchweeks!fixtures_matchweek_id_fkey (
          season_id
        )
      )
    `);

  if (assistsError) throw assistsError;

  const assistsByPlayer = new Map<number, number>();

  for (const assist of assists ?? []) {
  const matchweek = (assist.fixture as any)?.matchweek;

  if (matchweek?.season_id !== currentSeasonId) {
    continue;
  }

  assistsByPlayer.set(
    assist.player_id,
    (assistsByPlayer.get(assist.player_id) ?? 0) + 1
  );
}

  const assistsByMember = new Map<number, number>();

  for (const pick of assistPicks ?? []) {
    const assistCount =
      assistsByPlayer.get(pick.player_id) ?? 0;

    assistsByMember.set(
      pick.member_id,
      (assistsByMember.get(pick.member_id) ?? 0) +
        assistCount
    );
  }

  let assistsLeader: LeagueLeaderStat | null = null;

  for (const [memberId, assistCount] of assistsByMember) {
  if (assistCount <= 0) {
    continue;
  }

  if (
    !assistsLeader ||
    assistCount > assistsLeader.value
  ) {
    assistsLeader = {
      teamName: getTeamName(memberMap.get(memberId)),
      value: assistCount,
    };
  }
}

  /*
   * ---------------------------------------------------------
   * 5. CLEAN SHEET LEADER
   * ---------------------------------------------------------
   *
   * clean_sheets is linked to fixtures, not directly to
   * matchweeks. We therefore use the fixture to determine
   * which matchweek the clean sheet belongs to.
   */

  const { data: cleanSheetPicks, error: cleanSheetPicksError } =
    await supabaseAdmin
      .from("clean_sheet_picks")
      .select("member_id, club_id, matchweek_id");

  if (cleanSheetPicksError) {
    throw cleanSheetPicksError;
  }

  const { data: cleanSheets, error: cleanSheetsError } =
    await supabaseAdmin
      .from("clean_sheets")
      .select("fixture_id, club_id");

  if (cleanSheetsError) {
    throw cleanSheetsError;
  }

  const cleanSheetFixtureIds =
    (cleanSheets ?? []).map(
      (cleanSheet) => cleanSheet.fixture_id
    );

  const { data: cleanSheetFixtures, error: fixtureError } =
    await supabaseAdmin
      .from("fixtures")
      .select("fixture_id, matchweek_id")
      .in("fixture_id", cleanSheetFixtureIds);

  if (fixtureError) {
    throw fixtureError;
  }

  const fixtureMatchweekMap = new Map<number, number>();

  for (const fixture of cleanSheetFixtures ?? []) {
    fixtureMatchweekMap.set(
      fixture.fixture_id,
      fixture.matchweek_id
    );
  }

  const cleanSheetSet = new Set<string>();

  for (const cleanSheet of cleanSheets ?? []) {
    const matchweekId = fixtureMatchweekMap.get(
      cleanSheet.fixture_id
    );

    if (matchweekId === undefined) {
      continue;
    }

    cleanSheetSet.add(
      `${matchweekId}-${cleanSheet.club_id}`
    );
  }

  const cleanSheetsByMember = new Map<number, number>();

  for (const pick of cleanSheetPicks ?? []) {
    const key = `${pick.matchweek_id}-${pick.club_id}`;

    if (!cleanSheetSet.has(key)) {
      continue;
    }

    cleanSheetsByMember.set(
      pick.member_id,
      (cleanSheetsByMember.get(pick.member_id) ?? 0) + 1
    );
  }

  let cleanSheetLeader: LeagueLeaderStat | null = null;

  for (const [memberId, cleanSheetCount] of cleanSheetsByMember) {
    if (
      !cleanSheetLeader ||
      cleanSheetCount > cleanSheetLeader.value
    ) {
      cleanSheetLeader = {
        teamName: getTeamName(
          memberMap.get(memberId)
        ),
        value: cleanSheetCount,
      };
    }
  }

  return {
    points: pointsLeader,
    matchPredictions: matchPredictionLeader,
    goalscorers: goalscorerLeader,
    assists: assistsLeader,
    cleanSheets: cleanSheetLeader,
  };
}