import { NextResponse } from "next/server";
import { saveCleanSheetPick } from "@/services/cleanSheetService";

export async function POST(request: Request) {
  try {
    const {
      memberId,
      matchweekId,
      pick,
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

    const result = await saveCleanSheetPick(
      memberId,
      matchweekId,
      pick
    );

    return NextResponse.json(result);

  } catch (error: any) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ??
          "Unable to save clean sheet pick.",
      },
      { status: 500 }
    );

  }
}