import { NextResponse } from "next/server";
import { getMemberPicks } from "@/services/picksService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const memberId = Number(searchParams.get("memberId"));

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

    const selections = await getMemberPicks(memberId);

    return NextResponse.json({
      success: true,
      selections,
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