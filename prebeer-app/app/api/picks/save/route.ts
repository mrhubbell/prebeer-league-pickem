import { NextResponse } from "next/server";
import { saveMemberPicks } from "@/services/picksService";

export async function POST(request: Request) {
  try {
    const { memberId, selections } = await request.json();

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

    const picks = Object.entries(
  selections as Record<number, string>
).map(([fixtureId, predictedResult]) => ({
  fixture_id: Number(fixtureId),
  predicted_result: predictedResult,
}));

    const result = await saveMemberPicks(memberId, picks);

    return NextResponse.json(result);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save picks.",
      },
      {
        status: 500,
      }
    );
  }
}