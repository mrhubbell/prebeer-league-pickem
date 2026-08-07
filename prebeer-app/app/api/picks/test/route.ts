import { NextResponse } from "next/server";
import { getCurrentGameweekFixtures } from "@/services/picksService";

export async function GET() {
  try {
    const data = await getCurrentGameweekFixtures();

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: err?.message,
        details: err,
      },
      { status: 500 }
    );
  }
}