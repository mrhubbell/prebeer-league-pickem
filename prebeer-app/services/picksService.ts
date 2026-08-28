import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getCurrentGameweekFixtures() {
  const { data: gameweek, error: gameweekError } =
    await supabaseAdmin
      .from("matchweeks")
      .select(`
  matchweek_id,
  week_number,
  status,
  featured_match_fixture_id,
  game_of_the_week_fixture_id
`)
      .eq("status", "OPEN")
      .order("week_number")
      .limit(1)
      .single();

  if (gameweekError || !gameweek) {
    throw new Error("No open gameweek found.");
  }

  const { data: fixtures, error: fixtureError } =
    await supabaseAdmin
      .from("fixtures")
      .select(`
        fixture_id,
        kickoff_time,
        home_club_id,
        away_club_id,
        home_score,
        away_score,
        finished,
        clubs!fixtures_home_club_id_fkey (
          club_name,
          badge_code
        ),
        away:clubs!fixtures_away_club_id_fkey (
          club_name,
          badge_code
        )
      `)
      .eq("matchweek_id", gameweek.matchweek_id)
      .order("kickoff_time");

  if (fixtureError) throw fixtureError;

  return {
  weekNumber: gameweek.week_number,
  matchweekId: gameweek.matchweek_id,
  status: gameweek.status,
  featuredMatchFixtureId:
    gameweek.featured_match_fixture_id,
  gameOfTheWeekFixtureId:
      gameweek.game_of_the_week_fixture_id,
    fixtures,
  };
}

export async function getGameweekFixtures(
  matchweekId: number
) {
  const { data: gameweek, error: gameweekError } =
    await supabaseAdmin
      .from("matchweeks")
      .select(`
        matchweek_id,
        week_number,
        status,
        featured_match_fixture_id,
        game_of_the_week_fixture_id
      `)
      .eq("matchweek_id", matchweekId)
      .single();

  if (gameweekError || !gameweek) {
    throw new Error("Gameweek not found.");
  }

  const { data: fixtures, error: fixtureError } =
    await supabaseAdmin
      .from("fixtures")
      .select(`
        fixture_id,
        kickoff_time,
        home_club_id,
        away_club_id,
        home_score,
        away_score,
        finished,
        clubs!fixtures_home_club_id_fkey (
          club_name,
          badge_code
        ),
        away:clubs!fixtures_away_club_id_fkey (
          club_name,
          badge_code
        )
      `)
      .eq("matchweek_id", matchweekId)
      .order("kickoff_time");

  if (fixtureError) throw fixtureError;

  return {
    weekNumber: gameweek.week_number,
    matchweekId: gameweek.matchweek_id,
    status: gameweek.status,
    featuredMatchFixtureId:
      gameweek.featured_match_fixture_id,
    gameOfTheWeekFixtureId:
      gameweek.game_of_the_week_fixture_id,
    fixtures,
  };
}

export async function getAvailableGameweeks() {
  const { data, error } = await supabaseAdmin
    .from("matchweeks")
    .select(`
      matchweek_id,
      week_number,
      status
    `)
    .in("status", ["OPEN", "LOCKED"])
    .order("week_number", {
      ascending: true,
    });

  if (error) throw error;

  return data ?? [];
}

