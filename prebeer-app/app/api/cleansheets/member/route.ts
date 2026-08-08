import { NextResponse } from "next/server";
import { getCleanSheetPick } from "@/services/cleanSheetService";

export async function GET(request: Request) {
  try {

    const { searchParams } =
      new URL(request.url);

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
        { status: 400 }
      );
    }

    const pick =
      await getCleanSheetPick(
        memberId,
        matchweekId
      );

    return NextResponse.json({
      success: true,
      pick,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load clean sheet pick.",
      },
      { status: 500 }
    );

  }
}