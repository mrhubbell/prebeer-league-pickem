import { NextResponse } from "next/server";
import { saveGoalScorerPicks } from "@/services/goalScorerService";

export async function POST(request: Request) {
  try {
    const {
      memberId,
      matchweekId,
      picks,
    } = await request.json();

    if (!memberId) {
      return NextResponse.json(
        {
          success: false,
          message: "No member selected.",
        },
        {
          status: 400,
        }
      );
    }

    if (!matchweekId) {
      return NextResponse.json(
        {
          success: false,
          message: "No matchweek selected.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await saveGoalScorerPicks(
      memberId,
      matchweekId,
      picks
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ??
          "Unable to save goalscorer picks.",
      },
      {
        status: 500,
      }
    );
  }
}