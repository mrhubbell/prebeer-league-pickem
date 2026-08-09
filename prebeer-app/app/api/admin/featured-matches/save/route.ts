import { NextResponse } from "next/server";
import { saveFeaturedMatches } from "@/services/picksService";
import { requireCommissioner } from "@/lib/requireCommissioner";

export async function POST(request: Request) {
  try {
    await requireCommissioner(request);

    const {
      matchweekId,
      featuredMatchFixtureId,
      gameOfTheWeekFixtureId,
    } = await request.json();

    const result = await saveFeaturedMatches(
      matchweekId,
      featuredMatchFixtureId,
      gameOfTheWeekFixtureId
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(
      "Commissioner featured match error:",
      error
    );

    if (error?.message === "NOT_AUTHENTICATED") {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    if (error?.message === "NOT_COMMISSIONER") {
      return NextResponse.json(
        {
          success: false,
          message: "Commissioner access required.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save featured matches.",
      },
      { status: 500 }
    );
  }
}