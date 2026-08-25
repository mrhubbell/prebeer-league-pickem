import { NextResponse } from "next/server";

import { getMemberPicks, getGameweekFixtures } from "@/services/picksService";
import { getGoalScorerPicks } from "@/services/goalScorerService";
import { getAssistPicks } from "@/services/assistService";
import { getCleanSheetPick } from "@/services/cleanSheetService";

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
    ] = await Promise.all([
      getGameweekFixtures(matchweekId),
      getMemberPicks(memberId, matchweekId),
      getGoalScorerPicks(memberId, matchweekId),
      getAssistPicks(memberId, matchweekId),
      getCleanSheetPick(memberId, matchweekId),
    ]);

    return NextResponse.json({
      success: true,
      gameweek,
      selections,
      goalScorers,
      assists,
      cleanSheet,
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