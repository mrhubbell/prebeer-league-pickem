import { NextResponse } from "next/server";
import { saveFeaturedMatches } from "@/services/picksService";

export async function POST(request: Request) {
  try {
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
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save featured matches.",
      },
      {
        status: 500,
      }
    );
  }
}