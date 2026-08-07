import { NextResponse } from "next/server";
import { syncFixtures } from "@/services/fpl/fixtures";

export async function GET() {
  try {
    const result = await syncFixtures();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: err,
      },
      { status: 500 }
    );
  }
}