export async function saveMemberPicks(
  memberId: number,
  picks: {
    fixture_id: number;
    predicted_result: string;
  }[]
) {
  const fixtureIds = picks.map(
    (p) => p.fixture_id
  );

  const { data: fixtures, error: fixtureError } =
    await supabaseAdmin
      .from("fixtures")
      .select(
        "fixture_id, kickoff_time"
      )
      .in(
        "fixture_id",
        fixtureIds
      );

  if (fixtureError) throw fixtureError;

  // Use the actual current time in production.
  const now = new Date();

  const unlockedFixtureIds =
    new Set(
      fixtures
        .filter(
          (fixture) =>
            new Date(
              fixture.kickoff_time
            ) > now
        )
        .map(
          (fixture) =>
            fixture.fixture_id
        )
    );

  const rows =
    picks
      .filter(
        (pick) =>
          unlockedFixtureIds.has(
            pick.fixture_id
          )
      )
      .map(
        (pick) => ({
          member_id: memberId,
          fixture_id:
            pick.fixture_id,
          predicted_result:
            pick.predicted_result,
        })
      );

  if (rows.length > 0) {
    const { error } =
      await supabaseAdmin
        .from("match_picks")
        .upsert(rows, {
          onConflict:
            "member_id,fixture_id",
        });

    if (error) throw error;
  }

  return {
    success: true,
    saved: rows.length,
    locked:
      picks.length -
      rows.length,
  };
}

export async function getMemberPicks(
  memberId: number,
  matchweekId?: number
) {
  let query = supabaseAdmin
    .from("match_picks")
    .select(`
      fixture_id,
      predicted_result,
      fixtures!match_picks_fixture_id_fkey (
        matchweek_id
      )
    `)
    .eq(
      "member_id",
      memberId
    );

  const { data, error } = await query;

  if (error) throw error;

  const selections: Record<
    number,
    string
  > = {};

  data.forEach((pick) => {
    const fixture =
      pick.fixtures as any;

    if (
      matchweekId &&
      fixture?.matchweek_id !== matchweekId
    ) {
      return;
    }

    selections[
      pick.fixture_id
    ] =
      pick.predicted_result;
  });

  return selections;
}

export async function saveFeaturedMatches(
  matchweekId: number,
  featuredMatchFixtureId: number | null,
  gameOfTheWeekFixtureId: number | null
) {
  const { error } =
    await supabaseAdmin
      .from("matchweeks")
      .update({
        featured_match_fixture_id:
          featuredMatchFixtureId,
        game_of_the_week_fixture_id:
          gameOfTheWeekFixtureId,
      })
      .eq(
        "matchweek_id",
        matchweekId
      );

  if (error) throw error;

  return {
    success: true,
  };
}

export async function getGameweekPickStatus(
  matchweekId: number
) {
  // Get all active league members
  const { data: members, error: memberError } =
    await supabaseAdmin
      .from("members")
      .select(
        "member_id, display_name"
      )
      .eq("active", true)
      .order("display_name");

  if (memberError) throw memberError;

  // Get all fixtures for this Gameweek
  const { data: fixtures, error: fixtureError } =
    await supabaseAdmin
      .from("fixtures")
      .select("fixture_id")
      .eq(
        "matchweek_id",
        matchweekId
      );

  if (fixtureError) throw fixtureError;

  const fixtureIds =
    (fixtures ?? []).map(
      (fixture) =>
        fixture.fixture_id
    );

  // Get all match picks for these fixtures
  const { data: picks, error: pickError } =
    fixtureIds.length > 0
      ? await supabaseAdmin
          .from("match_picks")
          .select(
            "member_id, fixture_id"
          )
          .in(
            "fixture_id",
            fixtureIds
          )
      : {
          data: [],
          error: null,
        };

  if (pickError) throw pickError;

  // Count picks submitted by each member
  const picksByMember =
    new Map<number, number>();

  for (const pick of picks ?? []) {
    picksByMember.set(
      pick.member_id,
      (picksByMember.get(
        pick.member_id
      ) ?? 0) + 1
    );
  }

  // Build submission status
  return (members ?? []).map(
    (member) => {
      const picksSubmitted =
        picksByMember.get(
          member.member_id
        ) ?? 0;

      const totalPicks =
        fixtureIds.length;

      const submitted =
        totalPicks > 0 &&
        picksSubmitted >= totalPicks;

      return {
        memberId:
          member.member_id,

        displayName:
          member.display_name,

        submitted,

        picksSubmitted,

        totalPicks,
      };
    }
  );
}