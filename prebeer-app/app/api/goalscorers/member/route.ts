import { NextResponse } from "next/server";
import { getGoalScorerPicks } from "@/services/goalScorerService";

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
          message: "Missing parameters.",
        },
        {
          status: 400,
        }
      );
    }

    const picks = await getGoalScorerPicks(
      memberId,
      matchweekId
    );

    return NextResponse.json({
      success: true,
      picks,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load goalscorer picks.",
      },
      {
        status: 500,
      }
    );
  }
}