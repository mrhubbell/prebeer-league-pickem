import { NextResponse } from "next/server";

import {
  getMemberPicks,
  getGameweekFixtures,
} from "@/services/picksService";

import {
  getGoalsForMatchweek,
  getAssistsForMatchweek,
} from "@/services/gameweekDataService";

import { getGoalScorerPicks } from "@/services/goalScorerService";
import { getAssistPicks } from "@/services/assistService";
import { getCleanSheetPick } from "@/services/cleanSheetService";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const memberId = Number(
      searchParams.get("memberId")
    );

    const matchweekId = Number(
      searchParams.get("matchweekId")
    );

    if (!memberId || !matchweekId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing memberId or matchweekId.",
        },
        {
          status: 400,
        }
      );
    }

    const [
      gameweek,
      selections,
      goalScorers,
      assists,
      cleanSheet,
      goals,
      actualAssists,
      cleanSheets,
    ] = await Promise.all([
      getGameweekFixtures(matchweekId),
      getMemberPicks(memberId, matchweekId),
      getGoalScorerPicks(memberId, matchweekId),
      getAssistPicks(memberId, matchweekId),
      getCleanSheetPick(memberId, matchweekId),
      getGoalsForMatchweek(matchweekId),
      getAssistsForMatchweek(matchweekId),
      supabaseAdmin
        .from("clean_sheets")
        .select(`
          fixture_id,
          club_id
        `),
    ]);

    const cleanSheetData =
      cleanSheets.data ?? [];

    if (cleanSheets.error) {
      throw cleanSheets.error;
    }

    const matchResults: Record<
      number,
      string
    > = {};

    for (const fixture of gameweek.fixtures) {
      if (
        fixture.home_score === null ||
        fixture.away_score === null
      ) {
        continue;
      }

      if (
        fixture.home_score >
        fixture.away_score
      ) {
        matchResults[fixture.fixture_id] =
          "HOME";
      } else if (
        fixture.away_score >
        fixture.home_score
      ) {
        matchResults[fixture.fixture_id] =
          "AWAY";
      } else {
        matchResults[fixture.fixture_id] =
          "DRAW";
      }
    }

    const goalResults: Record<
      number,
      number
    > = {};

    for (const goal of goals) {
      goalResults[goal.player_id] =
        (goalResults[goal.player_id] ?? 0) + 1;
    }

    const assistResults: Record<
      number,
      number
    > = {};

    for (const assist of actualAssists) {
      assistResults[assist.player_id] =
        (assistResults[assist.player_id] ?? 0) + 1;
    }

    const matchweekFixtureIds =
      new Set(
        gameweek.fixtures.map(
          (fixture) =>
            fixture.fixture_id
        )
      );

    const matchweekCleanSheets =
      cleanSheetData.filter(
        (cleanSheet: any) =>
          matchweekFixtureIds.has(
            cleanSheet.fixture_id
          )
      );

    const cleanSheetResults =
      matchweekCleanSheets.map(
        (cleanSheet: any) =>
          cleanSheet.club_id
      );

    return NextResponse.json({
      success: true,
      gameweek,
      selections,
      goalScorers,
      assists,
      cleanSheet,
      results: {
        matchResults,
        goalResults,
        assistResults,
        cleanSheetResults,
      },
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load picks.",
      },
      {
        status: 500,
      }
    );
  }
}