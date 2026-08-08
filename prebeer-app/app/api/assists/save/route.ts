import { NextResponse } from "next/server";
import { saveAssistPicks } from "@/services/assistService";

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
        { status: 400 }
      );
    }

    if (!matchweekId) {
      return NextResponse.json(
        {
          success: false,
          message: "No matchweek selected.",
        },
        { status: 400 }
      );
    }

    const result = await saveAssistPicks(
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
          "Unable to save assist picks.",
      },
      { status: 500 }
    );

  }
}